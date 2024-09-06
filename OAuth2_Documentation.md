# OAuth2 Process Documentation for InboxMD AI Agent Chrome Extension

## 1. OAuth2 Configuration

The OAuth2 configuration for the InboxMD AI Agent is defined in the `manifest.json` file:

```json
"oauth2": {
  "client_id": "1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/gmail.modify"
  ]
}
```

- **Client ID**: The unique identifier for the application.
- **Scopes**: The extension requests the `gmail.modify` scope, which allows it to read, send, delete, and manage the user's Gmail messages.

## 2. Authentication Flow

The authentication flow is implemented in the `background.js` file:

1. **Initialization**: When the extension is installed or updated, it initializes storage for settings, token, and token expiry.

2. **Authentication Function**:
   ```javascript
   function authenticate() {
     return new Promise((resolve, reject) => {
       chrome.identity.getAuthToken({ interactive: true }, (token) => {
         // Token handling logic
       });
     });
   }
   ```
   This function uses Chrome's identity API to get an auth token interactively.

3. **User Authorization**: When the user clicks the extension icon or when authentication is required, the `authenticate()` function is called, prompting the user to grant permissions.

## 3. Token Management

Token management is handled by several functions in `background.js`:

1. **Getting a Token**:
   ```javascript
   function getToken() {
     // Check for existing token and its validity
     // Refresh or authenticate if necessary
   }
   ```

2. **Refreshing a Token**:
   ```javascript
   function refreshToken() {
     // Use chrome.identity.getAuthToken with interactive: false
     // Update token and expiry in storage
   }
   ```

3. **Token Storage**: Tokens are stored in Chrome's sync storage along with their expiry time.

## 4. User Authorization Process

1. The user installs the InboxMD AI Agent extension.
2. When the user first attempts to use a feature requiring Gmail access:
   - The extension calls the `authenticate()` function.
   - Chrome presents the user with a Google sign-in and permissions dialog.
   - The user grants permission for the requested scopes.
3. After successful authentication:
   - The token is stored securely in Chrome's sync storage.
   - The token expiry is set (typically 1 hour from acquisition).

## 5. Security Considerations

- Tokens are never exposed to the content scripts, maintaining security.
- The extension uses the principle of least privilege, requesting only necessary permissions.
- Token refresh is handled automatically when needed, minimizing user interaction.

## 6. Error Handling

The extension includes error handling for various scenarios:
- Authentication failures
- Token refresh failures
- Storage errors

Each error is logged and, where appropriate, prompts the user for action or retries the operation.

## 7. Future Improvements

- Implement token revocation on extension uninstall.
- Add more granular scopes if specific Gmail features are not needed.
- Enhance error reporting and user feedback mechanisms.

This documentation outlines the OAuth2 process implemented in the InboxMD AI Agent Chrome extension, covering the authentication flow, token management, and user authorization processes.
