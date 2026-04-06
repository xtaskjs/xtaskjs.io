import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { execFile, spawn, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const { Client } = require("pg") as {
  Client: new (config: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    connectionTimeoutMillis: number;
  }) => {
    connect(): Promise<void>;
    query(sql: string, values?: unknown[]): Promise<{ rows: unknown[] }>;
    end(): Promise<void>;
  };
};

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const waitForChildExit = (
  child: ChildProcess,
): Promise<{ code: number | null; signal: NodeJS.Signals | null }> =>
  new Promise((resolve) => {
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });

const isTcpPortOpen = (host: string, port: number): Promise<boolean> =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host, port });

    const finish = (value: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(value);
    };

    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.setTimeout(1500, () => finish(false));
  });

const findAvailablePort = async (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not determine an available port"));
        return;
      }

      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(port);
      });
    });
    server.on("error", reject);
  });

const waitForHttpReady = async (url: string, timeoutMs = 180000): Promise<void> => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // keep polling until timeout
    }

    await wait(500);
  }

  throw new Error(`Timed out waiting for HTTP readiness at ${url}`);
};

const isDockerAvailable = async (): Promise<boolean> => {
  try {
    await execFileAsync("docker", ["info"]);
    return true;
  } catch {
    return false;
  }
};

type EphemeralPostgres = {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  cleanup(): Promise<void>;
};

type EphemeralRedis = {
  readonly host: string;
  readonly port: number;
  readonly url: string;
  cleanup(): Promise<void>;
};

const waitForDockerPort = async (containerName: string, containerPort: string, timeoutMs = 30000): Promise<number> => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const { stdout } = await execFileAsync("docker", ["port", containerName, containerPort]);
      const match = stdout.match(/:(\d+)\s*$/m);
      if (match) {
        return Number(match[1]);
      }
    } catch {
      // keep polling until timeout
    }

    await wait(250);
  }

  throw new Error(`Timed out waiting for mapped port ${containerPort} on container ${containerName}`);
};

const waitForDockerHealth = async (containerName: string, timeoutMs = 45000): Promise<void> => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const { stdout } = await execFileAsync("docker", [
        "inspect",
        "-f",
        "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}",
        containerName,
      ]);
      const status = stdout.trim();

      if (status === "healthy" || status === "running") {
        return;
      }
    } catch {
      // keep polling until timeout
    }

    await wait(500);
  }

  throw new Error(`Timed out waiting for Docker health on container ${containerName}`);
};

const startEphemeralPostgres = async (): Promise<EphemeralPostgres> => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const containerName = `xtaskjs-read-replica-${suffix}`;
  const database = `xtaskjs_write_${suffix.replace(/-/g, "_")}`;
  const username = "xtask";
  const password = "xtask";

  await execFileAsync("docker", [
    "run",
    "--rm",
    "-d",
    "--name",
    containerName,
    "-e",
    `POSTGRES_DB=${database}`,
    "-e",
    `POSTGRES_USER=${username}`,
    "-e",
    `POSTGRES_PASSWORD=${password}`,
    "-p",
    "127.0.0.1::5432",
    "--health-cmd",
    `pg_isready -U ${username} -d ${database}`,
    "--health-interval",
    "1s",
    "--health-timeout",
    "5s",
    "--health-retries",
    "30",
    "postgres:16-alpine",
  ]);

  try {
    const port = await waitForDockerPort(containerName, "5432/tcp");
    await waitForDockerHealth(containerName);

    return {
      host: "127.0.0.1",
      port,
      database,
      username,
      password,
      async cleanup() {
        await execFileAsync("docker", ["rm", "-f", containerName]).catch(() => undefined);
      },
    };
  } catch (error) {
    await execFileAsync("docker", ["rm", "-f", containerName]).catch(() => undefined);
    throw error;
  }
};

const startEphemeralRedis = async (): Promise<EphemeralRedis> => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const containerName = `xtaskjs-read-replica-redis-${suffix}`;

  await execFileAsync("docker", [
    "run",
    "--rm",
    "-d",
    "--name",
    containerName,
    "-p",
    "127.0.0.1::6379",
    "redis:7-alpine",
    "redis-server",
    "--save",
    "",
    "--appendonly",
    "no",
  ]);

  try {
    const port = await waitForDockerPort(containerName, "6379/tcp");
    return {
      host: "127.0.0.1",
      port,
      url: `redis://127.0.0.1:${port}`,
      async cleanup() {
        await execFileAsync("docker", ["rm", "-f", containerName]).catch(() => undefined);
      },
    };
  } catch (error) {
    await execFileAsync("docker", ["rm", "-f", containerName]).catch(() => undefined);
    throw error;
  }
};

