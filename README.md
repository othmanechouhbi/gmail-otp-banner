# Gmail OTP Banner

Gmail OTP Banner is an open-source Chrome extension that helps users quickly copy recent verification codes from Gmail. After the user connects Gmail with Google OAuth, the extension scans recent Gmail messages locally in Chrome, detects likely one-time passwords, and displays the newest valid code in a small floating banner.

The extension is designed for privacy-sensitive use: it requests only the Gmail readonly scope, does not ask for Gmail passwords, does not sell data, does not use ads, and does not send Gmail content to any third-party server.

## Features

- Google OAuth sign-in through Chrome Identity.
- Gmail API readonly access only.
- Local OTP detection for recent verification emails.
- Floating banner with account label, OTP code, copy button, and close button.
- Multi-account support for up to four Gmail accounts.
- Baseline protection so codes received before account connection are not shown.
- No remote email storage.
- No third-party analytics using Gmail content.
- Open-source MIT license.

## Repository Structure

```text
extension/        Chrome extension source for Web Store upload
docs/             Privacy, terms, support, OAuth, and compliance documents
website/          Static public website for GitHub Pages or another host
store-assets/     Chrome Web Store screenshots and promotional images
github/           Issue, PR, contribution, and security templates
```

## Local Installation

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `extension/` folder.
5. Open the extension popup and connect a Gmail account.

## OAuth Configuration

Create a Google Cloud OAuth Client of type Chrome Extension and use the extension ID shown in `chrome://extensions`. The manifest uses:

```json
"oauth2": {
  "client_id": "964746287291-s6h959jaudksjku5htau2obfg9jfsek0.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/gmail.readonly"
  ]
}
```

## Privacy Summary

Gmail OTP Banner processes Gmail data locally inside the browser. The extension scans recent Gmail messages only to identify verification codes. It stores only minimal operational data, such as connected account email, access token, latest OTP, latest message ID, baseline timestamp, processed message IDs, and ignored message IDs. It does not store full email bodies remotely and does not transfer Gmail content to external servers.

## Release

See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for Chrome Web Store and Google OAuth production steps.

## License

MIT License. See [LICENSE](LICENSE).
