import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { execFile, spawn, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";
import { SESSION_COOKIE_NAME } from "../../src/auth/domain/session";
import { AppConfig } from "../../src/shared/infrastructure/config/app-config";

const jsonwebtoken = require("jsonwebtoken") as {
  sign: (payload: Record<string, unknown>, secret: string, options?: Record<string, unknown>) => string;
};

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

type EphemeralRedis = {
  readonly host: string;
  readonly port: number;
  readonly url: string;
  cleanup(): Promise<void>;
};

type RunningDocsApp = {
  readonly postgres: EphemeralPostgres;
  readonly redis: EphemeralRedis;
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

const startEphemeralRedis = async (): Promise<EphemeralRedis> => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const containerName = `xtaskjs-docs-redis-e2e-${suffix}`;

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
    const port = await waitForRedisPort(containerName);
    await waitForRedisConnection("127.0.0.1", port);

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

const waitForRedisPort = async (containerName: string, timeoutMs = 30000): Promise<number> => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const { stdout } = await execFileAsync("docker", ["port", containerName, "6379/tcp"]);
      const match = stdout.match(/:(\d+)\s*$/m);
      if (match) {
        return Number(match[1]);
      }
    } catch {
      // keep polling until timeout
    }

    await wait(250);
  }

  throw new Error(`Timed out waiting for mapped Redis port on container ${containerName}`);
};

const waitForRedisConnection = async (host: string, port: number, timeoutMs = 30000): Promise<void> => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await isTcpPortOpen(host, port)) {
      return;
    }

    await wait(250);
  }

  throw new Error(`Timed out connecting to Redis at ${host}:${port}`);
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
  const redis = await startEphemeralRedis();

  try {
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
          REDIS_URL: redis.url,
          MAIL_TRANSPORT_PROVIDER: "json",
          MAIL_NOTIFICATIONS_TRANSPORT_PROVIDER: "json",
          MAILTRAP_SMTP_USER: "",
          MAILTRAP_SMTP_PASS: "",
          MAILTRAP_SMTP_HOST: "",
          MAILTRAP_SMTP_PORT: "",
          MAILTRAP_SMTP_SECURE: "false",
          MAIL_SMTP_USER: "",
          MAIL_SMTP_PASS: "",
          MAIL_SMTP_HOST: "",
          MAIL_SMTP_PORT: "",
          MAIL_SMTP_SECURE: "false",
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
      redis,
      publicUrl,
      output: () => output,
      exited: childExit,
      async stop() {
        await stopProcess(child);
        await redis.cleanup();
        await postgres.cleanup();
      },
    } satisfies RunningDocsApp;
  } catch (error) {
    await redis.cleanup().catch(() => undefined);
    await postgres.cleanup().catch(() => undefined);
    throw error;
  }
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
  assert.match(response.headers.get("cache-control") || "", /private/);
  assert.match(response.headers.get("vary") || "", /accept-language/i);
  assert.match(response.headers.get("vary") || "", /cookie/i);
  assert.ok(response.headers.get("etag"));
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
  assert.match(response.headers.get("cache-control") || "", /private/);
  assert.match(response.headers.get("vary") || "", /accept-language/i);
  assert.match(response.headers.get("vary") || "", /cookie/i);
  assert.ok(response.headers.get("etag"));
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

