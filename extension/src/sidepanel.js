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
const goalEl = document.querySelector("#goal");
const skillLevelEl = document.querySelector("#skill-level");
const interestsEl = document.querySelector("#interests");
const communityVisibleEl = document.querySelector("#community-visible");
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
  const saved = await chrome.storage.local.get(["ofoCopilotProfile", "ofoGoal"]);
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
    return;
  }

  statusEl.textContent = "Active";
  statusEl.classList.add("active");
  titleEl.textContent = context.title || "Untitled OFO page";
  urlEl.textContent = context.url || "";
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
      `Headings: ${headings}`,
      "Answer with: what this is, why it matters, and the next useful action."
    ].join("\n");
  }

  if (action === "course") {
    return [
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

init();
