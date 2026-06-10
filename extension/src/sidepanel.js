const state = {
  context: null,
  profile: {
    goal: "",
    skillLevel: "unknown",
    interests: "",
    communityVisible: false
  }
};

const statusEl = document.querySelector("#status");
const titleEl = document.querySelector("#page-title");
const urlEl = document.querySelector("#page-url");
const storeContextEl = document.querySelector("#store-context");
const goalEl = document.querySelector("#goal");
const skillLevelEl = document.querySelector("#skill-level");
const interestsEl = document.querySelector("#interests");
const communityVisibleEl = document.querySelector("#community-visible");
const memorySummaryEl = document.querySelector("#memory-summary");
const promptEl = document.querySelector("#prompt");

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function getPageContext() {
  const tab = await getActiveTab();

  if (!tab?.id) {
    return null;
  }

  try {
    return await chrome.tabs.sendMessage(tab.id, { type: "ofo:get-page-context" });
  } catch {
    return {
      active: false,
      title: tab.title || "",
      url: tab.url || "",
      headings: []
    };
  }
}

async function loadProfile() {
  const saved = await chrome.storage.local.get(["ofoCopilotProfile", "ofoGoal", "ofoCopilotHistory"]);
  state.profile = {
    goal: saved.ofoCopilotProfile?.goal || saved.ofoGoal || "",
    skillLevel: saved.ofoCopilotProfile?.skillLevel || "unknown",
    interests: saved.ofoCopilotProfile?.interests || "",
    communityVisible: Boolean(saved.ofoCopilotProfile?.communityVisible)
  };

  goalEl.value = state.profile.goal;
  skillLevelEl.value = state.profile.skillLevel;
  interestsEl.value = state.profile.interests;
  communityVisibleEl.checked = state.profile.communityVisible;
  renderMemorySummary(saved.ofoCopilotHistory || []);
}

async function saveProfile() {
  state.profile = {
    goal: goalEl.value.trim(),
    skillLevel: skillLevelEl.value,
    interests: interestsEl.value.trim(),
    communityVisible: communityVisibleEl.checked
  };

  await chrome.storage.local.set({ ofoCopilotProfile: state.profile });
}

function renderContext() {
  const context = state.context;

  if (!context?.active) {
    statusEl.textContent = "Inactive";
    statusEl.classList.remove("active");
    titleEl.textContent = "Open an OFO-owned site to activate context.";
    urlEl.textContent = context?.url || "";
    storeContextEl.textContent = "";
    return;
  }

  statusEl.textContent = "Active";
  statusEl.classList.add("active");
  titleEl.textContent = context.title || "Untitled OFO page";
  urlEl.textContent = context.url || "";
  storeContextEl.textContent = `${context.store?.label || context.hostname} · ${context.store?.category || "OFO"} · ${context.store?.community || "OFO users"}`;
}

function renderMemorySummary(history) {
  if (!history.length) {
    memorySummaryEl.textContent = "No local activity saved yet.";
    return;
  }

  const latest = history[0];
  memorySummaryEl.textContent = `${history.length} local context snapshots. Latest: ${latest.store?.label || latest.hostname} · ${latest.title || "Untitled"}`;
}

async function rememberContext() {
  if (!state.context?.active) {
    return;
  }

  const saved = await chrome.storage.local.get(["ofoCopilotHistory"]);
  const history = saved.ofoCopilotHistory || [];
  const snapshot = {
    capturedAt: new Date().toISOString(),
    url: state.context.url,
    hostname: state.context.hostname,
    pathname: state.context.pathname,
    title: state.context.title,
    description: state.context.description,
    store: state.context.store,
    headings: state.context.headings
  };
  const nextHistory = [
    snapshot,
    ...history.filter((item) => item.url !== snapshot.url)
  ].slice(0, 25);

  await chrome.storage.local.set({ ofoCopilotHistory: nextHistory });
  renderMemorySummary(nextHistory);
}

