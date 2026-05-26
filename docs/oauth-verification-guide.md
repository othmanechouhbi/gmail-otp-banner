# Google OAuth Production and Verification Guide

This guide prepares Gmail OTP Banner for Google OAuth Production approval.

## 1. Confirm OAuth Client Type

Open Google Cloud Console:

APIs & Services > Credentials > OAuth 2.0 Client IDs

Use an OAuth client of type Chrome Extension. Enter the production Chrome extension ID from Chrome Web Store or `chrome://extensions`.

## 2. Configure OAuth Consent Screen

Go to:

APIs & Services > OAuth consent screen

Fill these fields:

- App name: Gmail OTP Banner
- User support email: your support email
- App logo: use `store-assets/store-icon.png`
- Application home page: public website URL
- Application privacy policy link: public privacy policy URL
- Application terms of service link: public terms URL
- Authorized domains: your website domain
- Developer contact information: your developer email

## 3. Add Scope

Go to:

APIs & Services > OAuth consent screen > Data Access

Add:

`https://www.googleapis.com/auth/gmail.readonly`

Justification wording:

Gmail OTP Banner uses Gmail readonly access to search recent Gmail messages for verification-code emails and display the newest valid OTP locally in the user's browser. The extension does not send, modify, delete, or compose emails. Message content is processed locally and is not stored remotely, sold, used for advertising, or transferred to third-party analytics providers.

## 4. Move to Production

Go to:

APIs & Services > OAuth consent screen > Publishing status

Click Publish App or move from Testing to Production. If Google requires verification because Gmail readonly is a sensitive scope, submit the verification request.

## 5. Prepare Verification Video

Record a clear video showing:

1. Opening Chrome with Gmail OTP Banner installed.
2. Opening the extension popup.
3. Clicking Connect an account.
4. Google OAuth consent screen showing Gmail readonly permission.
5. Completing sign-in.
6. Receiving or opening a fresh verification email.
7. The extension showing the OTP banner.
8. Copying the code.
9. Showing the privacy policy and limited use disclosure pages.

Narration suggestion:

Gmail OTP Banner requests Gmail readonly access only to scan recent Gmail messages for verification codes. The extension processes message content locally in Chrome, stores only minimal operational data, and does not send Gmail content to any server.

## 6. Avoiding Rejection

- Do not request broader Gmail scopes.
- Ensure the Chrome Web Store listing, website, and OAuth screen use the same app name.
- Ensure the privacy policy is public and accessible without login.
- Include the Limited Use disclosure in the privacy policy and on a dedicated page.
- Make sure the verification video shows the exact requested scope in use.
- Do not claim the extension reads unread emails only if it scans read and unread recent messages.
- Do not add analytics or advertising that uses Gmail content.

## 7. Suggested Reviewer Response

Gmail OTP Banner is a Chrome extension that helps users copy verification codes from Gmail. It requests `https://www.googleapis.com/auth/gmail.readonly` to search recent Gmail messages for OTP-related emails. The extension does not send, modify, delete, or compose email. It processes Gmail message content locally in the user's browser, stores only minimal local metadata, and does not upload full email content to external servers. Gmail data is not sold, not used for advertising, and not shared with third-party analytics providers.
