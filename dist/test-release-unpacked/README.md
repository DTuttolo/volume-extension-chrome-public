# Chrome Extension: Volume Booster 300

This extension controls the audio volume in the active Chrome tab using fixed steps:

- Mute
- 50%
- 100%
- 150%
- 200%
- 250%
- 300%

For values above 100%, it uses the Web Audio API (GainNode) to amplify HTML5 audio/video.

## Installation (Unpacked)

1. Open Chrome and go to `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the `chrome-volume-control` folder.

## Usage

1. Click the extension icon.
2. Choose your desired volume level.
3. Apply a preset button or move the boost slider.

Note: Volume control applies to HTML5 `audio` and `video` elements in the active tab.
