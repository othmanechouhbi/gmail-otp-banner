# Google API Limited Use Disclosure

Gmail OTP Banner uses the Gmail API scope `https://www.googleapis.com/auth/gmail.readonly` to detect recent verification codes in Gmail messages.

Gmail OTP Banner's use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.

## How Google User Data Is Used

The extension uses Gmail readonly access only to provide a user-facing feature: detecting recent verification codes and displaying them in a local floating banner so the user can copy them quickly.

## What Is Not Done With Gmail Data

- Gmail content is not sold.
- Gmail content is not used for advertising.
- Gmail content is not transferred to third-party analytics providers.
- Gmail content is not used to train AI models.
- Gmail content is not used for profiling or unrelated features.
- Full email bodies are not stored remotely.

## Local Processing

OTP detection runs locally inside the Chrome extension. Recent Gmail messages are requested from the Gmail API, scanned in memory for verification-code patterns, and then discarded. The extension stores only minimal operational data needed to avoid duplicate banners and remember the latest detected code.

## Human Access

The developer does not have access to users' Gmail content through the extension. Users should not send private email content in support requests unless they choose to do so and redact sensitive information.
