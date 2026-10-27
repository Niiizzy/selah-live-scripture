# Selah — Live Scripture

Selah is a local-first scripture presentation and sermon-following application for church media teams. It listens to a live service, produces captions, looks for spoken Bible references and close wording matches, and can put a selected passage on a projector or OBS browser source.

- **Live web app:** https://selah-live-scripture.netlify.app/
- **Windows desktop app:** see DOWNLOAD.md and the downloadable package in the project distribution.
- **Data and source notices:** data/SOURCES.md and vendor/NOTICE.md

The hosted web app is public. Each browser keeps its own church name, settings, service history, and imported editions. Selah does not currently provide church accounts, centralized church workspaces, shared cloud history, or a server-side user database.

## Features

- Live sermon captions using local Whisper speech recognition on the device.
- A local audio gate skips silence, low-level noise, and low-frequency rumble before Whisper; it cannot identify one speaker or filter out nearby speech.
- Browser speech recognition as an optional fallback where supported. That fallback may use the browser vendor’s online speech service.
- Spoken scripture reference detection in English, Spanish, and Portuguese, including localized book names and spoken forms such as “John chapter three, verse sixteen,” “Juan 3:16,” and “João 3:16.”
- Text matching against five bundled offline editions: King James Version (KJV), World English Bible (WEB), American Standard Version (ASV), Reina-Valera 1909 (RVR09), and Almeida 1819.
- A multilingual semantic matching model to rank likely passages when the speaker paraphrases a verse. This helps find candidates; it does not generate or verify Bible text.
- Automatic projection or a confirmation-first workflow, manual passage browsing, and a recent-detections list.
- Full-screen projector window with single-edition or side-by-side translation display.
- OBS Browser Source support through projector.html.
- Service history, church name, Bible selection, language, microphone, matching sensitivity, projection, and privacy settings stored on the current device/browser.
- Offline app-shell and Bible-catalog caching after the app has loaded once. Speech and semantic model weights are downloaded separately and cached by the browser.

## Important scope and limitations

Selah is a presentation aid. It can mishear a speaker, identify the wrong passage, or project a match too early. Review uncertain matches, use confirmation mode during commissioning, and test the actual microphone feed, room, laptop, browser, and projector before a service.

The design target for short transcription windows is not a guaranteed end-to-end response time. Laptop speed, browser scheduling, audio quality, noise, and model loading affect latency and accuracy.

The bundled Bible library contains five editions, not every translation. NLT, The Message (MSG), NIV, ESV, NKJV, and CSB are not bundled. The complete NLT JSON supplied during development is not included in this public project while publisher permission is pending.

The web app is a static site. It cannot securely store a shared API key or provide church sign-up, centralized accounts, shared settings, or cloud synchronization. The public hosted build disables API.Bible key entry. In the Windows desktop application, the local Electron bridge can connect editions authorized for the user’s API.Bible key; the key is encrypted with the operating system’s secure storage on that computer, and verses are fetched while online. API.Bible access and publisher permissions depend on the user’s own account, selected editions, and applicable terms.

## Quick start: hosted web app

Open the live URL above in a current version of Chrome or Edge. Allow microphone access when prompted. The hosted app requires an HTTPS origin for microphone access and the service worker. Internet is needed for the initial page load and to prepare speech models. Once the app and required model weights are cached, portions can continue offline in that browser profile.

For a church service, connect a clean aux/monitor output from the sound mixer to the media laptop when possible. Select the correct microphone under Settings, test the input with a spoken verse, then open the projector window on the extended display. The local gate filters silence and low-level rumble; it does not separate the preacher from other people speaking nearby. Use a close or directional microphone and keep automatic projection off until the room setup is proven.

## Run from source

Use Node.js 22.12 or later for the packaged Windows build. For the browser version, use Python 3 or any static HTTP server.

1. Clone or download this repository.
2. Open a terminal in the repository root.
3. Start a local server with:

       python -m http.server 8000

4. Open http://localhost:8000 in Chrome or Edge.

Do not open index.html as a file URL. A local HTTP or HTTPS origin is needed for browser microphone APIs, service workers, offline caching, and loading the full Bible catalog.

To prepare the Windows desktop app, install the dependencies with npm install, then launch it with npm start. To create a portable Windows package, run npm run portable. To create an installer, run npm run dist. Generated installers and dependency folders are intentionally excluded from Git; distribute large binaries using a release attachment or the project download page.

## First-time setup

1. Open Settings and enter the church name. It is saved locally in the current browser or desktop profile and used in the dashboard and projector.
2. Set the sermon language and choose the microphone that receives the speaker or mixer feed.
3. Choose Local Whisper and use Download / prepare local Whisper while online. Wait until the model reports ready before relying on it offline. Initial speech and optional semantic model downloads are approximately 250 MB combined; the app runtime itself is bundled.
4. Test listening with the actual sound setup. Watch the captions and verse matches while someone reads or speaks a known passage.
5. Extend the Windows display, open the projector window, move it onto the projector display, and enter fullscreen. If browser screen placement is unavailable, drag the window manually.
6. Use automatic projection only after confirming that the audio feed and match sensitivity work reliably. Otherwise, turn automatic projection off and confirm each match.

Browser storage can be cleared or evicted by the browser. Confirm that required models are still prepared before an offline service. For the local-server workflow, the server must remain running while the app is in use.

