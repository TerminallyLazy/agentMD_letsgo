import { getClientId } from './config.js';

// OAuth2 configuration
const CLIENT_ID = getClientId();
const REDIRECT_URL = chrome.identity.getRedirectURL();
const SCOPES = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];

// Function to get a new access token
function getAccessToken(interactive = false) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: interactive }, function(token) {
      if (chrome.runtime.lastError) {
        console.error('Error getting auth token:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        storeToken(token);
        resolve(token);
      }
    });
  });
}

// Function to store the token securely
function storeToken(token) {
  chrome.storage.sync.set({ 'oauth2_token': token }, function() {
    if (chrome.runtime.lastError) {
      console.error('Error storing token:', chrome.runtime.lastError);
    } else {
      console.log('Token stored successfully');
    }
  });
}

// Function to check if the token is expired
function isTokenExpired(token) {
  return new Promise((resolve) => {
    chrome.identity.getTokenInfo(token, function(tokenInfo) {
      if (chrome.runtime.lastError) {
        console.warn('Error checking token expiration:', chrome.runtime.lastError);
        resolve(true); // Assume expired if there's an error
      } else {
        const expiresIn = tokenInfo.expiresIn || 0;
        resolve(expiresIn <= 0);
      }
    });
  });
}

// Function to refresh the access token
async function refreshToken() {
  try {
    const oldToken = await getStoredToken();
    await chrome.identity.removeCachedAuthToken({ token: oldToken });
    const newToken = await getAccessToken(false);
    return newToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

// Function to get the stored access token
function getStoredToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('oauth2_token', function(result) {
      if (chrome.runtime.lastError) {
        console.error('Error retrieving stored token:', chrome.runtime.lastError);
        resolve(null);
      } else {
        resolve(result.oauth2_token || null);
      }
    });
  });
}

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
  } else if (request.action === 'startAuth') {
    getAccessToken(true)
      .then(token => sendResponse({ token: token }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  } else if (request.action === 'getToken') {
    getStoredToken()
      .then(async token => {
        if (token && await isTokenExpired(token)) {
          token = await refreshToken();
        }
        sendResponse({ token: token });
      })
      .catch(error => sendResponse({ error: error.message }));
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
