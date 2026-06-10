import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionDir = path.resolve(__dirname, "..");
const manifestPath = path.join(extensionDir, "manifest.json");
const sidepanelPath = path.join(extensionDir, "src", "sidepanel.html");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const sidepanel = fs.readFileSync(sidepanelPath, "utf8");
const domainsSource = fs.readFileSync(path.join(extensionDir, "src", "domains.js"), "utf8");
const readme = fs.readFileSync(path.join(extensionDir, "README.md"), "utf8");

const errors = [];
const hostPermissions = manifest.host_permissions || [];
const contentMatches = manifest.content_scripts?.flatMap((script) => script.matches || []) || [];

if (manifest.manifest_version !== 3) {
  errors.push("manifest_version must be 3.");
}

if (!manifest.permissions?.includes("sidePanel")) {
  errors.push("sidePanel permission is required for the current UI.");
}

if (!manifest.content_scripts?.[0]?.js?.includes("src/domains.js")) {
  errors.push("src/domains.js must load before src/content.js.");
}

if (hostPermissions.some((host) => host.includes("*.pages.dev"))) {
  errors.push("Broad *.pages.dev host permission is not allowed.");
}

for (const forbidden of ["<all_urls>", "http://*/*", "https://*/*"]) {
  if (hostPermissions.includes(forbidden) || contentMatches.includes(forbidden)) {
    errors.push(`Forbidden broad permission: ${forbidden}`);
  }
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

for (const requiredId of ["export-memory", "delete-memory", "memory-summary", "store-context"]) {
  if (!sidepanel.includes(`id="${requiredId}"`)) {
    errors.push(`Side panel is missing #${requiredId}.`);
  }
}

for (const requiredScript of ["copilot-core.js", "sidepanel.js"]) {
  if (!sidepanel.includes(`src="${requiredScript}"`)) {
    errors.push(`Side panel is missing ${requiredScript}.`);
  }
}

for (const requiredAction of ["explain", "course", "communities", "next"]) {
  if (!sidepanel.includes(`data-action="${requiredAction}"`)) {
    errors.push(`Side panel is missing ${requiredAction} action.`);
  }
}

for (const requiredHost of ["openfrontier.one", "freeappstore.online", "freequantumstore.pages.dev"]) {
  if (!domainsSource.includes(`"${requiredHost}"`)) {
    errors.push(`Domain registry is missing ${requiredHost}.`);
  }
}

for (const requiredCopy of ["should not monitor the wider browser", "OFO-owned domains"]) {
  if (!readme.includes(requiredCopy)) {
    errors.push(`README is missing privacy boundary copy: ${requiredCopy}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("OFO Copilot extension validation passed.");
