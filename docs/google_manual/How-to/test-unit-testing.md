# Unit testing (Chrome Extensions)

Quelle: https://developer.chrome.com/docs/extensions/how-to/test/unit-testing?hl=de

## Kernaussagen

- Unit-Tests testen kleine Funktionen isoliert vom Browser.
- Reine Logik ohne `chrome.*` kann normal mit Jest getestet werden.
- Für Extension-APIs werden Mocks empfohlen.
- Beispiel-Pattern:
  - `jest.config.js` mit `setupFiles`
  - `global.chrome = { ... }` in Mock-Datei
  - `jest.spyOn(...)` für API-Antworten

## Relevanz für dieses Projekt

- Ideal für `clampVolume`, URL-Key-Auflösung, Storage-Resolver und Messaging-Mapper.
- Reduziert Regressionen bei zukünftigen Audio-/Frame-Fixes.
