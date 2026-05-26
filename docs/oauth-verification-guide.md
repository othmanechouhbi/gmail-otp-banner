# OAuth Verification Guide

Gmail OTP Banner is not currently published on the Chrome Web Store. The current distribution model is open-source sharing through GitHub and YouTube.

Users install the extension manually from GitHub using Chrome Developer Mode, then configure their own Google Cloud project and OAuth Client ID.

## 1. Load The Extension And Copy The Extension ID

1. Open Google Chrome.
2. Go to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the `extension` folder.
6. Copy the generated Extension ID.

Important: select the `extension` folder, not the full repository root folder.

The Extension ID will look like this:

```text
abcdefghijklmnopabcdefghijklmnop
```

The local Extension ID must match the Chrome Extension ID used in Google Cloud.

## 2. Create Or Select A Google Cloud Project

1. Go to `https://console.cloud.google.com/`.
2. Sign in with your Google/Gmail account.
3. Click the project selector at the top.
4. Click **New Project**.
5. Use `Gmail OTP Banner` or `OTP Extension` as the project name.
6. For **Organization**, choose **No organization** if you are using a personal account.
7. Click **Create**.
8. Make sure the new project is selected.

## 3. Enable Gmail API

1. Go to `https://console.cloud.google.com/apis/dashboard`.
2. Click **Enable APIs and Services**.
3. Search for `Gmail API`.
4. Open **Gmail API**.
5. Click **Enable**.

Path:

`Google Cloud Console -> APIs & Services -> Library -> Gmail API -> Enable`

## 4. Configure Google Auth Platform

1. Go to `https://console.cloud.google.com/auth/overview`.
2. Click **Get started**.
3. For **App name**, enter `Gmail OTP Banner`.
4. For **User support email**, select your email.
5. Click **Next**.
6. For **Audience**, choose **External**.
7. Click **Next**.
8. For **Contact information**, enter your email.
9. Accept the Google API Services User Data Policy checkbox.
10. Click **Create**.

Path:

`Google Cloud Console -> Google Auth Platform -> Branding`

## 5. Add Yourself As A Test User

1. In Google Auth Platform, go to **Audience**.
2. Find **Test users**.
3. Click **Add users**.
4. Enter your Gmail address.
5. Click **Save**.

Path:

`Google Cloud Console -> Google Auth Platform -> Audience -> Test users`

Important: if you do not add your email as a test user, Google may show `Error 403: access_denied`.

## 6. Create OAuth Client ID

1. In Google Auth Platform, go to **Clients**.
2. Click **Create Client**.
3. For **Application type**, choose **Chrome Extension**.
4. For **Name**, enter `Gmail OTP Banner`.
5. For **Item ID** or **Extension ID**, paste the Extension ID copied from `chrome://extensions/`.
6. Click **Create**.
7. Copy the generated Client ID.

Path:

`Google Cloud Console -> Google Auth Platform -> Clients -> Create Client -> Chrome Extension`

The Client ID looks like this:

```text
xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

## 7. Add Your OAuth Client ID To manifest.json

Open `extension/manifest.json` and find:

```json
"client_id": "YOUR_CHROME_EXTENSION_OAUTH_CLIENT_ID"
```

Replace it with your own Client ID:

```json
"client_id": "1234567890-example.apps.googleusercontent.com"
```

Save the file, then reload the extension from `chrome://extensions/`.

## 8. Connect The Account

1. Open the extension popup.
2. Click **Connect an account**.
3. Sign in with the same Gmail account you added as a test user.
4. Grant permission.

The extension is now ready.

## Common OAuth Errors

### Error 400: redirect_uri_mismatch

Cause: the Extension ID in Google Cloud does not match the Extension ID in Chrome.

Fix:

1. Copy the current Extension ID from `chrome://extensions/`.
2. Go to `Google Cloud -> Google Auth Platform -> Clients`.
3. Create a new Chrome Extension OAuth Client using that exact ID.
4. Copy the new Client ID.
5. Paste it into `extension/manifest.json`.
6. Reload the extension.

### Error 403: access_denied

Cause: your Gmail account is not added as a test user.

Fix:

1. Go to `Google Cloud -> Google Auth Platform -> Audience`.
2. Add your Gmail address under **Test users**.
3. Save.
4. Try again.

### Gmail API Not Enabled

Cause: the Gmail API is not enabled for the selected project.

Fix:

1. Go to `Google Cloud -> APIs & Services -> Library`.
2. Search for `Gmail API`.
3. Click **Enable**.

### Invalid client_id

Cause: the Client ID in `manifest.json` is wrong or belongs to another project.

Fix:

1. Copy the correct Client ID from Google Cloud.
2. Paste it into `extension/manifest.json`.
3. Save.
4. Reload the extension.

### Extension ID Changed

Cause: the extension was removed and loaded again.

Fix:

1. Avoid removing the extension during setup.
2. Use **Reload** instead.
3. If the ID changed, create a new OAuth Client ID with the new Extension ID.

### access_type offline Not Allowed

Cause: Chrome extension OAuth should not request offline access for this setup.

Fix: remove `access_type=offline` from the OAuth request.

## Future Verification

Chrome Web Store publication and full OAuth verification may be added in the future. For now, users should run the extension locally as a test user in their own Google Cloud project.
