console.log('InboxMD AI Agent content script loaded');

// Function to check if we're on the Gmail sign-in page
function isGmailSignInPage() {
  return window.location.href.includes('accounts.google.com') &&
         document.title.includes('Sign in - Google Accounts');
}

// Function to check if we're on the main Gmail interface
function isGmailMainInterface() {
  return window.location.href.includes('mail.google.com') &&
         !isGmailSignInPage();
}

// Function to add a custom element to the page
function addCustomElement(message) {
  const customDiv = document.createElement('div');
  customDiv.id = 'inboxmd-custom-element';
  customDiv.style.position = 'fixed';
  customDiv.style.top = '10px';
  customDiv.style.right = '10px';
  customDiv.style.padding = '10px';
  customDiv.style.backgroundColor = '#f0f0f0';
  customDiv.style.border = '1px solid #ccc';
  customDiv.style.borderRadius = '5px';
  customDiv.textContent = message;
  document.body.appendChild(customDiv);
}

// Function to interact with emails (placeholder)
function interactWithEmails() {
  console.log('Interacting with emails...');
  // TODO: Implement email interaction logic
}

// Function for AI-powered email management (placeholder)
function aiEmailManagement() {
  console.log('AI-powered email management...');
  // TODO: Implement AI-powered email management features
}

// Main function to run when the content script loads
function main() {
  console.log('InboxMD AI Agent content script running');
  if (isGmailSignInPage()) {
    console.log('On Gmail sign-in page');
    addCustomElement('InboxMD AI Agent is active on sign-in page');
  } else if (isGmailMainInterface()) {
    console.log('On Gmail main interface');
    addCustomElement('InboxMD AI Agent is active on Gmail');
    interactWithEmails();
    aiEmailManagement();
  } else {
    console.log('Not on a recognized Gmail page');
  }
}

// Run the main function
main();

// Listen for changes in the DOM to handle dynamic content loading
const observer = new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    if (mutation.type === 'childList') {
      // Check if new emails have been loaded
      // This is a simplified check and may need to be adjusted based on Gmail's structure
      if (mutation.target.querySelector('.aDP')) {
        console.log('New emails detected');
        interactWithEmails();
        aiEmailManagement();
      }
    }
  }
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });
