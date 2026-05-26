# Support

Gmail OTP Banner is currently shared as an open-source local installation project. It is not available on the Chrome Web Store yet.

For help, use the GitHub repository issues or follow the setup tutorial when it becomes available:

[YouTube tutorial link coming soon]

## Setup Checklist

- Use Google Chrome.
- Download or clone the repository.
- Load the `extension` folder in `chrome://extensions/` with Developer Mode enabled.
- Copy the generated Chrome Extension ID.
- Create a Google Cloud project.
- Enable Gmail API.
- Configure the OAuth consent screen.
- Add yourself as a test user.
- Create an OAuth Client ID of type **Chrome Extension**.
- Paste the Chrome Extension ID into the OAuth Client configuration.
- Paste the OAuth Client ID into `extension/manifest.json`.
- Reload the extension.
- Click **Connect an account**.

## Common Errors

| Error | Fix |
| --- | --- |
| `Error 403: access_denied` | Add your Gmail address as a test user in `Google Cloud Console → Google Auth Platform → Audience → Test users`. |
| `Error 400: redirect_uri_mismatch` | Make sure the local Chrome Extension ID exactly matches the ID saved in your OAuth Client. |
| `access_type offline not allowed` | Remove `access_type=offline`. |
| `invalid client_id` | Check that `extension/manifest.json` contains the correct OAuth Client ID. |
| Gmail API not enabled | Enable Gmail API in `Google Cloud Console → APIs & Services → Library → Gmail API → Enable`. |

## Important Extension ID Note

The local extension ID must match the OAuth Client Chrome Extension ID.

If you remove and reload the extension, the ID can change. If the ID changes, OAuth may fail with `redirect_uri_mismatch`.

Keep the same extension loaded and use **Reload** instead of **Remove** when updating local files.
