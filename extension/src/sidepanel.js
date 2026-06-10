const state = {
  context: null,
  profile: {
    goal: "",
    skillLevel: "unknown",
    interests: "",
    communityVisible: false
  },
  session: {
    endpoint: "https://openfrontier.one/api/copilot",
    tokenPresent: false
  }
};

const statusEl = document.querySelector("#status");
const titleEl = document.querySelector("#page-title");
const urlEl = document.querySelector("#page-url");
const storeContextEl = document.querySelector("#store-context");
const accountStatusEl = document.querySelector("#account-status");
const apiEndpointEl = document.querySelector("#api-endpoint");
const accessTokenEl = document.querySelector("#access-token");
const goalEl = document.querySelector("#goal");
const skillLevelEl = document.querySelector("#skill-level");
const interestsEl = document.querySelector("#interests");
const communityVisibleEl = document.querySelector("#community-visible");
const memorySummaryEl = document.querySelector("#memory-summary");
const promptEl = document.querySelector("#prompt");
const core = globalThis.OFO_COPILOT_CORE;

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
  const saved = await chrome.storage.local.get(["ofoCopilotProfile", "ofoGoal", "ofoCopilotHistory", "ofoCopilotSession"]);
  state.profile = {
    goal: saved.ofoCopilotProfile?.goal || saved.ofoGoal || "",
    skillLevel: saved.ofoCopilotProfile?.skillLevel || "unknown",
    interests: saved.ofoCopilotProfile?.interests || "",
    communityVisible: Boolean(saved.ofoCopilotProfile?.communityVisible)
  };
  state.session = {
    endpoint: saved.ofoCopilotSession?.endpoint || "https://openfrontier.one/api/copilot",
    tokenPresent: Boolean(saved.ofoCopilotSession?.accessToken)
  };

  goalEl.value = state.profile.goal;
  skillLevelEl.value = state.profile.skillLevel;
  interestsEl.value = state.profile.interests;
  communityVisibleEl.checked = state.profile.communityVisible;
  apiEndpointEl.value = state.session.endpoint;
  accessTokenEl.value = "";
  renderAccountStatus();
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

function renderAccountStatus() {
  accountStatusEl.textContent = state.session.tokenPresent
    ? `Signed-in placeholder configured for ${state.session.endpoint}. Sync is still preview-only.`
    : "Signed out. Sync is not active.";
}

async function saveSession() {
  const endpoint = apiEndpointEl.value.trim() || "https://openfrontier.one/api/copilot";
  const accessToken = accessTokenEl.value.trim();
  const existing = await chrome.storage.local.get(["ofoCopilotSession"]);
  const session = {
    endpoint,
    accessToken: accessToken || existing.ofoCopilotSession?.accessToken || ""
  };

  await chrome.storage.local.set({ ofoCopilotSession: session });
  state.session = {
    endpoint,
    tokenPresent: Boolean(session.accessToken)
  };
  accessTokenEl.value = "";
  renderAccountStatus();
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

function renderHistory(history) {
  if (!history.length) {
    return "No local history yet.";
  }

  return history.map((item, index) => [
    `${index + 1}. ${item.store?.label || item.hostname || "OFO page"}`,
    `   ${item.title || "Untitled"}`,
    `   ${item.url}`,
    `   Captured: ${item.capturedAt}`
  ].join("\n")).join("\n\n");
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

function buildPrompt(action) {
  if (action === "next") {
    return core.buildNextActions(state.context || {}, state.profile || {});
  }

  if (action === "sync-preview") {
    return "Loading sync payload...";
  }

  return core.buildPrompt(action, state.context || {}, state.profile || {});
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

document.querySelector("#save-session").addEventListener("click", async () => {
  await saveSession();
  promptEl.textContent = "Session placeholder saved locally. No network request was sent.";
});

document.querySelector("#clear-session").addEventListener("click", async () => {
  await chrome.storage.local.remove(["ofoCopilotSession"]);
  state.session = {
    endpoint: "https://openfrontier.one/api/copilot",
    tokenPresent: false
  };
  apiEndpointEl.value = state.session.endpoint;
  accessTokenEl.value = "";
  renderAccountStatus();
  promptEl.textContent = "Session placeholder cleared.";
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", async () => {
    await saveProfile();
    state.context = await getPageContext();
    renderContext();
    await rememberContext();

    if (button.dataset.action === "sync-preview") {
      const saved = await chrome.storage.local.get(["ofoCopilotHistory"]);
      promptEl.textContent = JSON.stringify(core.buildSyncPayload(
        state.context || {},
        state.profile || {},
        saved.ofoCopilotHistory || []
      ), null, 2);
      return;
    }

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
  const saved = await chrome.storage.local.get(["ofoCopilotProfile", "ofoCopilotHistory", "ofoCopilotSession"]);
  promptEl.textContent = JSON.stringify({
    profile: saved.ofoCopilotProfile || null,
    session: saved.ofoCopilotSession ? {
      endpoint: saved.ofoCopilotSession.endpoint,
      tokenPresent: Boolean(saved.ofoCopilotSession.accessToken)
    } : null,
    history: saved.ofoCopilotHistory || []
  }, null, 2);
});

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", async () => {
    document.querySelectorAll("[data-tab]").forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");

    const saved = await chrome.storage.local.get(["ofoCopilotProfile", "ofoCopilotHistory", "ofoCopilotSession"]);
    if (button.dataset.tab === "history") {
      promptEl.textContent = renderHistory(saved.ofoCopilotHistory || []);
    } else if (button.dataset.tab === "raw") {
      promptEl.textContent = JSON.stringify({
        profile: saved.ofoCopilotProfile || null,
        session: saved.ofoCopilotSession ? {
          endpoint: saved.ofoCopilotSession.endpoint,
          tokenPresent: Boolean(saved.ofoCopilotSession.accessToken)
        } : null,
        context: state.context || null,
        history: saved.ofoCopilotHistory || []
      }, null, 2);
    } else {
      promptEl.textContent = core.buildNextActions(state.context || {}, state.profile || {});
    }
  });
});

document.querySelector("#delete-memory").addEventListener("click", async () => {
  await chrome.storage.local.remove(["ofoCopilotProfile", "ofoGoal", "ofoCopilotHistory", "ofoCopilotSession"]);
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
  state.session = {
    endpoint: "https://openfrontier.one/api/copilot",
    tokenPresent: false
  };
  apiEndpointEl.value = state.session.endpoint;
  accessTokenEl.value = "";
  renderAccountStatus();
  renderMemorySummary([]);
  promptEl.textContent = "Local OFO Copilot memory deleted.";
});

init();
