// Initialize variables
let isProcessing = false;
let currentNotification = null;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    // Start processing
    isProcessing = true;
    createNotification('AgentMD is processing your request...');
    // Simulate processing (replace with actual processing logic)
    setTimeout(() => {
      sendResponse({ output: 'Processing complete' });
      updateNotification('Processing complete. Click to view results.');
      isProcessing = false;
    }, 3000);
    return true; // Indicates that the response is sent asynchronously
  } else if (message.action === 'sendCommand') {
    // Handle command
    console.log('Received command:', message.command);
    // Simulate command processing (replace with actual command handling logic)
    setTimeout(() => {
      sendResponse({ output: `Processed command: ${message.command}` });
    }, 1000);
    return true; // Indicates that the response is sent asynchronously
  }
});

// Create a notification
function createNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'AgentMD',
    message: message,
    priority: 2
  }, (notificationId) => {
    currentNotification = notificationId;
  });
}

// Update existing notification
function updateNotification(message) {
  if (currentNotification) {
    chrome.notifications.update(currentNotification, {
      message: message
    });
  }
}

// Listen for notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === currentNotification) {
    // Open or focus the popup
    chrome.action.openPopup();
  }
});

// Update extension icon or badge when needed
function updateExtensionIcon(hasUpdate) {
  if (hasUpdate) {
    chrome.action.setBadgeText({text: '!'});
    chrome.action.setBadgeBackgroundColor({color: '#FF0000'});
  } else {
    chrome.action.setBadgeText({text: ''});
  }
}

// Example of how to use the updateExtensionIcon function
// This should be called when there's an update or when the update is viewed
// updateExtensionIcon(true); // To show there's an update
// updateExtensionIcon(false); // To clear the update indicator
