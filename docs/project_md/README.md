# Volume Booster 300

Chrome Extension Manifest V3 prototype for boosting tab audio up to 300% with per-page memory.

## What it does

- Adds a popup slider from 0% to 300%
- Remembers the last boost value per page
- Applies a gain node to audio and video elements on the page
- Keeps the tab mute control usable because the extension does not force-unmute media
- Includes a dark/light theme toggle in the popup and options page
- Provides quick popup presets for MUTE, 100%, 200%, and 300%

## Extra controls

- Options page for the global default boost and quick presets
- Packaging script for creating a release ZIP on Windows

## Limitations

- Above 100% can cause clipping or distortion
- Pages that rely heavily on custom Web Audio routing may not respond perfectly
- Some streams can only be boosted after playback has started

## Privacy

- All settings stay local on the user's device
- No analytics, ads, tracking, or remote configuration are used
- A hostable privacy policy is included in `privacy-policy.html`
- The live policy URL should be https://<your-github-username>.github.io/volume-extension-chrome/privacy-policy.html
- The no-server setup steps are documented in `GITHUB_PAGES.md`

## Load it unpacked

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select this folder

Clicking the toolbar icon opens the compact popup directly inside Chrome, not a separate tab or window.

To package a release ZIP, run `package-extension.ps1` from PowerShell in this folder.

## Files

- `manifest.json` declares the extension and content script
- `popup.html`, `popup.css`, and `popup.js` provide the control UI
- `options.html`, `options.css`, and `options.js` provide the settings page
- `content.js` applies the boost on matching pages
- `package-extension.ps1` creates a release archive
- `GITHUB_PAGES.md` explains how to host the privacy policy without your own server