// Initialize the extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('InboxMD AI Agent installed');
    // Perform necessary initialization
    chrome.storage.sync.set({ 'settings': { 'enabled': true } }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving default settings:', chrome.runtime.lastError);
      } else {
        console.log('Default settings saved');
      }
    });
  } else if (details.reason === 'update') {
    console.log('InboxMD AI Agent updated');
    // Handle necessary updates
    chrome.storage.sync.get('settings', (data) => {
      if (chrome.runtime.lastError) {
        console.error('Error retrieving settings:', chrome.runtime.lastError);
      } else {
        const settings = data.settings || {};
        // Perform any necessary migrations or updates to settings
        chrome.storage.sync.set({ 'settings': settings }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error updating settings:', chrome.runtime.lastError);
          } else {
            console.log('Settings updated after extension update');
          }
        });
      }
    });
  }
});

// Set up uninstall URL
chrome.runtime.setUninstallURL('https://example.com/feedback', () => {
  if (chrome.runtime.lastError) {
    console.error('Error setting uninstall URL:', chrome.runtime.lastError);
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get('settings', (data) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ settings: data.settings || {} });
      }
    });
    return true; // Indicates that the response is asynchronous
  } else if (request.action === 'updateSettings') {
    chrome.storage.sync.set({ 'settings': request.settings }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true });
      }
    });
    return true;
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This event won't fire if default_popup is set in manifest.json
  // It's here for demonstration purposes
  console.log('Extension icon clicked');
});

// Example of using chrome.tabs API (requires "tabs" permission)
// Uncomment and add "tabs" to permissions in manifest.json if needed
/*
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('mail.google.com')) {
    chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' });
  }
});
*/
