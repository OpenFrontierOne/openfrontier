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

if (!manifest.permissions?.includes("identity")) {
  errors.push("identity permission is required for real sign-in.");
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

if (!sidepanel.includes('id="delete-all-local"')) {
  errors.push("Side panel is missing #delete-all-local.");
}

for (const requiredId of ["account-status", "auth-api", "redirect-url", "sign-in-google", "sign-in-github", "clear-session"]) {
  if (!sidepanel.includes(`id="${requiredId}"`)) {
    errors.push(`Side panel is missing #${requiredId}.`);
  }
}

if (sidepanel.includes("access-token") || sidepanel.includes("Paste future OFO") || sidepanel.includes("Sign in locally")) {
  errors.push("Side panel still contains local OFO token placeholder UI.");
}

for (const requiredId of ["provider-status", "openai-api-key", "anthropic-api-key", "save-provider-keys", "clear-provider-keys"]) {
  if (!sidepanel.includes(`id="${requiredId}"`)) {
    errors.push(`Side panel is missing #${requiredId}.`);
  }
}

for (const requiredScript of ["copilot-core.js", "sidepanel.js"]) {
  if (!sidepanel.includes(`src="${requiredScript}"`)) {
    errors.push(`Side panel is missing ${requiredScript}.`);
  }
}

for (const requiredAction of ["explain", "course", "communities", "next", "sync-preview"]) {
  if (!sidepanel.includes(`data-action="${requiredAction}"`)) {
    errors.push(`Side panel is missing ${requiredAction} action.`);
  }
}

for (const requiredHost of ["openfrontier.one", "freeappstore.online", "freequantumstore.pages.dev"]) {
  if (!domainsSource.includes(`"${requiredHost}"`)) {
    errors.push(`Domain registry is missing ${requiredHost}.`);
  }
}

if (!hostPermissions.includes("https://api.freeappstore.online/*")) {
  errors.push("Missing host permission for shared OFO/FAS auth API.");
}

for (const requiredCopy of ["should not monitor the wider browser", "OFO-owned domains"]) {
  if (!readme.includes(requiredCopy)) {
    errors.push(`README is missing privacy boundary copy: ${requiredCopy}`);
  }
}

if (!sidepanel.includes("chrome.storage.local") || !sidepanel.includes("not included in sync payloads")) {
  errors.push("Side panel must state that provider keys are local and not included in sync payloads.");
}

const sidepanelJs = fs.readFileSync(path.join(extensionDir, "src", "sidepanel.js"), "utf8");
for (const requiredCode of ["launchWebAuthFlow", "getRedirectURL", "fas_session", "/v1/auth/me", "/v1/auth/${authProvider}/start"]) {
  if (!sidepanelJs.includes(requiredCode)) {
    errors.push(`Real sign-in implementation is missing ${requiredCode}.`);
  }
}
for (const forbiddenExport of ["openaiApiKey:", "anthropicApiKey:", "accessToken: saved"]) {
  if (sidepanelJs.includes(forbiddenExport)) {
    errors.push(`Side panel may expose secret material: ${forbiddenExport}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("OFO Copilot extension validation passed.");
