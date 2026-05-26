# OAuth Verification Guide

Gmail OTP Banner is not currently published on the Chrome Web Store. The current distribution model is open-source sharing through GitHub and YouTube.

Users install the extension manually and configure their own Google Cloud project and OAuth Client ID.

## Google Cloud Setup

1. Go to the Google Cloud Console.
2. Create a project.
3. Enable Gmail API:
   `Google Cloud Console → APIs & Services → Library → Gmail API → Enable`
4. Configure app branding:
   `Google Cloud Console → Google Auth Platform → Branding`
5. Add yourself as a test user:
   `Google Cloud Console → Google Auth Platform → Audience → Test users`
6. Create a Chrome Extension OAuth Client:
   `Google Cloud Console → Google Auth Platform → Clients → Create Client → Chrome Extension`

## Chrome Extension ID

1. Open `chrome://extensions/`.
2. Enable **Developer Mode**.
3. Click **Load unpacked**.
4. Select the `extension` folder.
5. Copy the generated Chrome Extension ID.
6. Paste that ID into the Chrome Extension OAuth Client in Google Cloud.

The local extension ID must match the OAuth Client Chrome Extension ID. If the user removes and reloads the extension, the ID can change. If the ID changes, OAuth may fail with `redirect_uri_mismatch`.

To avoid this, keep the same extension loaded and use **Reload** instead of **Remove**.

## Manifest Configuration

After creating the OAuth Client ID, copy the Client ID into `extension/manifest.json`:

```json
"oauth2": {
  "client_id": "YOUR_CHROME_EXTENSION_OAUTH_CLIENT_ID",
  "scopes": [
    "https://www.googleapis.com/auth/gmail.readonly"
  ]
}
```

Replace `YOUR_CHROME_EXTENSION_OAUTH_CLIENT_ID` with your real Client ID, then reload the extension from `chrome://extensions/`.

## Common OAuth Errors

| Error | Fix |
| --- | --- |
| `Error 403: access_denied` | Add your Gmail address as a test user. |
| `Error 400: redirect_uri_mismatch` | Check that the Chrome Extension ID in Google Cloud matches the local extension ID. |
| `access_type offline not allowed` | Remove `access_type=offline` from the OAuth request. |
| `invalid client_id` | Confirm the Client ID in `extension/manifest.json` is correct. |
| Gmail API not enabled | Enable Gmail API in the selected Google Cloud project. |

## Future Verification

Chrome Web Store publication and full OAuth verification may be added in the future. For now, users should run the extension locally as a test user in their own Google Cloud project.
