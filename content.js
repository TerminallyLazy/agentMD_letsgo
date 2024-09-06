console.log('InboxMD AI Agent content script loaded');

// Function to check if we're on the Gmail sign-in page
function isGmailSignInPage() {
  return window.location.href.includes('accounts.google.com') && 
         document.title.includes('Sign in - Google Accounts');
}

// Function to add a custom element to the sign-in page
function addCustomElement() {
  const customDiv = document.createElement('div');
  customDiv.id = 'inboxmd-custom-element';
  customDiv.style.position = 'fixed';
  customDiv.style.top = '10px';
  customDiv.style.right = '10px';
  customDiv.style.padding = '10px';
  customDiv.style.backgroundColor = '#f0f0f0';
  customDiv.style.border = '1px solid #ccc';
  customDiv.style.borderRadius = '5px';
  customDiv.textContent = 'InboxMD AI Agent is active';
  document.body.appendChild(customDiv);
}

// Main function to run when the content script loads
function main() {
  console.log('InboxMD AI Agent content script running');
  if (isGmailSignInPage()) {
    console.log('On Gmail sign-in page');
    addCustomElement();
  } else {
    console.log('Not on Gmail sign-in page');
  }
}

// Run the main function
main();
