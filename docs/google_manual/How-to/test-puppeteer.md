# Testing with Puppeteer (Chrome Extensions)

Quelle: https://developer.chrome.com/docs/extensions/how-to/test/puppeteer?hl=de

## Kernaussagen

- Puppeteer eignet sich für E2E-Tests von Extensions.
- Basis-Setup:
  - Node-Projekt mit `package.json`
  - `npm install puppeteer jest`
  - Test-Datei (z. B. `index.test.js`)
- Browserstart mit Extension:
  - `puppeteer.launch({ enableExtensions: [EXTENSION_PATH], pipe: true })`
- Service-Worker abwarten:
  - `browser.waitForTarget(target => target.type() === 'service_worker')`
- Popup testen:
  - `chrome.action.openPopup()` im Worker-Kontext
  - Popup-Target abwarten und DOM-Assertions durchführen

## Relevanz für dieses Projekt

- Kann Slider/Preset-Flow automatisiert prüfen.
- Kann Fehlerfälle wie "kein Receiver", Tab-Wechsel und Popup-Initialisierung reproduzieren.
