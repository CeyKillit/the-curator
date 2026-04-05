const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, ".next");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const killPort3000Windows = () => {
  try {
    const output = execSync("cmd /c netstat -ano | findstr :3000", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    const pids = [
      ...new Set(
        output
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => line.split(/\s+/).pop())
          .filter((pid) => pid && pid !== "0")
      ),
    ];

    for (const pid of pids) {
      try {
        execSync(`cmd /c taskkill /PID ${pid} /F`, {
          stdio: ["ignore", "ignore", "ignore"],
        });
      } catch {
        // Ignore processes that exit between netstat and taskkill.
      }
    }
  } catch {
    // No process bound to port 3000.
  }
};

const removeNextDir = async () => {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      fs.rmSync(nextDir, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 200,
      });

      if (!fs.existsSync(nextDir)) {
        return;
      }
    } catch (error) {
      if (attempt === 6) {
        throw error;
      }
    }

    await sleep(400);
  }

  throw new Error(
    `Nao foi possivel limpar ${nextDir}. Feche terminais antigos do Next e tente novamente.`
  );
};

const main = async () => {
  if (process.platform === "win32") {
    killPort3000Windows();
    await sleep(600);
  }

  await removeNextDir();

  const nextBin =
    process.platform === "win32"
      ? path.join(projectRoot, "node_modules", ".bin", "next.cmd")
      : path.join(projectRoot, "node_modules", ".bin", "next");

  const child = spawn(nextBin, ["dev"], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
