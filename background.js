// OAuth2 configuration
const REDIRECT_URL = chrome.identity.getRedirectURL();
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];

// Initialize the extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('InboxMD AI Agent installed');
    // Perform necessary initialization
    chrome.storage.sync.set({ 'settings': { 'enabled': true }, 'token': null, 'tokenExpiry': null }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving default settings:', chrome.runtime.lastError);
      } else {
        console.log('Default settings saved');
      }
    });
  } else if (details.reason === 'update') {
    console.log('InboxMD AI Agent updated');
    // Handle necessary updates
    chrome.storage.sync.get(['settings', 'token', 'tokenExpiry'], (data) => {
      if (chrome.runtime.lastError) {
        console.error('Error retrieving settings:', chrome.runtime.lastError);
      } else {
        const settings = data.settings || {};
        const token = data.token || null;
        const tokenExpiry = data.tokenExpiry || null;
        // Perform any necessary migrations or updates to settings
        chrome.storage.sync.set({ 'settings': settings, 'token': token, 'tokenExpiry': tokenExpiry }, () => {
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

// OAuth2 authentication flow
function authenticate() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        const now = new Date();
        const expiryTime = new Date(now.getTime() + 3600 * 1000); // Token expires in 1 hour
        chrome.storage.sync.set({ 'token': token, 'tokenExpiry': expiryTime.getTime() }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(token);
          }
        });
      }
    });
  });
}

// Token management
function getToken() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['token', 'tokenExpiry'], (data) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (data.token && data.tokenExpiry) {
        const now = new Date();
        if (now.getTime() < data.tokenExpiry) {
          resolve(data.token);
        } else {
          refreshToken().then(resolve).catch(reject);
        }
      } else {
        authenticate().then(resolve).catch(reject);
      }
    });
  });
}

// Refresh token
function refreshToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        const now = new Date();
        const expiryTime = new Date(now.getTime() + 3600 * 1000); // Token expires in 1 hour
        chrome.storage.sync.set({ 'token': token, 'tokenExpiry': expiryTime.getTime() }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(token);
          }
        });
      }
    });
  });
}

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
  } else if (request.action === 'authenticate') {
    authenticate()
      .then((token) => sendResponse({ success: true, token }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === 'getToken') {
    getToken()
      .then((token) => sendResponse({ success: true, token }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This event won't fire if default_popup is set in manifest.json
  // It's here for demonstration purposes
  console.log('Extension icon clicked');
  authenticate()
    .then(() => console.log('Authentication successful'))
    .catch((error) => console.error('Authentication failed:', error));
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
