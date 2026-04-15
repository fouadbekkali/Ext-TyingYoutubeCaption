// background.js

chrome.action.onClicked.addListener(async (tab) => {
  // Open the side panel when the extension icon is clicked
  await chrome.sidePanel.open({ tabId: tab.id });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "SET_TITLE" && sender.tab) {
    chrome.action.setTitle({
      title: message.title,
      tabId: sender.tab.id
    });
  }
});