# Volume Booster 300

Volume Booster 300 is a Chrome extension based on Manifest V3 that lets you control and boost audio in the active tab from 0% (mute) up to 300%.

## Features

- Fixed volume levels: 0%, 50%, 100%, 150%, 200%, 250%, 300%
- Quick preset buttons for common levels
- Slider control in the popup
- Optional popout window for easier control
- Local persistence via chrome.storage.local
- Automatic handling of newly added audio and video elements

For values above 100%, the extension uses the Web Audio API (GainNode) to amplify HTML5 media.

## How It Works

- 0%: The active tab is muted.
- 1% to 100%: Native media element volume is applied.
- Above 100%: Media volume remains at 100%, and amplification is applied through an injected audio gain stage.

The extension supports standard web pages on http/https. Internal browser pages are not supported.

## Installation (Unpacked)

1. Open Chrome and go to chrome://extensions.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select this project folder.

## Usage

1. Open a page with playable audio or video.
2. Click the extension icon in the Chrome toolbar.
3. Select a volume level using presets or the slider.
4. Optionally click Popout to open controls in a separate window.

## Permissions

Currently declared in manifest.json:

- activeTab: target the active tab
- scripting: inject runtime code to apply volume changes
- tabs: read and update tab state (for mute/unmute)
- storage: persist selected volume locally

## Privacy

- Settings are stored locally on the device.
- No analytics, advertising, or tracking is implemented.
- The privacy policy is provided in privacy-policy.html.

## Limitations

- Levels above 100% may cause clipping or distortion.
- Pages with heavily customized audio pipelines may behave inconsistently.
- Behavior may depend on playback state and browser restrictions (autoplay).

## Project Structure

- manifest.json: extension configuration
- popup.html: popup markup
- popup.css: popup styling
- popup.js: logic for UI and volume application
- privacy-policy.html: privacy policy page
- index.html: redirect entry to the privacy policy

## Development

- No build step is required.
- For local testing, load the extension unpacked.
