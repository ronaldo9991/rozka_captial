import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.dirname(path.dirname(__filename));
const distPublic = path.join(projectRoot, "dist", "public");
const serverPublic = path.join(projectRoot, "server", "public");

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  if (!(await pathExists(distPublic))) {
    console.error(
      `sync-static: expected build assets at ${distPublic}, but the directory does not exist.`,
    );
    process.exit(1);
  }

  await fs.rm(serverPublic, { recursive: true, force: true });
  await copyDir(distPublic, serverPublic);
  console.log(`sync-static: copied assets from ${distPublic} to ${serverPublic}`);
}

main().catch((error) => {
  console.error("sync-static: failed to copy build assets", error);
  process.exit(1);
});

