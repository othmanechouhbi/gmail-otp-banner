# Terms Of Service

Effective date: May 26, 2026

## Overview

Gmail OTP Banner is an open-source Chrome extension shared for GitHub and YouTube viewers who want to install it locally.

It is not currently available on the Chrome Web Store. Users are responsible for downloading the source code, configuring their own Google Cloud project, creating their own OAuth Client ID, and installing the extension manually using Chrome Developer Mode.

## Use Of The Extension

Gmail OTP Banner helps detect recent Gmail verification codes and display the newest valid OTP in a small browser banner.

The extension connects to Gmail using Google OAuth, runs locally in the browser, and uses Gmail read-only access.

## User Responsibilities

You are responsible for:

- Creating and managing your own Google Cloud project.
- Enabling Gmail API.
- Creating an OAuth Client ID of type Chrome Extension.
- Keeping your local Chrome Extension ID matched with your OAuth Client configuration.
- Reviewing the source code before using it if you have security or privacy concerns.

## No Warranty

Gmail OTP Banner is provided as open-source software without warranty. It may not detect every verification code, and it may require manual setup or troubleshooting.

## Privacy

The extension processes Gmail data locally in the browser. It does not sell data, does not send Gmail content to external servers, and does not store full email bodies.

See `docs/privacy-policy.md` for more information.

## Future Chrome Web Store Publication

Chrome Web Store publication may be added in the future, but currently users must install Gmail OTP Banner manually from the source code.
