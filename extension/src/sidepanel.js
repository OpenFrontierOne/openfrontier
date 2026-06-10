const state = {
  context: null,
  goal: ""
};

const statusEl = document.querySelector("#status");
const titleEl = document.querySelector("#page-title");
const urlEl = document.querySelector("#page-url");
const goalEl = document.querySelector("#goal");
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
  const saved = await chrome.storage.local.get(["ofoGoal"]);
  state.goal = saved.ofoGoal || "";
  goalEl.value = state.goal;
}

async function saveGoal() {
  state.goal = goalEl.value.trim();
  await chrome.storage.local.set({ ofoGoal: state.goal });
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
  const goal = state.goal || "No saved goal yet.";
  const headings = context.headings?.length ? context.headings.join("; ") : "No headings captured.";

  if (!context.active) {
    return "OFO Copilot is inactive on this site. Open an OFO-owned store or platform first.";
  }

  if (action === "explain") {
    return [
      "Explain this OFO page to the user.",
      `User goal: ${goal}`,
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
      `Current OFO context: ${context.title} (${context.url})`,
      "Include: calibration questions, beginner path, glossary, exercises, OFO tools to use, and progress checks."
    ].join("\n");
  }

  if (action === "communities") {
    return [
      "Recommend OFO communities and people-matching paths.",
      `User goal: ${goal}`,
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

document.querySelector("#save-goal").addEventListener("click", async () => {
  await saveGoal();
  promptEl.textContent = "Goal saved locally.";
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", async () => {
    await saveGoal();
    state.context = await getPageContext();
    renderContext();
    promptEl.textContent = buildPrompt(button.dataset.action);
  });
});

init();
