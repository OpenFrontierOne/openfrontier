const OWNED_HOST_PATTERNS = [
  /(^|\.)openfrontier\.one$/,
  /(^|\.)freeappstore\.online$/,
  /(^|\.)proappstore\.online$/,
  /(^|\.)freegamestore\.online$/,
  /(^|\.)progamestore\.online$/,
  /(^|\.)freewebstore\.online$/,
  /(^|\.)prowebstore\.online$/,
  /(^|\.)freeagentstore\.online$/,
  /(^|\.)proagentstore\.online$/,
  /^openfrontier\.pages\.dev$/,
  /^openfrontier-docs\.pages\.dev$/,
  /^freequantumstore\.pages\.dev$/,
  /^freecryptostore\.pages\.dev$/,
  /^freechipstore\.pages\.dev$/,
  /^freespacestore\.pages\.dev$/,
  /^freebiostore\.pages\.dev$/,
  /^freedesignstore\.pages\.dev$/,
  /^freemarketingstore\.pages\.dev$/,
  /^freecodestore\.pages\.dev$/,
  /^freemusicstore\.pages\.dev$/,
  /^freewritingstore\.pages\.dev$/,
  /^freebookstore\.pages\.dev$/,
  /^freefinancestore\.pages\.dev$/,
  /^freedatastore\.pages\.dev$/,
  /^freepeerstore\.pages\.dev$/
];

function isOwnedHost(hostname) {
  return OWNED_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

function getPageContext() {
  const headings = Array.from(document.querySelectorAll("h1, h2"))
    .slice(0, 8)
    .map((heading) => heading.textContent.trim())
    .filter(Boolean);

  const description = document.querySelector('meta[name="description"]')?.content || "";

  return {
    active: isOwnedHost(window.location.hostname),
    url: window.location.href,
    origin: window.location.origin,
    hostname: window.location.hostname,
    title: document.title,
    description,
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