test("registration stores communication preferences and dashboard can update newsletter subscription", { timeout: 240000 }, async (t) => {
  const dockerAvailable = await isDockerAvailable();

  if (!dockerAvailable) {
    t.skip("Docker is not available for ephemeral Postgres provisioning");
    return;
  }

  const app = await startDocsApp();
  let client:
    | {
        connect(): Promise<void>;
        query(sql: string, values?: unknown[]): Promise<unknown>;
        end(): Promise<void>;
      }
    | undefined;

  t.after(async () => {
    await client?.end().catch(() => undefined);
    await app.stop();
  });

  await waitForDocsPage(app, "/register");

  const registerResponse = await fetch(`${app.publicUrl}/register`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      fullName: "Casey Newsletter",
      username: "casey-newsletter",
      email: "casey@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      receiveNewsUpdates: "on",
      newsletterSubscribed: "on",
    }),
    redirect: "manual",
  });

  assert.equal(registerResponse.status, 302);
  assert.match(registerResponse.headers.get("location") || "", /^\/verify-email\?email=casey%40example\.com&sent=1$/);

  client = new Client({
    host: app.postgres.host,
    port: app.postgres.port,
    database: app.postgres.database,
    user: app.postgres.username,
    password: app.postgres.password,
    connectionTimeoutMillis: 2000,
  });

  await client.connect();

  const insertedResult = (await client.query(
    `
      SELECT id, full_name, username, email, receive_news_updates, newsletter_subscribed
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    ["casey@example.com"],
  )) as {
    rows: Array<{
      id: number;
      full_name: string;
      username: string;
      email: string;
      receive_news_updates: boolean;
      newsletter_subscribed: boolean;
    }>;
  };

  const insertedUser = insertedResult.rows[0];
  assert.ok(insertedUser);
  assert.equal(insertedUser.receive_news_updates, true);
  assert.equal(insertedUser.newsletter_subscribed, true);

  const sessionToken = jsonwebtoken.sign(
    {
      sub: String(insertedUser.id),
      id: insertedUser.id,
      fullName: insertedUser.full_name,
      username: insertedUser.username,
      email: insertedUser.email,
      role: "user",
      roles: ["user"],
      typ: "app-session",
    },
    AppConfig.security.jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: 60 * 60,
      issuer: AppConfig.security.issuer,
    },
  );

  const updateResponse = await fetch(`${app.publicUrl}/dashboard/newsletter`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
    },
    body: new URLSearchParams({}),
    redirect: "manual",
  });

  assert.equal(updateResponse.status, 302);
  assert.equal(updateResponse.headers.get("location"), "/dashboard?preferences=updated");

  const updatedResult = (await client.query(
    `
      SELECT receive_news_updates, newsletter_subscribed
      FROM users
      WHERE id = $1
    `,
    [insertedUser.id],
  )) as {
    rows: Array<{
      receive_news_updates: boolean;
      newsletter_subscribed: boolean;
    }>;
  };

  const updatedUser = updatedResult.rows[0];
  assert.ok(updatedUser);
  assert.equal(updatedUser.receive_news_updates, true);
  assert.equal(updatedUser.newsletter_subscribed, false);

  const dashboardResponse = await fetch(`${app.publicUrl}/dashboard?preferences=updated`, {
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
    },
  });
  const dashboardHtml = await dashboardResponse.text();

  assert.equal(dashboardResponse.status, 200);
  assert.match(dashboardHtml, /Communication preferences/);
  assert.match(dashboardHtml, /Your newsletter preference was updated\./);
  assert.match(dashboardHtml, /Latest news updates/);
  assert.match(dashboardHtml, /Enabled/);
  assert.match(dashboardHtml, /Not subscribed/);
});

test("registration requires privacy consent before creating an account", { timeout: 240000 }, async (t) => {
  const dockerAvailable = await isDockerAvailable();

  if (!dockerAvailable) {
    t.skip("Docker is not available for ephemeral Postgres provisioning");
    return;
  }

  const app = await startDocsApp();
  t.after(async () => {
    await app.stop();
  });

  await waitForDocsPage(app, "/register");

  const registerResponse = await fetch(`${app.publicUrl}/register`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      fullName: "Privacy Missing",
      username: "privacy-missing",
      email: "privacy-missing@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      receiveNewsUpdates: "on",
    }),
  });
  const html = await registerResponse.text();

  assert.equal(registerResponse.status, 400);
  assert.match(html, /You must accept the Privacy Policy to create an account\./);
  assert.match(html, /href="\/privacy"/);
});