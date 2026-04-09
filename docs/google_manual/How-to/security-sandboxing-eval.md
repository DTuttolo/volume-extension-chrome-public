# Sandboxing for eval-like libraries

Quelle: https://developer.chrome.com/docs/extensions/how-to/security/sandboxing-eval?hl=de

## Kernaussagen

- MV3-CSP blockiert `eval()` und `new Function()` in normalen Extension-Kontexten.
- Wenn eine Library das zwingend braucht, kann ein Sandbox-Ansatz verwendet werden:
  - Sandboxed HTML in `manifest.json` unter `sandbox.pages` deklarieren
  - Sandbox per `iframe` laden
  - Kommunikation per `postMessage`
- Sandboxed Seiten laufen in separatem Origin und haben keinen Zugriff auf privilegierte `chrome.*` APIs.

## Relevanz für dieses Projekt

- Für Volume Booster aktuell nicht zwingend notwendig.
- Nützlich, falls später Template-Engines oder Drittanbieter-Code mit CSP-Konflikten eingebaut werden.
