// Clicking the toolbar icon toggles the Now Playing view in the current tab.
chrome.action.onClicked.addListener((tab) => {
  if (tab.id && tab.url && tab.url.startsWith("https://music.youtube.com/")) {
    chrome.tabs.sendMessage(tab.id, { type: "ytmnp-toggle" }).catch(() => {});
  }
});
