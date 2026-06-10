# OFO Copilot Extension

Prototype browser extension for Open Frontier One.

The extension is scoped to OFO-owned platforms and stores. It should not monitor the wider browser. Outside OFO domains it should be inactive unless a user explicitly shares context.

## Current prototype

- Manifest V3 extension.
- Chrome/Edge side panel.
- Content script limited to OFO/store host permissions.
- Current page context extraction.
- Store/domain registry shared by the content script and validator.
- Local profile and goals storage.
- Local activity history with export/delete controls.
- Explicit opt-in checkbox before community matching can treat the profile as visible.
- Prompt helpers for:
  - explain this page
  - create a crash course
  - recommend communities
- Local validation script for manifest permissions.

## Local install

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click **Load unpacked**.
4. Select this `extension/` directory.
5. Open an OFO-owned site and launch the side panel.

## Permission boundary

The manifest should only include OFO-owned domains. Add new host permissions only after confirming domain ownership.

## Next build tasks

- Add OFO account sign-in.
- Replace prompt previews with real copilot API calls.
- Add visible memory controls.
- Add opt-in community profile and matching.
- Add store-owned domain registry generated from OFO metadata.
- Package for Chrome Web Store review after account sign-in and privacy copy are complete.

## Validate

Run from this repository:

```sh
node extension/tools/validate-extension.mjs
```
