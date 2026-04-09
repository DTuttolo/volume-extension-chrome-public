# Reviewer Notes

## Purpose

Volume Booster 300 boosts audio on the active Chrome page and remembers the user's chosen level per page.

## Required permissions

- `storage`: saves local settings such as per-page volume and theme preference.
- `tabs`: reads the active tab URL so the popup can target the current page.
- `windows`: opens the optional popout window.
- `host_permissions: <all_urls>`: explained in detail below.

## Why `<all_urls>` is required

This extension is a **universal volume booster with per-site memory**. Its core feature is:

> The user sets 150% on YouTube today. Tomorrow they visit YouTube again — the boost is already applied automatically, without any click.

This requires the content script to run on **every page load**, before user interaction, so it can:

1. Read the stored volume for that site from `chrome.storage.local`.
2. Attach a Web Audio `GainNode` the moment the user first interacts (gesture-gated).
3. Detect SPA navigation (e.g. Twitch channel switches) via `MutationObserver` and re-apply the stored setting.

`activeTab` cannot fulfill this because it only grants access **in response to an explicit extension invocation** (clicking the toolbar icon). The auto-apply on page load — the primary value of the extension — would be lost.

Restricting to a fixed list of `host_permissions` URLs is also not feasible: the extension is designed to work on **any** website the user visits, including intranet, local dev servers, and any future site.

The content script itself is minimal and safe:

- It reads one storage key on load.
- It does **not** read, modify, or exfiltrate any page content, cookies, or credentials.
- The Web Audio graph (the only DOM interaction) is only created after a confirmed user gesture.
- No data leaves the device.

## Data handling

- No user data is sent to any server.
- No analytics, ads, affiliate links, or remote configuration are used.
- No remote code is loaded.
- All settings stay local in Chrome storage.

## Notes for review

- The extension only modifies audio gain via the Web Audio API.
- The extension does not claim to change system volume.
- The popout window is optional and only duplicates the extension UI.