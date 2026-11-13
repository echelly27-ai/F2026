import { spawn } from "node:child_process";
import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";

rmSync(".next", { recursive: true, force: true });

const api = "src/app/api";
const hold = ".pages-api-hold";
let moved = false;

try {
  if (existsSync(api)) {
    mkdirSync(hold, { recursive: true });
    renameSync(api, `${hold}/api`);
    moved = true;
  }
  const child = spawn("npx", ["next", "build"], {
    stdio: "inherit",
    env: { ...process.env, GITHUB_PAGES: "true" },
  });
  const code = await new Promise((resolve) => {
    child.on("exit", resolve);
  });
  process.exitCode = code ?? 1;
} finally {
  if (moved && existsSync(`${hold}/api`)) {
    if (existsSync(api)) rmSync(api, { recursive: true, force: true });
    renameSync(`${hold}/api`, api);
    rmSync(hold, { recursive: true, force: true });
  }
}
