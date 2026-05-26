# Google Cloud Setup For Gmail OTP Banner

Gmail OTP Banner is not published on the Chrome Web Store yet. Users install it manually from GitHub using Chrome Developer Mode, and each user must create their own Google Cloud project and OAuth Client ID.

## Before You Start

Load the extension in Chrome first so you can copy the local Extension ID from `chrome://extensions/`.

The Extension ID will look like this:

```text
abcdefghijklmnopabcdefghijklmnop
```

Keep this ID. You will paste it into the Chrome Extension OAuth Client in Google Cloud.

## 1. Create Or Access Google Cloud Console

1. Go to `https://console.cloud.google.com/`.
2. Sign in with your Google/Gmail account.
3. If you do not have a Google Cloud account yet, create one using your Gmail account.
4. Accept the Google Cloud terms if Google asks you to.

## 2. Create A Google Cloud Project

1. At the top of Google Cloud Console, click the project selector.
2. Click **New Project**.
3. Use `Gmail OTP Banner` or `OTP Extension` as the project name.
4. For **Organization**, choose **No organization** if you are using a personal account.
5. Click **Create**.
6. Wait until the project is created.
7. Make sure the new project is selected at the top of the page.

## 3. Enable Gmail API

1. Go to `https://console.cloud.google.com/apis/dashboard`.
2. Make sure your new project is selected.
3. Click **Enable APIs and Services**.
4. Search for `Gmail API`.
5. Open **Gmail API**.
6. Click **Enable**.
7. Wait until Gmail API is enabled.

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

Branding path:

`Google Cloud Console -> Google Auth Platform -> Branding`

## 5. Add Your Gmail Account As A Test User

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

## 7. Add The Client ID To The Extension

1. Open `extension/manifest.json`.
2. Replace `YOUR_CHROME_EXTENSION_OAUTH_CLIENT_ID` with your generated Client ID.
3. Save the file.
4. Reload the extension at `chrome://extensions/`.

## Troubleshooting

- `Error 403: access_denied`: add your Gmail address under **Test users**.
- `Error 400: redirect_uri_mismatch`: create a Chrome Extension OAuth Client with the exact Extension ID from Chrome.
- `access_type offline not allowed`: remove `access_type=offline` from the OAuth request.
- `invalid client_id`: make sure `extension/manifest.json` contains the Client ID from the selected Google Cloud project.
- Gmail API not enabled: enable Gmail API for the selected project.