## During a service

- Press **Start listening** and leave Selah open while it listens. Keep the laptop awake and the browser tab or desktop app running.
- The local Whisper engine processes short audio windows on the device. Temporary audio exists in memory for transcription and is discarded; Selah does not write sermon audio to disk.
- Captions are live and temporary. They are cleared when the page reloads.
- Scripture matches appear in the activity list. Automatic mode can immediately send a detected passage to the projector; confirmation mode asks the operator first.
- Confidence is a matching score, not a guarantee of transcription accuracy.
- Use **Browse verses** to select a passage manually.
- Pause listening when the service is over. History and settings remain on that device until cleared or exported.

## Projector and OBS

The projector page can run in its own window for an extended display, or as an OBS Browser Source. Start the local server and use the matching local URL, for example:

    http://localhost:8000/projector.html

Set the OBS source dimensions to match the broadcast layout. The dashboard and projector page should be served from the same origin so they can exchange the current passage through browser storage. This is a browser-source workflow; it does not provide native NDI output.

## Bible editions and licensing

The bundled catalog contains the following public-domain editions:

| Code | Edition | Language | Included text |
| --- | --- | --- | ---: |
| KJV | King James Version | English | 31,102 verses |
| WEB | World English Bible | English | 31,095 aligned verses |
| ASV | American Standard Version | English | 31,086 aligned verses |
| RVR09 | Reina-Valera 1909 | Spanish | 31,084 aligned verses |
| ALMEIDA | Almeida 1819 / Bíblia Livre | Portuguese | 31,102 verses |

The canonical reference table has 31,102 rows across 66 books. A small number of source editions omit records; those cells are blank. Upstream sources and their notices are documented in data/SOURCES.md. The app, Bible corpus, model weights, and vendor runtime have separate licenses and provenance.

To import an edition, open **Bible library → Import JSON** and choose a UTF-8 JSON file shaped like this:

    {
      "code": "MYBIBLE",
      "name": "My licensed edition",
      "language": "en",
      "verses": [
        {"book": "John", "ch": 3, "v": 16, "text": "Authorized verse text"}
      ]
    }

Use canonical English book names from the bundled reference table. Imported editions are saved in the current browser’s IndexedDB and can be removed from Bible library. Selah does not grant or validate rights for an imported translation.

Before adding or redistributing copyrighted scripture, obtain permission for the intended use, including how many verses, projector or broadcast use, whether the app is downloadable, and whether a full text file is stored or redistributed. Permission to quote selected verses does not automatically authorize bundling an entire translation database. NLT and MSG are not included in this repository while Tyndale’s permission request is pending.

## Privacy and security

- The local Whisper engine and semantic reranking run on the device after model preparation.
- The optional browser speech fallback may send audio to the browser vendor; choose local Whisper when the audio must remain on the laptop.
- Audio is not saved. Live captions are temporary. Service settings and history stay in local browser/Electron storage and are not sent to a Selah cloud service.
- The hosted website is public and static. Do not enter private API credentials into a public web build. The hosted build blocks API.Bible key entry.
- The Windows desktop bridge encrypts API.Bible credentials using Electron safeStorage when secure storage is available. Credentials are stored for that Windows user, not shared with other churches.
- No Selah account system or multi-church cloud database is currently included.

## Repository layout

- index.html — main dashboard and page containers.
- styles.css — responsive application styling.
- app.js — settings, audio capture, transcription, Bible lookup, matching, history, and local persistence.
- projector.html — standalone projector and OBS browser source.
- main.cjs — Electron desktop wrapper, local HTTP bridge, API.Bible integration, and secure local API-key storage.
- package.json — desktop start and packaging scripts.
- data/bibles.json — aligned offline Bible reference and translation corpus.
- data/metadata.json and data/SOURCES.md — corpus metadata, upstream provenance, and data notes.
- vendor/ — browser inference runtime, ONNX WebAssembly assets, and third-party notices.
- manifest.json and sw.js — install metadata and offline application-shell cache.
- icon.svg and icon.ico — app and desktop icons.
- USER_GUIDE.md — concise operator setup and service instructions.
- DOWNLOAD.md — Windows portable-app instructions and build notes.
- tests/ — data and application smoke checks.

Generated output folders, ZIPs, installers, and node_modules are excluded from source control. See .gitignore.

## Verification

The project includes local checks. Run them from the repository root when you want to verify a checkout:

    node --check app.js
    node --check tests/smoke.cjs
    node tests/smoke.cjs
    python tests/verify-data.py

These checks exercise the Bible corpus and matching behavior. Real microphone, extended-display, projector, and offline-model behavior must be checked on the target church laptop and equipment.

## Deployment

The current public site is deployed from a static package on Netlify. A GitHub repository can serve as the source of truth; Netlify can later be connected to that repository for automatic deploys. A static deploy needs no build step when the repository root contains index.html and the supporting files. Do not configure a backend or publish private credentials in a static site.

## License

The application source is marked UNLICENSED in package.json; no open-source license has been granted for the Selah application code. Do not assume you may reuse or redistribute the app code under an open-source license without the owner’s permission. The bundled Bible datasets, browser runtime, model weights, and icons may have their own upstream licenses; see data/SOURCES.md and vendor/NOTICE.md before redistribution.

This repository does not contain complete NLT or MSG Bible text.
