# Contributing to Gmail OTP Banner

Thank you for contributing.

## Development Setup

1. Clone the repository.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Load the `extension/` folder as an unpacked extension.
5. Test changes locally before opening a pull request.

## Code Guidelines

- Keep Gmail API scopes minimal.
- Do not add remote processing of Gmail content.
- Avoid broad permissions unless necessary.
- Keep UI simple, accessible, and fast.
- Redact sensitive data from logs and screenshots.

## Pull Requests

Pull requests should include a clear summary, testing notes, and any privacy impact. Changes that affect Google OAuth scopes, permissions, or user data handling require extra review.
