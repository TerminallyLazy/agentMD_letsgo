# OAuth2 Authentication Documentation for InboxMD AI Agent

## Overview
This document provides a comprehensive guide to the OAuth2 authentication process implemented in the InboxMD AI Agent Chrome extension. The extension uses the Google OAuth2 API for user authentication, allowing secure access to user data.

## Configuration

### OAuth2 Settings
- Client ID: Stored securely and retrieved using `getClientId()` function from `config.js`
- Redirect URL: Automatically generated using `chrome.identity.getRedirectURL()`
- Scopes:
  - https://www.googleapis.com/auth/userinfo.email
  - https://www.googleapis.com/auth/userinfo.profile

## Authentication Flow

1. **Initiating Authentication**
   - Triggered by user clicking the "Login" button in the popup
   - Calls `startAuth()` function in `popup.js`
   - Sends a message to the background script to start the OAuth2 flow

2. **Token Retrieval**
   - Background script uses `chrome.identity.getAuthToken()` to get an access token
   - If successful, the token is stored securely using `chrome.storage.sync`

3. **Token Management**
   - Tokens are stored securely using `chrome.storage.sync`
   - The extension checks for token expiration before use
   - If a token is expired, it's automatically refreshed

4. **User Information**
   - After successful authentication, user info is fetched from Google's userinfo endpoint
   - User's email is displayed in the popup UI

## Key Components

### Background Script (`background.js`)
- Handles OAuth2 flow and token management
- Provides functions for token retrieval, storage, and refresh
- Listens for messages from the popup script

### Popup Script (`popup.js`)
- Manages the user interface for authentication
- Initiates the auth flow when the user clicks "Login"
- Displays user information and handles logout

### Manifest (`manifest.json`)
- Declares necessary permissions: "identity" and "storage"
- Specifies the background script and popup HTML file

## Security Considerations
- Client ID is stored securely and not exposed in client-side code
- Tokens are stored using `chrome.storage.sync` for security
- HTTPS is used for all API calls

## Setup Instructions
1. Replace `YOUR_CLIENT_ID_HERE` in `config.js` with your actual OAuth2 client ID
2. Ensure `config.js` is not committed to version control
3. Add `config.js` to `.gitignore`

## Testing the OAuth2 Flow
1. Load the extension in Chrome
2. Click the extension icon to open the popup
3. Click "Login" and follow the Google sign-in process
4. Verify that user information is displayed after successful login
5. Test logout functionality

## Troubleshooting
- Check console logs for error messages
- Ensure all required permissions are declared in `manifest.json`
- Verify that the Client ID is correct and authorized for the extension

## Future Improvements
- Implement additional security measures like PKCE (Proof Key for Code Exchange)
- Add support for multiple Google accounts
- Enhance error handling and user feedback
