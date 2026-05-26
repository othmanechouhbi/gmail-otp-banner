# Gmail OTP Banner Release Checklist

## Before Publishing

- [ ] Confirm `extension/manifest.json` has the production OAuth Chrome Extension client ID.
- [ ] Confirm the extension ID in Google Cloud matches the packed or Web Store extension ID.
- [ ] Run a local test with `chrome://extensions` and the `extension/` folder.
- [ ] Connect Gmail and verify no old OTP appears immediately after login.
- [ ] Send a fresh OTP email and confirm the banner appears.
- [ ] Confirm the banner auto-closes after 5 seconds.
- [ ] Confirm the popup shows the connected account and latest OTP.
- [ ] Confirm no email body is stored in `chrome.storage.local`.
- [ ] Confirm no unapproved host permissions or scopes are present.

## Website

- [ ] Deploy `website/` to GitHub Pages, Cloudflare Pages, Netlify, Vercel, or another HTTPS host.
- [ ] Confirm the homepage links to Privacy Policy, Terms, Support, and Limited Use Disclosure.
- [ ] Add the Privacy Policy URL to Google Cloud OAuth consent screen.
- [ ] Add the homepage URL to Google Cloud OAuth consent screen.
- [ ] Add the support URL to Chrome Web Store listing.

## Google OAuth Production

- [ ] Open Google Cloud Console.
- [ ] Go to APIs & Services > OAuth consent screen.
- [ ] Set publishing status to Production.
- [ ] Add app name: Gmail OTP Banner.
- [ ] Add developer contact email.
- [ ] Add homepage URL.
- [ ] Add privacy policy URL.
- [ ] Add support URL.
- [ ] Add authorized domain for the website host.
- [ ] Add scope `https://www.googleapis.com/auth/gmail.readonly`.
- [ ] Submit sensitive scope verification.
- [ ] Upload a verification video showing sign-in, permission request, OTP detection, and local-only behavior.

## Chrome Web Store

- [ ] Zip the contents of `extension/`, not the parent folder.
- [ ] Create or update the Chrome Web Store item.
- [ ] Upload the ZIP.
- [ ] Upload `store-assets/store-icon.png`.
- [ ] Upload screenshots from `store-assets/screenshots/`.
- [ ] Upload promotional images from `store-assets/`.
- [ ] Add the short and long descriptions from `docs/chrome-store-description.md`.
- [ ] Complete privacy practices with the wording from the docs.
- [ ] Provide permission justifications.
- [ ] Submit for review.

## After Approval

- [ ] Tag the GitHub release as `v1.0.0`.
- [ ] Publish release notes from `CHANGELOG.md`.
- [ ] Monitor support email and GitHub issues.
- [ ] Track Google OAuth verification messages.
- [ ] Avoid adding new scopes without updating policy docs and OAuth review.
