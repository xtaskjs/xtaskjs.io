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
    query(sql: string): Promise<unknown>;
    end(): Promise<void>;
  };
};

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const waitForChildExit = (
  child: ChildProcess,
): Promise<{ code: number | null; signal: NodeJS.Signals | null }> =>
  new Promise((resolve) => {
    child.once("exit", (code, signal) => {
      resolve({ code, signal });
    });
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

const findAvailablePort = async (): Promise<number> => {
  return new Promise((resolve, reject) => {
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
};

const waitForHttpReady = async (url: string, timeoutMs = 180000): Promise<void> => {
  const start = Date.now();
  let lastStatus: number | undefined;
  let lastBody = "";

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }

      lastStatus = response.status;
      lastBody = (await response.text()).slice(0, 1000);
    } catch {
      // keep polling until timeout
    }

    await wait(500);
  }

  const responseDetails =
    lastStatus === undefined ? "" : ` (last status: ${lastStatus}, body: ${JSON.stringify(lastBody)})`;
  throw new Error(`Timed out waiting for HTTP readiness at ${url}${responseDetails}`);
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

type RunningDocsApp = {
  readonly postgres: EphemeralPostgres;
  readonly publicUrl: string;
  readonly output: () => string;
  readonly exited: Promise<{ code: number | null; signal: NodeJS.Signals | null }>;
  stop(): Promise<void>;
};

const startEphemeralPostgres = async (): Promise<EphemeralPostgres> => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const containerName = `xtaskjs-docs-e2e-${suffix}`;
  const database = `xtaskjs_e2e_${suffix.replace(/-/g, "_")}`;
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
    const port = await waitForDockerPort(containerName);
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

const waitForDockerPort = async (containerName: string, timeoutMs = 30000): Promise<number> => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const { stdout } = await execFileAsync("docker", ["port", containerName, "5432/tcp"]);
      const match = stdout.match(/:(\d+)\s*$/m);
      if (match) {
        return Number(match[1]);
      }
    } catch {
      // keep polling until timeout
    }

    await wait(250);
  }

  throw new Error(`Timed out waiting for mapped Postgres port on container ${containerName}`);
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

      if (status === "unhealthy" || status === "exited" || status === "dead") {
        throw new Error(`Postgres container entered status ${status}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("entered status")) {
        throw error;
      }
    }

    await wait(500);
  }

  throw new Error(`Timed out waiting for Postgres health on container ${containerName}`);
};

const waitForPostgresConnection = async (
  postgres: Pick<EphemeralPostgres, "host" | "port" | "database" | "username" | "password">,
  timeoutMs = 30000,
): Promise<void> => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const client = new Client({
      host: postgres.host,
      port: postgres.port,
      database: postgres.database,
      user: postgres.username,
      password: postgres.password,
      connectionTimeoutMillis: 2000,
    });

    try {
      await client.connect();
      await client.query("select 1");
      return;
    } catch {
      await wait(500);
    } finally {
      await client.end().catch(() => undefined);
    }
  }

  throw new Error(
    `Timed out connecting to Postgres at ${postgres.host}:${postgres.port}/${postgres.database}`,
  );
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

    if (child.exitCode !== null || child.signalCode !== null) {
      finish();
      return;
    }

    child.kill("SIGTERM");
  });
};

const startDocsApp = async (): Promise<RunningDocsApp> => {
  const postgres = await startEphemeralPostgres();
  await waitForPostgresConnection(postgres);

  const port = await findAvailablePort();
  const publicUrl = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    ["--import", "tsx", "server.ts"],
    {
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
        MAILTRAP_SMTP_USER: process.env.MAILTRAP_SMTP_USER || "",
        MAILTRAP_SMTP_PASS: process.env.MAILTRAP_SMTP_PASS || "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  let output = "";
  child.stdout.on("data", (chunk) => {
    output += String(chunk);
  });
  child.stderr.on("data", (chunk) => {
    output += String(chunk);
  });

  const childExit = waitForChildExit(child);

  return {
    postgres,
    publicUrl,
    output: () => output,
    exited: childExit,
    async stop() {
      await stopProcess(child);
      await postgres.cleanup();
    },
  } satisfies RunningDocsApp;
};

const waitForDocsPage = async (app: RunningDocsApp, path: string): Promise<void> => {
  try {
    await Promise.race([
      waitForHttpReady(`${app.publicUrl}${path}`),
      app.exited.then(({ code, signal }) => {
        const startupOutput = app.output().trim();
        const details = startupOutput.length > 0 ? `\n\nStartup output:\n${startupOutput}` : "";
        throw new Error(`Application exited before HTTP readiness (code: ${code}, signal: ${signal})${details}`);
      }),
    ]);
  } catch (error) {
    const startupOutput = app.output().trim();
    const details = startupOutput.length > 0 ? `\n\nStartup output:\n${startupOutput}` : "";
    throw new Error(
      error instanceof Error ? `${error.message}${details}` : `HTTP readiness failed${details}`,
    );
  }
};

test("documentation package detail page renders generated API groups over HTTP", { timeout: 240000 }, async (t) => {
  const dockerAvailable = await isDockerAvailable();

  if (!dockerAvailable) {
    t.skip("Docker is not available for ephemeral Postgres provisioning");
    return;
  }

  const app = await startDocsApp();
  t.after(async () => {
    await app.stop();
  });

  await waitForDocsPage(app, "/documentation/packages/core");

  const response = await fetch(`${app.publicUrl}/documentation/packages/core`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /@xtaskjs\/core/);
  assert.match(html, /Bootstrap and app/);
  assert.match(html, /CreateApplication/);
  assert.match(html, /DI and components/);
  assert.doesNotMatch(app.output(), /Failed to start server:/);
});

test("documentation CLI page renders installation and command examples over HTTP", { timeout: 240000 }, async (t) => {
  const dockerAvailable = await isDockerAvailable();

  if (!dockerAvailable) {
    t.skip("Docker is not available for ephemeral Postgres provisioning");
    return;
  }

  const app = await startDocsApp();
  t.after(async () => {
    await app.stop();
  });

  await waitForDocsPage(app, "/documentation/cli");

  const response = await fetch(`${app.publicUrl}/documentation/cli`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /@xtaskjs\/cli/);
  assert.match(html, /npm install -g @xtaskjs\/cli/);
  assert.match(html, /Create a cache-ready application/);
  assert.match(html, /xtask create &lt;project-name&gt; \[directory\] \[options\]/);
  assert.match(html, /xtask generate resource billing --path src\/modules --crud/);
  assert.match(html, /xtask generate resource cache-entries --path src\/modules --crud --with-dto/);
  assert.match(html, /--package-manager &lt;manager&gt;/);
  assert.match(html, /--with-guard/);
  assert.match(html, /does not ship a dedicated cache generator/);
  assert.doesNotMatch(app.output(), /Failed to start server:/);
});