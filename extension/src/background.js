chrome.runtime.onInstalled.addListener(() => {
  if (!chrome.sidePanel?.setPanelBehavior) {
    return;
  }

  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => {
      console.warn("OFO Copilot side panel setup failed", error);
    });
});
