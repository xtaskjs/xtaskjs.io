import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { execFile, spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const waitForChildExit = (
  child: ChildProcessWithoutNullStreams,
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

const waitForHttpReady = async (url: string, timeoutMs = 45000): Promise<void> => {
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

const stopProcess = async (child: ChildProcessWithoutNullStreams): Promise<void> => {
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

test("documentation package detail page renders generated API groups over HTTP", { timeout: 120000 }, async (t) => {
  const dockerAvailable = await isDockerAvailable();

  if (!dockerAvailable) {
    t.skip("Docker is not available for ephemeral Postgres provisioning");
    return;
  }

  const postgres = await startEphemeralPostgres();
  const port = await findAvailablePort();
  const publicUrl = `http://127.0.0.1:${port}`;
  const child = spawn(
    "npm",
    ["start"],
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

  try {
    try {
      await Promise.race([
        waitForHttpReady(`${publicUrl}/documentation/packages/core`),
        childExit.then(({ code, signal }) => {
          const startupOutput = output.trim();
          const details = startupOutput.length > 0 ? `\n\nStartup output:\n${startupOutput}` : "";
          throw new Error(`Application exited before HTTP readiness (code: ${code}, signal: ${signal})${details}`);
        }),
      ]);
    } catch (error) {
      const startupOutput = output.trim();
      const details = startupOutput.length > 0 ? `\n\nStartup output:\n${startupOutput}` : "";
      throw new Error(
        error instanceof Error ? `${error.message}${details}` : `HTTP readiness failed${details}`,
      );
    }

    const response = await fetch(`${publicUrl}/documentation/packages/core`);
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(html, /@xtaskjs\/core/);
    assert.match(html, /Bootstrap and app/);
    assert.match(html, /CreateApplication/);
    assert.match(html, /DI and components/);
  } finally {
    await stopProcess(child);
    await postgres.cleanup();
  }

  assert.doesNotMatch(output, /Failed to start server:/);
  assert.equal(await isTcpPortOpen(postgres.host, postgres.port), false);
});