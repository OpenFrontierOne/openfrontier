import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionDir = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(extensionDir, "src", "copilot-core.js"), "utf8");
const context = { globalThis: {} };

vm.createContext(context);
vm.runInContext(source, context);

const core = context.globalThis.OFO_COPILOT_CORE;

assert.equal(typeof core.buildPrompt, "function");
assert.equal(typeof core.buildCrashCoursePlan, "function");
assert.equal(typeof core.buildCommunityRecommendations, "function");

const pageContext = {
  active: true,
  title: "Quantum Gates",
  url: "https://freequantumstore.pages.dev/gates",
  hostname: "freequantumstore.pages.dev",
  description: "Learn quantum gates.",
  selectedText: "Hadamard gate",
  headings: ["Quantum Gates", "Hadamard"],
  store: {
    label: "FreeQuantumStore",
    category: "quantum",
    community: "quantum learners"
  }
};

const privateProfile = {
  goal: "Learn quantum mechanics",
  skillLevel: "beginner",
  interests: "qubits",
  communityVisible: false
};

const publicProfile = {
  ...privateProfile,
  communityVisible: true
};

assert.match(core.buildPrompt("explain", pageContext, privateProfile), /Hadamard gate/);
assert.match(core.buildPrompt("course", pageContext, privateProfile), /Crash course starter plan/);
assert.match(core.buildPrompt("communities", pageContext, privateProfile), /do not expose the user/i);
assert.match(core.buildPrompt("communities", pageContext, publicProfile), /opted in/i);
assert.match(core.buildNextActions(pageContext, privateProfile), /Next actions for FreeQuantumStore/);
assert.match(core.buildPrompt("explain", { active: false }, privateProfile), /inactive/);

console.log("OFO Copilot core tests passed.");
