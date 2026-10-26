# Selah — Live Scripture

Selah is a local-first church presentation app for live sermon captions, scripture reference detection, multilingual Bible lookup, and projection. It has no account, subscription, ads, or application server. The full KJV, WEB, ASV, Reina-Valera 1909, and Almeida 1819 public-domain catalogs are included for offline reading and matching.

## Start here

1. Use a current Chrome or Edge browser on the presentation laptop.
2. Open PowerShell in the `outputs` folder and run `python -m http.server 8000` (or use any static HTTPS host on the church’s private network).
3. Visit `http://localhost:8000`. Keep the server terminal open while using Selah. Do not open the HTML as `file://`; the app needs a local/HTTPS origin for the full Bible database, microphone, and offline service worker.
4. In **Settings**, enter your church name, then choose language and microphone. The church name is saved only in that app/browser profile and appears in the dashboard and projector. Press **Download / prepare local Whisper** while online and wait for both models to finish. The first model setup downloads about 250 MB; the runtime is bundled with Selah. Models are cached in browser storage. Check the status says the models are ready before disconnecting from the internet.
5. Connect a mixer’s monitor/aux output to the laptop or use a microphone near the speaker. Start listening. The preferred engine is local Whisper. Browser speech recognition is a fallback and may process audio through the browser vendor’s online service.
6. Extend the desktop in display settings. Choose **Open projector**, move that window to the projector, and use its Fullscreen control (or press `F`). Settings offers side-by-side projection of enabled translations and a **Choose display** action where the browser supports screen placement. Otherwise, drag the projector window to the second display. Screen placement requires a secure origin and browser permission.

For repeated use, bookmark the local address. Selah’s service worker caches the application, Bible catalog, and runtime so the app page can work offline after its first load. Whisper and semantic model weights are cached separately by the browser. Browser storage can be cleared or evicted; verify model readiness before each offline service. The local Python server itself must still be running to serve the app.

## During the service

- Selah listens in short two-second audio windows and transcribes with Whisper on the device. It does not write sermon audio to disk.
- It detects spoken Bible references in English, Spanish, and Portuguese, including forms such as “John chapter three, verse sixteen,” “Juan 3:16,” and “João 3:16.”
- It checks loaded Bible editions for the closest wording. A multilingual sentence model reranks likely passages for paraphrases. The model is a retrieval aid; review uncertain matches, especially while commissioning room audio.
- If a preacher names a Bible edition, Selah selects it only when its text is loaded. For NLT or MSG, connect your own API.Bible account and select licenses for those editions. The downloadable desktop app fetches verses on demand while online; it does not include or export complete NLT/MSG files. The API key is stored encrypted on that computer.
- Automatic projection is on by default. Turn it off in the dashboard/Settings to confirm before a verse is sent to the projector. The **Browse verses** control lets a volunteer pick any verse manually.
- Confidence is a matching score, not a guarantee of transcription accuracy. Set **More certain** sensitivity or use confirmation mode when a false slide would disrupt the service.
- Service history and settings stay in the browser. Export history as text or use Print / Save PDF for notes. Clear local data from Settings when finished on a shared laptop.

## Library and translation licensing

Five public-domain editions are included (some upstream records are missing; the counts below are exact):

- KJV — King James Version (31,102 verses)
- WEB — World English Bible (31,095 aligned verse texts)
- ASV — American Standard Version (31,086 aligned verse texts)
- RVR09 — Reina-Valera 1909 (31,084 aligned verse texts)
- Almeida — Almeida 1819 (Bíblia Livre; 31,102 verse texts)

The canonical reference table has 31,102 rows and 66 books. A few upstream editions omit a small number of verse records; Selah leaves those edition cells blank. Sources and data notices are in [`data/SOURCES.md`](data/SOURCES.md).

To add an edition, first obtain text and rights from its publisher or an authorized Bible API for your particular use. In **Bible library → Import JSON**, choose a UTF-8 JSON file with this structure:

```json
{
  "code": "MYBIBLE",
  "name": "My licensed edition",
  "language": "en",
  "verses": [
    {"book":"John","ch":3,"v":16,"text":"Authorized verse text"}
  ]
}
```

Use canonical English book names from the bundled reference table. Imported editions are saved in IndexedDB on this browser only and can be removed from the Library page. Up to seven editions can be enabled for matching or side-by-side projection. Selah does not provide or validate a license for imported text.

NIV, ESV, NLT, MSG, NKJV, and CSB are copyrighted and are not bundled. To use NLT or MSG, create an API.Bible account, obtain a key with the corresponding Bible editions authorized, then open Bible Library in the downloaded desktop app and connect the key. Only editions available to that key appear in the selectors. Live Server in VS Code does not provide the secure API connection. Internet access is needed when fetching copyrighted verses. The projector automatically adds `(NLT)` or `(The Message)` after each projected quotation. Read the current official permissions for the precise format, verse counts, projection, distribution, streaming, and API use you intend:

- [Biblica permissions for NIV](https://www.biblica.com/permissions/)
- [Crossway permissions for ESV](https://www.crossway.org/permissions/)
- [Tyndale permissions for NLT and The Message](https://www.tyndale.com/permissions)
- [CSB permissions](https://csbible.com/about-the-csb/permissions/)
- [HarperCollins Christian Publishing rights and permissions](https://www.harpercollinschristian.com/permissions/)

Permission for a church to project a quotation does not necessarily authorize bundling a complete translation database in a downloadable app. Keep each publisher’s written approval and required attribution with your imported data.

## OBS and streaming

Add an OBS **Browser Source** pointed at the same local server’s `projector.html` URL, for example `http://localhost:8000/projector.html`, and set its canvas size to match your broadcast. The projector window and OBS page both receive the current verse through same-origin browser storage updates. This provides a browser-source workflow; it does not provide native NDI output.

## Privacy, offline use, and limits

- Whisper and semantic inference run locally in the browser. The first setup downloads open models from Hugging Face; after that, cached weights can run without a connection. Selah’s static app runtime is bundled locally.
- The fallback Web Speech API may send audio to the browser vendor. Use local Whisper when audio must remain on the laptop.
- Audio chunks exist only in memory while they are transcribed and are discarded afterward. Live captions are cleared on page reload. Verse history is saved locally in this browser profile; nothing is sent to a Selah server.
- Speech accuracy and slide timing vary with laptop performance, microphone feed, noise, browser scheduling, and model download/cache. The two-second audio window is a design target; end-to-end speech-to-slide time is not guaranteed to stay under two seconds. Test the actual mixer and projector before relying on unattended automatic mode.
- Whisper is a multilingual general speech model, not tuned exclusively for sermons. The bundled semantic model reranks text-search candidates; it does not generate or verify scripture. Use confirmation mode until your room setup and imported licensed texts are proven.
- The bundled catalog is English, Spanish, and Portuguese public-domain text, not 3,800 translations or 2,400 languages. The interface supports up to seven locally loaded editions. Arabic, French, and other languages need matching licensed/public-domain data and a speech model configured for that language.

## Project files

- `index.html`, `styles.css`, `app.js` — dashboard, controls, local matching, audio capture, and model integration.
- `projector.html` — full-screen single or side-by-side projector and OBS browser source.
- `data/bibles.json` — aligned offline Bible catalog; `data/SOURCES.md` records upstream sources and notices.
- `vendor/` — bundled Transformers.js browser runtime, ONNX WebAssembly runtime, and notices.
- `sw.js`, `manifest.json`, `icon.svg` — offline application shell and install metadata.
- `tests/smoke.cjs` — local app/data matching smoke check.
