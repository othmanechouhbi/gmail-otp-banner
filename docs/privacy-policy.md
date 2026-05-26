# Privacy Policy for Gmail OTP Banner

Effective date: May 26, 2026

Gmail OTP Banner is developed by Othmane Chouhbi. This Privacy Policy explains how the Chrome extension handles information when you use it to detect verification codes in Gmail.

## Summary

Gmail OTP Banner processes Gmail data locally in your browser to find recent verification codes. The extension does not sell your data, does not display ads, does not use Gmail content for analytics, and does not send full email content to any external server.

## Information the Extension Accesses

When you connect a Gmail account, Gmail OTP Banner requests the following Google OAuth scope:

`https://www.googleapis.com/auth/gmail.readonly`

This scope allows the extension to read Gmail messages. The extension uses this access only to scan recent messages that match verification-related search terms such as code, verification, OTP, security, authentication, confirmation, and passcode.

## Information Stored Locally

The extension stores limited operational data in Chrome local storage:

- Connected Gmail account email address.
- Google OAuth access token for the connected account.
- Connection timestamp.
- Baseline Gmail message timestamp.
- Latest detected OTP code.
- Latest Gmail message ID related to a detected OTP.
- Processed message IDs.
- Ignored message IDs.

The extension does not store full email bodies in Chrome storage.

## Email Content Handling

Email message content is requested from Gmail only when needed for OTP detection. Processing happens locally inside the browser extension. Message bodies are held in memory only long enough to extract a candidate verification code. Full email content is not uploaded, sold, shared, or stored remotely.

## Data Sharing

Gmail OTP Banner does not sell, rent, or transfer Gmail content to third parties. Gmail data is not used for advertising. Gmail data is not used for creditworthiness, profiling, or unrelated product features.

## Analytics and Advertising

Gmail OTP Banner does not use third-party analytics on Gmail content. Gmail OTP Banner does not include advertising features.

## Google API Limited Use Disclosure

Gmail OTP Banner's use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.

The extension uses Google user data only to provide user-facing OTP detection and copy functionality. It does not use Google user data for advertising, does not sell Google user data, and does not allow humans to read user email content except if explicitly required for security, legal compliance, or user-requested support with user-provided information.

## Security

Gmail OTP Banner uses Chrome's extension APIs and Google OAuth. The extension does not ask for your Gmail password. Authentication is handled by Google and Chrome Identity.

## User Control

You can disconnect accounts from the extension popup. You can also revoke the extension's Google access from your Google Account permissions page.

## Changes to This Policy

This policy may be updated as the extension evolves. Material changes will be documented in the project repository and reflected on the public policy page.

## Contact

Developer: Othmane Chouhbi  
Support: otmanechouhbi@gmail.com
