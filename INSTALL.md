# Install Gmail OTP Banner

Gmail OTP Banner is not currently available on the Chrome Web Store. Install it manually from the source code using Chrome Developer Mode.

## Manual Install

1. Download or clone this repository.
2. Open `chrome://extensions/`.
3. Enable **Developer Mode**.
4. Click **Load unpacked**.
5. Select the `extension` folder.
6. Copy the generated Chrome Extension ID.
7. Create and configure a Google Cloud project.
8. Enable Gmail API.
9. Configure the OAuth consent screen.
10. Add yourself as a test user.
11. Create an OAuth Client ID of type **Chrome Extension**.
12. Paste the Chrome Extension ID.
13. Copy the OAuth Client ID.
14. Paste the OAuth Client ID into `extension/manifest.json`.
15. Reload the extension.
16. Click **Connect an account**.

## Connect Gmail

1. Click the Gmail OTP Banner icon.
2. Click **Connect an account**.
3. Sign in with Google.
4. Accept the Gmail read-only permission.

Gmail OTP Banner never asks for your Gmail password. Sign-in is handled by Google.

## Use The Extension

1. Receive a new OTP, verification code, security code, or passcode email in Gmail after connecting the account.
2. Gmail OTP Banner detects the newest valid code.
3. A floating banner appears in the top-right corner of Chrome.
4. Click **Copy** to copy the code.
5. The banner closes automatically after a few seconds, or you can close it with **X**.

## Notes

- Codes received before you connected the account are not shown.
- The extension reads only recent Gmail messages for OTP detection.
- The extension does not send Gmail content to external servers.
- The extension does not store full email bodies.
