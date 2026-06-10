const state = {
  context: null,
  profile: {
    goal: "",
    skillLevel: "unknown",
    interests: "",
    communityVisible: false
  },
  session: {
    authApi: "https://api.freeappstore.online",
    tokenPresent: false,
    user: null
  },
  providerKeys: {
    openaiPresent: false,
    anthropicPresent: false
  }
};

const statusEl = document.querySelector("#status");
const titleEl = document.querySelector("#page-title");
const urlEl = document.querySelector("#page-url");
const storeContextEl = document.querySelector("#store-context");
const accountStatusEl = document.querySelector("#account-status");
const providerStatusEl = document.querySelector("#provider-status");
const authApiEl = document.querySelector("#auth-api");
const redirectUrlEl = document.querySelector("#redirect-url");
const openaiApiKeyEl = document.querySelector("#openai-api-key");
const anthropicApiKeyEl = document.querySelector("#anthropic-api-key");
const goalEl = document.querySelector("#goal");
const skillLevelEl = document.querySelector("#skill-level");
const interestsEl = document.querySelector("#interests");
const communityVisibleEl = document.querySelector("#community-visible");
const memorySummaryEl = document.querySelector("#memory-summary");
const promptEl = document.querySelector("#prompt");
const core = globalThis.OFO_COPILOT_CORE;

const DEFAULT_AUTH_API = "https://api.freeappstore.online";
const LOCAL_DATA_KEYS = [
  "ofoCopilotProfile",
  "ofoGoal",
  "ofoCopilotHistory",
  "ofoCopilotSession",
  "ofoCopilotProviderKeys"
];

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
  const saved = await chrome.storage.local.get([
    "ofoCopilotProfile",
    "ofoGoal",
    "ofoCopilotHistory",
    "ofoCopilotSession",
    "ofoCopilotProviderKeys"
  ]);
  state.profile = {
    goal: saved.ofoCopilotProfile?.goal || saved.ofoGoal || "",
    skillLevel: saved.ofoCopilotProfile?.skillLevel || "unknown",
    interests: saved.ofoCopilotProfile?.interests || "",
    communityVisible: Boolean(saved.ofoCopilotProfile?.communityVisible)
  };
  state.session = {
    authApi: saved.ofoCopilotSession?.authApi || saved.ofoCopilotSession?.endpoint || DEFAULT_AUTH_API,
    tokenPresent: Boolean(saved.ofoCopilotSession?.accessToken),
    user: saved.ofoCopilotSession?.user || null
  };
  state.providerKeys = {
    openaiPresent: Boolean(saved.ofoCopilotProviderKeys?.openaiApiKey),
    anthropicPresent: Boolean(saved.ofoCopilotProviderKeys?.anthropicApiKey)
  };

  goalEl.value = state.profile.goal;
  skillLevelEl.value = state.profile.skillLevel;
  interestsEl.value = state.profile.interests;
  communityVisibleEl.checked = state.profile.communityVisible;
  authApiEl.value = state.session.authApi;
  redirectUrlEl.textContent = `Redirect URL: ${chrome.identity.getRedirectURL("ofo-copilot")}`;
  openaiApiKeyEl.value = "";
  anthropicApiKeyEl.value = "";
  renderAccountStatus();
  renderProviderStatus();
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

function getSafeSessionSnapshot(session) {
  if (!session) {
    return null;
  }

  return {
    authApi: session.authApi || session.endpoint || DEFAULT_AUTH_API,
    tokenPresent: Boolean(session.accessToken),
    user: session.user || null
  };
}

function getSafeProviderSnapshot(providerKeys) {
  if (!providerKeys) {
    return null;
  }

  return {
    openaiPresent: Boolean(providerKeys.openaiApiKey),
    anthropicPresent: Boolean(providerKeys.anthropicApiKey)
  };
}

function renderAccountStatus() {
  if (state.session.tokenPresent && state.session.user) {
    accountStatusEl.textContent = `Signed in as ${state.session.user.login || state.session.user.githubLogin || state.session.user.id}.`;
    return;
  }

  accountStatusEl.textContent = state.session.tokenPresent
    ? "Signed in. User details unavailable."
    : "Signed out. Sync is not active.";
}

function renderProviderStatus() {
  const enabled = [
    state.providerKeys.openaiPresent ? "OpenAI" : "",
    state.providerKeys.anthropicPresent ? "Claude" : ""
  ].filter(Boolean);

  providerStatusEl.textContent = enabled.length
    ? `Local provider keys saved: ${enabled.join(", ")}.`
    : "No local AI provider keys saved.";
}

function normalizeAuthApi(value) {
  return (value || DEFAULT_AUTH_API).trim().replace(/\/+$/, "");
}

