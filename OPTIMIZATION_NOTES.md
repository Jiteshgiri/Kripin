# Kripin APK optimization

Changes applied:
- Removed PDF.js from the APK. Native Android now uses a lightweight statement preview; the full PDF is still generated/downloaded when requested.
- PDF generation is lazy-loaded, so jsPDF is not loaded on normal app startup.
- Analytics, recurring bills and secondary modals are lazy-loaded.
- Removed Live Update/OTA plugin and its startup network check.
- Removed unused Capacitor Filesystem plugin.
- Removed PWA/service-worker/public duplicate icon assets from the Android bundle.
- Removed Google Fonts network loading; app uses local/system font fallback.
- Local LAN sync now defaults to `http://192.168.29.42:3001` and can be overridden with `VITE_LOCAL_SERVER_URL`.
- Server listens on `0.0.0.0:3001` for LAN access.
- Release APK output name is fixed to `Kripin.apk`.
- Added `npm run apk:release`.
- `MainActivity.java` was not changed.

Build on Windows:
1. Keep your existing `android/app/keystore.properties` and `.android/pocketspent-release.jks`.
2. Run `npm install`.
3. Run `npm run apk:release`.
4. APK: `android/app/build/outputs/apk/release/Kripin.apk`

For a different PC LAN IP:
`$env:VITE_LOCAL_SERVER_URL="http://YOUR_PC_IP:3001"; npm run apk:release`

The source type-checks successfully in this environment. A final APK was not produced here because the uploaded Windows `node_modules` contains Windows-only native Rollup/esbuild binaries, while this build environment is Linux and has no matching optional native packages.
