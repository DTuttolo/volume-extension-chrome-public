# End-to-end testing (Chrome Extensions)

Quelle: https://developer.chrome.com/docs/extensions/how-to/test/end-to-end-testing?hl=de

## Kernaussagen

- E2E-Tests laden die gebaute Extension in den Browser und automatisieren reale User-Flows.
- Geeignete Tools: Puppeteer/Playwright, Selenium, WebDriverIO.
- Für CI ohne GUI: Chrome mit `--headless=new` nutzen.
- Feste Extension-ID für Tests ist empfehlenswert.
- Popup-Tests: entweder `action.openPopup()` verwenden oder `popup.html` direkt mit Tab-Override öffnen.
- Interne Extension-State-Checks sind möglich, aber idealerweise testet man sichtbares Verhalten.

## Relevanz für dieses Projekt

- Popup- und Service-Worker-Flows können reproduzierbar getestet werden.
- Hilft beim Absichern von Messaging-/Frame-Problemen (`tabs.sendMessage`, `onMessage`).