async function verifySession(authApi, accessToken) {
  const response = await fetch(`${authApi}/v1/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error(`Auth verification failed: ${response.status}`);
  }

  const data = await response.json();
  return data.user || data;
}

function launchWebAuthFlow(details) {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(details, (redirectUrl) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(redirectUrl);
    });
  });
}

async function signIn() {
  const authApi = normalizeAuthApi(authApiEl.value);
  const returnTo = chrome.identity.getRedirectURL("ofo-copilot");
  const authUrl = new URL(`${authApi}/v1/auth/github/start`);
  authUrl.searchParams.set("app_id", "ofo-copilot-extension");
  authUrl.searchParams.set("response_mode", "query");
  authUrl.searchParams.set("return_to", returnTo);

  const redirectUrl = await launchWebAuthFlow({
    url: authUrl.toString(),
    interactive: true
  });
  const accessToken = new URL(redirectUrl).searchParams.get("fas_session");

  if (!accessToken) {
    throw new Error("Auth callback did not include fas_session.");
  }

  const user = await verifySession(authApi, accessToken);
  const session = { authApi, accessToken, user };

  await chrome.storage.local.set({ ofoCopilotSession: session });
  state.session = {
    authApi,
    tokenPresent: true,
    user
  };
  authApiEl.value = authApi;
  renderAccountStatus();
}

async function saveProviderKeys() {
  const existing = await chrome.storage.local.get(["ofoCopilotProviderKeys"]);
  const openaiApiKey = openaiApiKeyEl.value.trim() || existing.ofoCopilotProviderKeys?.openaiApiKey || "";
  const anthropicApiKey = anthropicApiKeyEl.value.trim() || existing.ofoCopilotProviderKeys?.anthropicApiKey || "";
  const providerKeys = {
    openaiApiKey,
    anthropicApiKey
  };

  await chrome.storage.local.set({ ofoCopilotProviderKeys: providerKeys });
  state.providerKeys = {
    openaiPresent: Boolean(openaiApiKey),
    anthropicPresent: Boolean(anthropicApiKey)
  };
  openaiApiKeyEl.value = "";
  anthropicApiKeyEl.value = "";
  renderProviderStatus();
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

document.querySelector("#sign-in").addEventListener("click", async () => {
  promptEl.textContent = "Opening GitHub sign-in...";
  try {
    await signIn();
    promptEl.textContent = "Signed in to OFO.";
  } catch (error) {
    promptEl.textContent = `Sign-in failed: ${error.message}`;
  }
});

document.querySelector("#clear-session").addEventListener("click", async () => {
  await chrome.storage.local.remove(["ofoCopilotSession"]);
  state.session = {
    authApi: normalizeAuthApi(authApiEl.value),
    tokenPresent: false,
    user: null
  };
  renderAccountStatus();
  promptEl.textContent = "Signed out.";
});

document.querySelector("#save-provider-keys").addEventListener("click", async () => {
  await saveProviderKeys();
  promptEl.textContent = "AI provider keys saved locally. They were not sent anywhere.";
});

document.querySelector("#clear-provider-keys").addEventListener("click", async () => {
  await chrome.storage.local.remove(["ofoCopilotProviderKeys"]);
  state.providerKeys = {
    openaiPresent: false,
    anthropicPresent: false
  };
  openaiApiKeyEl.value = "";
  anthropicApiKeyEl.value = "";
  renderProviderStatus();
  promptEl.textContent = "Local AI provider keys cleared.";
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
  const saved = await chrome.storage.local.get(["ofoCopilotProfile", "ofoCopilotHistory", "ofoCopilotSession", "ofoCopilotProviderKeys"]);
  promptEl.textContent = JSON.stringify({
    profile: saved.ofoCopilotProfile || null,
    session: getSafeSessionSnapshot(saved.ofoCopilotSession),
    providerKeys: getSafeProviderSnapshot(saved.ofoCopilotProviderKeys),
    history: saved.ofoCopilotHistory || []
  }, null, 2);
});

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", async () => {
    document.querySelectorAll("[data-tab]").forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");

    const saved = await chrome.storage.local.get(["ofoCopilotProfile", "ofoCopilotHistory", "ofoCopilotSession", "ofoCopilotProviderKeys"]);
    if (button.dataset.tab === "history") {
      promptEl.textContent = renderHistory(saved.ofoCopilotHistory || []);
    } else if (button.dataset.tab === "raw") {
      promptEl.textContent = JSON.stringify({
        profile: saved.ofoCopilotProfile || null,
        session: getSafeSessionSnapshot(saved.ofoCopilotSession),
        providerKeys: getSafeProviderSnapshot(saved.ofoCopilotProviderKeys),
        context: state.context || null,
        history: saved.ofoCopilotHistory || []
      }, null, 2);
    } else {
      promptEl.textContent = core.buildNextActions(state.context || {}, state.profile || {});
    }
  });
});

document.querySelector("#delete-memory").addEventListener("click", async () => {
  await chrome.storage.local.remove([
    "ofoCopilotProfile",
    "ofoGoal",
    "ofoCopilotHistory"
  ]);
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
  promptEl.textContent = "Local OFO Copilot profile and history deleted. OFO session and provider keys were left intact.";
});

document.querySelector("#delete-all-local").addEventListener("click", async () => {
  await chrome.storage.local.remove(LOCAL_DATA_KEYS);
  state.profile = {
    goal: "",
    skillLevel: "unknown",
    interests: "",
    communityVisible: false
  };
  state.session = {
    authApi: DEFAULT_AUTH_API,
    tokenPresent: false,
    user: null
  };
  state.providerKeys = {
    openaiPresent: false,
    anthropicPresent: false
  };
  goalEl.value = "";
  skillLevelEl.value = "unknown";
  interestsEl.value = "";
  communityVisibleEl.checked = false;
  authApiEl.value = state.session.authApi;
  openaiApiKeyEl.value = "";
  anthropicApiKeyEl.value = "";
  renderAccountStatus();
  renderProviderStatus();
  renderMemorySummary([]);
  promptEl.textContent = "All local OFO Copilot data deleted.";
});

init();