function buildCrashCoursePlan() {
  const context = state.context || {};
  const profile = state.profile || {};
  const goal = profile.goal || "Learn the current topic";
  const level = profile.skillLevel || "unknown";
  const store = context.store?.label || "the current OFO store";
  const topic = profile.interests || context.store?.category || context.title || "this topic";

  return [
    `Crash course starter plan: ${goal}`,
    "",
    `Context: ${store}`,
    `Starting level: ${level}`,
    `Topic focus: ${topic}`,
    "",
    "1. Calibrate",
    "- Ask what the user already knows.",
    "- Identify vocabulary gaps.",
    "- Pick one concrete outcome for this session.",
    "",
    "2. Explain the core idea",
    `- Give a beginner-safe explanation tied to ${store}.`,
    "- Define 5-8 key terms.",
    "- Show one small example before using a tool.",
    "",
    "3. Practice in OFO",
    "- Open the most relevant simulation or tool.",
    "- Try one guided input.",
    "- Ask the user to predict the result before running it.",
    "",
    "4. Check understanding",
    "- Ask 3 short questions.",
    "- If the user misses one, explain that concept again with a simpler example.",
    "",
    "5. Connect",
    "- Recommend the relevant OFO community.",
    "- If profile visibility is not enabled, keep this as private recommendations only."
  ].join("\n");
}

function buildPrompt(action) {
  const context = state.context || {};
  const profile = state.profile || {};
  const goal = profile.goal || "No saved goal yet.";
  const skillLevel = profile.skillLevel || "unknown";
  const interests = profile.interests || "No saved interests.";
  const communityVisibility = profile.communityVisible
    ? "User opted into community matching for this local profile."
    : "User has not opted into profile visibility. Recommend communities only; do not expose the user or draft outbound messages as if consent exists.";
  const headings = context.headings?.length ? context.headings.join("; ") : "No headings captured.";

  if (!context.active) {
    return "OFO Copilot is inactive on this site. Open an OFO-owned store or platform first.";
  }

  if (action === "explain") {
    return [
      "Explain this OFO page to the user.",
      `User goal: ${goal}`,
      `User level: ${skillLevel}`,
      `User interests: ${interests}`,
      `Page: ${context.title}`,
      `URL: ${context.url}`,
      `Description: ${context.description || "None"}`,
      `Canonical: ${context.canonical || "None"}`,
      `Selected text: ${context.selectedText || "None"}`,
      `Headings: ${headings}`,
      "Answer with: what this is, why it matters, and the next useful action."
    ].join("\n");
  }

  if (action === "course") {
    return [
      buildCrashCoursePlan(),
      "",
      "Prompt for AI expansion:",
      "Create a tailored crash course for the user.",
      `User goal: ${goal}`,
      `User level: ${skillLevel}`,
      `User interests: ${interests}`,
      `Current OFO context: ${context.title} (${context.url})`,
      "Include: calibration questions, beginner path, glossary, exercises, OFO tools to use, and progress checks."
    ].join("\n");
  }

  if (action === "communities") {
    return [
      "Recommend OFO communities and people-matching paths.",
      `User goal: ${goal}`,
      `User level: ${skillLevel}`,
      `User interests: ${interests}`,
      `Visibility: ${communityVisibility}`,
      `Current OFO context: ${context.title} (${context.url})`,
      "Include: peer groups, mentors, contributors, reviewers, professionals, and what the user must opt into before being visible."
    ].join("\n");
  }

  return "Choose an action.";
}

async function init() {
  await loadProfile();
  state.context = await getPageContext();
  renderContext();
  await rememberContext();
}

document.querySelector("#save-profile").addEventListener("click", async () => {
  await saveProfile();
  promptEl.textContent = "Profile saved locally.";
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", async () => {
    await saveProfile();
    state.context = await getPageContext();
    renderContext();
    await rememberContext();
    promptEl.textContent = buildPrompt(button.dataset.action);
  });
});

document.querySelector("#copy-prompt").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(promptEl.textContent);
  } catch {
    promptEl.textContent += "\n\nCopy failed. Select the prompt text manually.";
  }
});

document.querySelector("#export-memory").addEventListener("click", async () => {
  const saved = await chrome.storage.local.get(["ofoCopilotProfile", "ofoCopilotHistory"]);
  promptEl.textContent = JSON.stringify({
    profile: saved.ofoCopilotProfile || null,
    history: saved.ofoCopilotHistory || []
  }, null, 2);
});

document.querySelector("#delete-memory").addEventListener("click", async () => {
  await chrome.storage.local.remove(["ofoCopilotProfile", "ofoGoal", "ofoCopilotHistory"]);
  state.profile = {
    goal: "",
    skillLevel: "unknown",
    interests: "",
    communityVisible: false
  };
  goalEl.value = "";
  skillLevelEl.value = "unknown";
  interestsEl.value = "";
  communityVisibleEl.checked = false;
  renderMemorySummary([]);
  promptEl.textContent = "Local OFO Copilot memory deleted.";
});

init();
