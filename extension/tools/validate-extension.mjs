import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionDir = path.resolve(__dirname, "..");
const manifestPath = path.join(extensionDir, "manifest.json");
const sidepanelPath = path.join(extensionDir, "src", "sidepanel.html");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const sidepanel = fs.readFileSync(sidepanelPath, "utf8");

const errors = [];
const hostPermissions = manifest.host_permissions || [];
const contentMatches = manifest.content_scripts?.flatMap((script) => script.matches || []) || [];

if (manifest.manifest_version !== 3) {
  errors.push("manifest_version must be 3.");
}

if (!manifest.permissions?.includes("sidePanel")) {
  errors.push("sidePanel permission is required for the current UI.");
}

if (hostPermissions.some((host) => host.includes("*.pages.dev"))) {
  errors.push("Broad *.pages.dev host permission is not allowed.");
}

const duplicateHosts = hostPermissions.filter((host, index) => hostPermissions.indexOf(host) !== index);
if (duplicateHosts.length) {
  errors.push(`Duplicate host permissions: ${[...new Set(duplicateHosts)].join(", ")}`);
}

const missingHostPermissions = contentMatches.filter((match) => !hostPermissions.includes(match));
if (missingHostPermissions.length) {
  errors.push(`Content matches missing from host_permissions: ${missingHostPermissions.join(", ")}`);
}

for (const requiredId of ["goal", "skill-level", "interests", "community-visible", "copy-prompt"]) {
  if (!sidepanel.includes(`id="${requiredId}"`)) {
    errors.push(`Side panel is missing #${requiredId}.`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("OFO Copilot extension validation passed.");
