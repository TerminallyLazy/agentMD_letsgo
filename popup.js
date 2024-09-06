// UI elements
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const userInfo = document.getElementById('user-info');
const errorMessage = document.getElementById('error-message');

// Function to display error messages
function showError(message) {
  console.error(message);
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

// Function to update UI based on authentication status
function updateUI(isAuthenticated) {
  if (isAuthenticated) {
    loginButton.style.display = 'none';
    logoutButton.style.display = 'block';
    userInfo.style.display = 'block';
    errorMessage.style.display = 'none';
  } else {
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
    userInfo.style.display = 'none';
    errorMessage.style.display = 'none';
  }
}

// Function to start OAuth2 authentication
function startAuth() {
  console.log('Starting OAuth2 authentication');
  chrome.runtime.sendMessage({action: 'startAuth'}, function(response) {
    if (chrome.runtime.lastError) {
      showError(`Authentication failed: ${chrome.runtime.lastError.message}`);
    } else if (response && response.token) {
      console.log('Authentication successful, fetching user info');
      getUserInfo(response.token);
    } else {
      showError('Authentication failed: No token received');
    }
  });
}

// Function to logout
function logout() {
  console.log('Logging out');
  chrome.storage.sync.remove('oauth2_token', function() {
    if (chrome.runtime.lastError) {
      showError(`Logout failed: ${chrome.runtime.lastError.message}`);
    } else {
      console.log('Token removed successfully');
      updateUI(false);
    }
  });
}

// Function to get user info using the token
function getUserInfo(token) {
  console.log('Fetching user info');
  fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('User info fetched successfully');
    userInfo.textContent = `Logged in as: ${data.email}`;
    updateUI(true);
  })
  .catch(error => {
    showError(`Error fetching user info: ${error.message}`);
    updateUI(false);
  });
}

// Function to get and use the latest token
function getAndUseToken() {
  console.log('Getting latest token');
  chrome.runtime.sendMessage({action: 'getToken'}, function(response) {
    if (chrome.runtime.lastError) {
      showError(`Error getting token: ${chrome.runtime.lastError.message}`);
      updateUI(false);
    } else if (response && response.token) {
      console.log('Token retrieved successfully');
      getUserInfo(response.token);
    } else {
      console.log('No token available');
      updateUI(false);
    }
  });
}

// Check authentication status on popup open
document.addEventListener('DOMContentLoaded', function() {
  getAndUseToken();
});

// Event listeners
loginButton.addEventListener('click', startAuth);
logoutButton.addEventListener('click', logout);

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'tokenRefreshed') {
    console.log('Token refreshed, updating user info');
    getUserInfo(request.token);
  }
});
