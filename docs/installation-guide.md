# Gmail OTP Banner Installation Guide

Gmail OTP Banner is not published on the Chrome Web Store yet. Clone the repository from GitHub and install the extension manually using Chrome Developer Mode.

Each user must create their own Google Cloud project and OAuth Client ID.

## 1. Clone the repository

Users need Git installed.

```bash
git clone https://github.com/YOUR_USERNAME/gmail-otp-banner.git
cd gmail-otp-banner
```

Replace `YOUR_USERNAME` with the real GitHub username.

If you do not have Git, click **Code -> Download ZIP** on GitHub, extract the ZIP, and open the extracted folder.

## 2. Load the extension in Chrome Developer Mode

1. Open Google Chrome.
2. Go to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the folder named `extension`.
6. Chrome will load the extension.
7. Copy the generated Extension ID.

Important: the user must select the `extension` folder, not the full repository root folder.

The Extension ID will look like this:

```text
abcdefghijklmnopabcdefghijklmnop
```

The user must keep this ID because it will be used in Google Cloud.

## 3. Create or access Google Cloud Console

1. Go to `https://console.cloud.google.com/`.
2. Sign in with your Google/Gmail account.
3. If you do not have a Google Cloud account yet, create one using your Gmail account.
4. You may need to accept Google Cloud terms.

## 4. Create a Google Cloud project

1. At the top of Google Cloud Console, click the project selector.
2. Click **New Project**.
3. For the project name, use `Gmail OTP Banner` or `OTP Extension`.
4. For **Organization**, choose **No organization** if you are using a personal account.
5. Click **Create**.
6. Wait until the project is created.
7. Make sure the new project is selected at the top of the page.

## 5. Enable Gmail API

1. Go to `https://console.cloud.google.com/apis/dashboard`.
2. Make sure your new project is selected.
3. Click **Enable APIs and Services**.
4. Search for `Gmail API`.
5. Open **Gmail API**.
6. Click **Enable**.
7. Wait until Gmail API is enabled.

## 6. Configure Google Auth Platform

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

## 7. Add your Gmail account as a test user

1. In Google Auth Platform, go to **Audience**.
2. Find **Test users**.
3. Click **Add users**.
4. Enter your Gmail address.
5. Click **Save**.

Important: if you do not add your email as a test user, Google may show `Error 403: access_denied`.

## 8. Create OAuth Client ID

1. In Google Auth Platform, go to **Clients**.
2. Click **Create Client**.
3. For **Application type**, choose **Chrome Extension**.
4. For **Name**, enter `Gmail OTP Banner`.
5. For **Item ID** or **Extension ID**, paste the Extension ID copied from `chrome://extensions/`.
6. Click **Create**.
7. Copy the generated Client ID.

The Client ID looks like this:

```text
xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

## 9. Add your OAuth Client ID to the extension

1. Open the project folder.
2. Open `extension/manifest.json`.
3. Find:

```json
"client_id": "YOUR_CHROME_EXTENSION_OAUTH_CLIENT_ID"
```

Replace it with your own Client ID.

Example:

```json
"client_id": "1234567890-example.apps.googleusercontent.com"
```

4. Save the file.

## 10. Reload the extension

1. Go back to `chrome://extensions/`.
2. Find Gmail OTP Banner.
3. Click **Reload**.
4. Open the extension popup.
5. Click **Connect an account**.
6. Sign in with the same Gmail account you added as a test user.
7. Grant permission.
8. The extension is now ready.

## 11. Test the extension

1. Open any service that sends a verification code to your Gmail.
2. Request a new verification code.
3. The extension should show a small floating banner.
4. Click **Copy** to copy the OTP.

Important behavior:

- The extension does not show old codes received before connection.
- It only shows new OTP codes received after connection.
- The banner automatically disappears after a few seconds.

## Troubleshooting

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

## YouTube setup tutorial

A full setup video will be available here:

[YouTube tutorial link coming soon]

## Privacy note

Gmail OTP Banner:

- Uses Google OAuth only.
- Never asks for your Gmail password.
- Reads recent Gmail messages only to detect OTP codes.
- Processes OTP detection locally in the browser.
- Does not send Gmail content to any external server.
- Does not sell or share Gmail data.
