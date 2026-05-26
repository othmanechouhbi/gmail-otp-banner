# Chrome Web Store Listing

## Title

Gmail OTP Banner

## Short Description

Detect recent Gmail verification codes locally and copy them from a clean floating banner.

## Long Description

Gmail OTP Banner helps you copy recent verification codes from Gmail faster. Connect Gmail with Google OAuth, receive a new verification email, and the extension displays the newest valid OTP in a small top-right banner with a Copy button.

The extension is built for privacy-conscious users. It uses the Gmail API readonly scope, processes message content locally in Chrome, and does not sell, upload, or use Gmail content for advertising.

Key features:

- Detects recent Gmail verification codes.
- Supports numeric, alphanumeric, and hyphenated OTP formats.
- Shows the Gmail account source for each detected code.
- Includes a Copy button and auto-closing floating banner.
- Supports up to four connected Gmail accounts.
- Avoids showing old codes received before account connection.
- Uses Google OAuth only and never asks for your Gmail password.
- Open-source and privacy-focused.

Privacy:

Gmail OTP Banner requests `https://www.googleapis.com/auth/gmail.readonly` only. Gmail content is processed locally in the browser to detect OTP codes. Full email content is not stored remotely, sold, shared with advertisers, or used for third-party analytics.

## Category

Productivity

## Keywords

Gmail OTP, verification code, security code, Gmail code, OTP helper, two factor code, authentication code, Chrome extension, productivity, Gmail API

## Release Notes

Initial production release with Gmail OAuth, local OTP detection, multi-account support, and floating banner UI.

## Permission Justifications

- `identity`: Authenticates Gmail accounts through Google OAuth.
- `storage`: Stores connected account metadata, tokens, latest OTP, processed message IDs, ignored message IDs, and timestamps locally.
- `notifications`: Optionally notifies the user when a new OTP is detected.
- `scripting`: Injects the floating OTP banner into the active tab.
- `activeTab`: Targets the active tab for banner display.
- `alarms`: Supports periodic background checks.
- `https://www.googleapis.com/*`: Calls Google OAuth userinfo and Gmail API endpoints.
- `https://*/*` and `http://*/*`: Allows the extension to display the floating banner on the user's active webpage.

## Screenshot Checklist

- Screenshot 1: Floating OTP banner on a neutral page.
- Screenshot 2: Popup showing connected accounts.
- Screenshot 3: Privacy-focused local processing message.

## Store Asset Sizes

- Store icon: 128 x 128 PNG.
- Screenshots: 1280 x 800 PNG.
- Small promotional tile: 440 x 280 PNG.
- Marquee promotional tile: 1400 x 560 PNG.
- Additional promotional tile included: 920 x 680 PNG.
