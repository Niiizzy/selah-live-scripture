# Download Selah for Windows

**Download:** [`Selah-Live-Scripture-1.0.0-Windows-x64.zip`](downloads/Selah-Live-Scripture-1.0.0-Windows-x64.zip)

This is a portable Windows 10/11 x64 application. Extract the entire ZIP folder, then launch **Selah Live Scripture.exe**. No installation or account is required. Keep the extracted folder together; do not launch the executable from inside the ZIP.

## First setup

- The Bible catalog and app are included. For local AI, open **Settings → Download / prepare local Whisper** while online. Whisper and the optional semantic model download about 250 MB once and are cached in this app's browser profile. Do this before taking the computer offline.
- Allow microphone access in Windows privacy settings. Selah requests audio input only; it does not request camera access.
- Select the local Whisper engine for on-device transcription. Browser speech fallback may use an online browser-vendor service.
- Connect the projector as an extended desktop, open the projector window, and move it to that display if automatic screen selection is unavailable.

## Windows security prompt

This build is not code-signed. Windows SmartScreen may show an unfamiliar-app warning. That warning reflects the missing publisher signature; it is not a signature or malware scan result. Only run the app if you trust the source of this package.

## Uninstall and privacy

Close Selah and delete the extracted folder to remove the portable application. Settings, history, and model cache are stored in the current Windows user profile by Electron and can remain after deleting the app folder. Use **Settings → Clear service** to clear service history in Selah.

The app itself contains no paid translation texts. Its Bible sources and software notices are in `data/SOURCES.md` and `vendor/NOTICE.md`.

## Build from source

Install Node.js 22.12 or later, then run `npm install` and `npm run portable` in this folder. The build downloads the official Electron runtime and creates the ZIP under `downloads/`.
