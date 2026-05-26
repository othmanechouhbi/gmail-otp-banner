# Monetization Readiness

Gmail OTP Banner should remain privacy-first if monetization is added later.

## Free Plan Ideas

- One connected Gmail account.
- Basic OTP banner.
- Copy button.
- Local-only detection.

## Pro Plan Ideas

- Up to four or more connected accounts.
- Custom banner themes.
- Code history with local-only retention controls.
- Workspace/team deployment guide.
- Priority support.
- Advanced domain allowlists and blocklists.

## Subscription Architecture

Recommended providers:

- Stripe Billing for maximum flexibility.
- LemonSqueezy for a simpler merchant-of-record setup.

Recommended model:

1. Keep Gmail detection local.
2. Add a license API that validates a purchase token or subscription status.
3. Store only license status locally.
4. Do not send Gmail content to the licensing server.
5. Cache entitlement status with expiration.

## Secure License Verification Concept

- User enters license key or signs in to a billing portal.
- Extension sends license key and extension install ID to a minimal backend.
- Backend returns signed entitlement claims.
- Extension verifies or stores entitlement locally.
- Gmail data never leaves the browser.

## Roadmap

- Version 1.0: Free open-source local OTP detection.
- Version 1.1: Improved detection rules and domain controls.
- Version 1.2: Local-only history controls.
- Version 2.0: Optional Pro license system with privacy-preserving entitlement checks.
