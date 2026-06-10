const DOMAIN_REGISTRY = globalThis.OFO_COPILOT_DOMAINS;

function isOwnedHost(hostname) {
  return DOMAIN_REGISTRY.ownedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))
    || DOMAIN_REGISTRY.pagesHosts.includes(hostname);
}

function getStoreProfile(hostname) {
  const exact = DOMAIN_REGISTRY.storeProfiles[hostname];

  if (exact) {
    return exact;
  }

  const rootHost = DOMAIN_REGISTRY.ownedHosts.find((host) => hostname === host || hostname.endsWith(`.${host}`));
  return DOMAIN_REGISTRY.storeProfiles[rootHost] || {
    label: hostname,
    category: "unknown",
    community: "OFO users"
  };
}

function getPageContext() {
  const headings = Array.from(document.querySelectorAll("h1, h2"))
    .slice(0, 8)
    .map((heading) => heading.textContent.trim())
    .filter(Boolean);

  const description = document.querySelector('meta[name="description"]')?.content || "";
  const canonical = document.querySelector('link[rel="canonical"]')?.href || "";
  const selectedText = window.getSelection().toString().trim().slice(0, 1000);
  const profile = getStoreProfile(window.location.hostname);

  return {
    active: isOwnedHost(window.location.hostname),
    url: window.location.href,
    origin: window.location.origin,
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    title: document.title,
    description,
    canonical,
    selectedText,
    store: profile,
    headings
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "ofo:get-page-context") {
    return false;
  }

  sendResponse(getPageContext());
  return true;
});
