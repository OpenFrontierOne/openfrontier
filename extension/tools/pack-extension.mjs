import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionDir = path.resolve(__dirname, "..");
const distDir = path.join(extensionDir, "dist");
const outputPath = path.join(distDir, "ofo-copilot-extension.zip");

const includeFiles = [
  "manifest.json",
  "README.md",
  "src/background.js",
  "src/content.js",
  "src/copilot-core.js",
  "src/domains.js",
  "src/sidepanel.css",
  "src/sidepanel.html",
  "src/sidepanel.js"
];

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

for (const file of includeFiles) {
  const source = path.join(extensionDir, file);
  const target = path.join(distDir, "package", file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

const zipResult = spawnSync("zip", ["-qr", outputPath, "."], {
  cwd: path.join(distDir, "package"),
  encoding: "utf8"
});

if (zipResult.status !== 0) {
  console.error(zipResult.stderr || zipResult.stdout);
  process.exit(zipResult.status || 1);
}

const listResult = spawnSync("unzip", ["-Z1", outputPath], {
  encoding: "utf8"
});

if (listResult.status !== 0) {
  console.error(listResult.stderr || listResult.stdout);
  process.exit(listResult.status || 1);
}

const actualFiles = listResult.stdout.trim().split("\n").filter((file) => file && !file.endsWith("/")).sort();
const expectedFiles = [...includeFiles].sort();
const unexpected = actualFiles.filter((file) => !expectedFiles.includes(file));
const missing = expectedFiles.filter((file) => !actualFiles.includes(file));

if (unexpected.length || missing.length) {
  if (unexpected.length) {
    console.error(`Unexpected files in package: ${unexpected.join(", ")}`);
  }
  if (missing.length) {
    console.error(`Missing files in package: ${missing.join(", ")}`);
  }
  process.exit(1);
}

fs.rmSync(path.join(distDir, "package"), { recursive: true, force: true });

console.log(`Packed ${outputPath}`);