const createDatabase = async (postgres: EphemeralPostgres, databaseName: string): Promise<void> => {
  const client = new Client({
    host: postgres.host,
    port: postgres.port,
    database: "postgres",
    user: postgres.username,
    password: postgres.password,
    connectionTimeoutMillis: 2000,
  });

  await client.connect();
  try {
    await client.query(`CREATE DATABASE ${databaseName}`);
  } finally {
    await client.end();
  }
};

const createReadNewsSchema = async (postgres: EphemeralPostgres, databaseName: string): Promise<void> => {
  const client = new Client({
    host: postgres.host,
    port: postgres.port,
    database: databaseName,
    user: postgres.username,
    password: postgres.password,
    connectionTimeoutMillis: 2000,
  });

  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id integer PRIMARY KEY,
        title character varying(180) NOT NULL,
        slug character varying(180) NOT NULL,
        summary text NOT NULL,
        content text NOT NULL,
        image_url character varying(255),
        is_published boolean NOT NULL DEFAULT false,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `);
  } finally {
    await client.end();
  }
};

const insertNews = async (
  postgres: EphemeralPostgres,
  databaseName: string,
  title: string,
): Promise<void> => {
  const client = new Client({
    host: postgres.host,
    port: postgres.port,
    database: databaseName,
    user: postgres.username,
    password: postgres.password,
    connectionTimeoutMillis: 2000,
  });

  await client.connect();
  try {
    await client.query(
      `
        INSERT INTO news (id, title, slug, summary, content, image_url, is_published, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NULL, true, now(), now())
      `,
      [1, title, title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), `${title} summary`, `${title} content`],
    );
  } finally {
    await client.end();
  }
};

const stopProcess = async (child: ChildProcess): Promise<void> => {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timer);
      child.removeListener("exit", finish);
      child.removeListener("close", finish);
      resolve();
    };

    const timer = setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill("SIGKILL");
      }
      setTimeout(finish, 1000);
    }, 8000);

    child.once("exit", finish);
    child.once("close", finish);
    child.kill("SIGTERM");
  });
};

test("public news page reads from the configured read database instead of the write database", { timeout: 240000 }, async (t) => {
  if (!(await isDockerAvailable())) {
    t.skip("Docker is not available for ephemeral Postgres provisioning");
    return;
  }

  const postgres = await startEphemeralPostgres();
  const redis = await startEphemeralRedis();
  const readDatabase = `${postgres.database}_read`;

  let child: ChildProcess | undefined;

  t.after(async () => {
    if (child) {
      await stopProcess(child).catch(() => undefined);
    }
    await redis.cleanup().catch(() => undefined);
    await postgres.cleanup().catch(() => undefined);
  });

  await createDatabase(postgres, readDatabase);
  await createReadNewsSchema(postgres, readDatabase);

  const port = await findAvailablePort();
  const publicUrl = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ["--import", "tsx", "server.ts"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      PUBLIC_URL: publicUrl,
      POSTGRES_HOST: postgres.host,
      POSTGRES_PORT: String(postgres.port),
      POSTGRES_DB: postgres.database,
      POSTGRES_USER: postgres.username,
      POSTGRES_PASSWORD: postgres.password,
      READ_POSTGRES_HOST: postgres.host,
      READ_POSTGRES_PORT: String(postgres.port),
      READ_POSTGRES_DB: readDatabase,
      READ_POSTGRES_USER: postgres.username,
      READ_POSTGRES_PASSWORD: postgres.password,
      REDIS_URL: redis.url,
      QUERY_CACHE_TTL: "1s",
      MAIL_TRANSPORT_PROVIDER: "json",
      MAIL_NOTIFICATIONS_TRANSPORT_PROVIDER: "json",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  child.stdout?.on("data", (chunk) => {
    output += String(chunk);
  });
  child.stderr?.on("data", (chunk) => {
    output += String(chunk);
  });

  await Promise.race([
    waitForHttpReady(`${publicUrl}/news`),
    waitForChildExit(child).then(({ code, signal }) => {
      throw new Error(`Application exited before readiness (code: ${code}, signal: ${signal})\n${output}`);
    }),
  ]);

  await insertNews(postgres, postgres.database, "Write Only News");

  const staleResponse = await fetch(`${publicUrl}/news`);
  const staleHtml = await staleResponse.text();

  assert.equal(staleResponse.status, 200);
  assert.doesNotMatch(staleHtml, /Write Only News/);

  await insertNews(postgres, readDatabase, "Replica News");
  await wait(1500);

  const replicatedResponse = await fetch(`${publicUrl}/news`);
  const replicatedHtml = await replicatedResponse.text();

  assert.equal(replicatedResponse.status, 200);
  assert.match(replicatedHtml, /Replica News/);
});