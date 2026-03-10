# VinylVault Android APK Build Guide

This guide explains how to generate a production-ready Android APK or App Bundle
(`.aab`) that wraps VinylVault as a **Trusted Web Activity (TWA)** — a lightweight
native Android wrapper that loads the PWA in a full-screen Chrome experience with
no visible browser UI.

**Choose a build method:**

| Method | Requires | Best for |
|--------|----------|----------|
| [Option A — PWABuilder (cloud)](#option-a--pwabuilder-cloud-build-recommended) | Browser only | Fastest path, no Android Studio |
| [Option B — GitHub Actions (CI)](#option-b--github-actions-ci-automated) | GitHub secrets | Automated release builds |
| [Option C — Local Gradle (source)](#option-c--local-gradle-build-from-source) | Java 17 + Android SDK | Full control / offline |

---

## Pre-built APK

A signed release APK is available at:
```
releases/VinylVault-1.0.0-release.apk
```

To install it directly on an Android phone:
1. Copy the APK to your device (USB, Google Drive, email, etc.)
2. On the phone: **Settings → Security → Install unknown apps** → enable for your file manager
3. Tap the `.apk` file → Install
4. **VinylVault** will appear on your home screen
5. After installation, **disable "Install unknown apps"** again to maintain device security

> ⚠️ Only install APKs from sources you trust. Always verify the file is from the
> official VinylVault repository before installing.

---

## Option A — PWABuilder Cloud Build (Recommended)

[PWABuilder](https://www.pwabuilder.com) is a free Microsoft-hosted tool that
generates a signed TWA APK and AAB entirely in the browser — no Android Studio,
no Java, no local SDK required.

### Step 1 — Enter your PWA URL

1. Open **https://www.pwabuilder.com** in your browser.
2. In the search box enter your deployed Netlify URL:
   ```
   https://vinylvault.netlify.app
   ```
3. Click **Start** (or press Enter). PWABuilder validates your manifest and service
   worker. A green score means you are ready to package.

### Step 2 — Choose the Android platform

1. On the results page, click **Package for stores**.
2. Select the **Android** tile.
3. In the **Android Options** panel configure the following:

   | Option | Value to use |
   |--------|-------------|
   | **Package ID** | `pro.vinylvault.app` |
   | **App version** | `1` (versionCode); `1.0.0` (versionName) |
   | **Display mode** | `standalone` |
   | **Status bar color** | `#C8973F` (gold — matches `theme_color`) |
   | **Nav bar color** | `#0E0C0B` (dark — matches `background_color`) |
   | **Nav bar divider color** | `#2E2924` |
   | **Splash screen color** | `#0E0C0B` |
   | **Splash screen icon** | Upload `/static/icon-512.png` (512 × 512 px) |
   | **Splash fade-out duration** | `300` ms |
   | **Signing key** | **Generate new** (for first build) or **Use mine** if you have a keystore |

4. Click **Generate**.

### Step 3 — Download the signed package

PWABuilder generates a `.zip` that contains:
- `app-release-signed.apk` — sideload on a physical device for testing
- `app-release-bundle.aab` — upload to Google Play Console
- `assetlinks.json` — **Digital Asset Links** file (see Step 4)
- Signing key details (save the `.keystore` file and passwords securely)

### Step 4 — Deploy the Digital Asset Links file

TWA requires your website to serve a JSON file at
`/.well-known/assetlinks.json` that proves you own the Android app.

1. Open the `assetlinks.json` from the PWABuilder download.
2. It will look like:

   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "pro.vinylvault.app",
       "sha256_cert_fingerprints": [
         "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
       ]
     }
   }]
   ```

3. Replace the content of **`.well-known/assetlinks.json`** in this repository
   with the fingerprint from your PWABuilder download.
4. Deploy to Netlify (push to `main` or drag-drop). The file must be publicly
   accessible at:
   ```
   https://vinylvault.netlify.app/.well-known/assetlinks.json
   ```
   Netlify is already configured (`netlify.toml`) to serve this file with the
   correct `Content-Type: application/json` and `Access-Control-Allow-Origin: *`
   headers required by the Android verifier.

> **Security note:** The SHA-256 fingerprint is a _public_ certificate hash — it
> is safe and required to be public. The **private key** in the `.keystore` file
> must never be committed to version control.

### Step 5 — Install the APK on a physical device for testing

```
# Option 1 — USB (requires adb)
adb install app-release-signed.apk

# Option 2 — Direct file transfer
# Copy the APK to the phone → tap it → allow "Install unknown apps"
```

On the device, open the app and verify:
- The VinylVault splash screen appears on a dark background
- No browser address bar or Chrome UI is visible (full TWA mode)
- Offline mode works (service worker caches the app shell)

### Step 6 — Upload to Google Play Console

1. Go to [play.google.com/console](https://play.google.com/console) → Create app.
2. Under **Release → Production → Create release**, upload `app-release-bundle.aab`.
3. Complete the store listing using descriptions and screenshots from `/static/`.
4. Submit for review (typically 1–3 business days for a new app).

---

## Option B — GitHub Actions CI (Automated)

The workflow `.github/workflows/build-android.yml` automatically rebuilds the APK
whenever Android sources change on `main`. It can also be triggered manually.

### What the workflow does

| Condition | Result |
|-----------|--------|
| Any push to `main` that changes `android/**`, `/.well-known/assetlinks.json`, or `.github/workflows/build-android.yml` | Builds a **debug APK**, uploads as artifact |
| Push to `main` with the above path changes **and** all 5 signing secrets set | Also builds and signs a **release APK + AAB**, uploads as artifact, and commits updated APK to `releases/` |
| `workflow_dispatch` (manual trigger from the Actions tab) | Builds a **debug APK**, and if all 5 signing secrets are set, also builds and signs a **release APK + AAB**, uploads as artifacts, and commits updated APK to `releases/` |

### Required GitHub Secrets (for release builds)

Navigate to **GitHub → Repository → Settings → Secrets and variables → Actions** and add:

| Secret name | Value |
|-------------|-------|
| `KEYSTORE_BASE64` | Base64-encoded release keystore. macOS: `base64 -i release.keystore`<br>Linux/CI: `base64 -w 0 release.keystore` |
| `KEYSTORE_PASSWORD` | Keystore store password |
| `KEY_ALIAS` | Key alias (default: `vinylvault`) |
| `KEY_PASSWORD` | Key password |
| `TWA_SHA256_CERT` | SHA-256 fingerprint matching `/.well-known/assetlinks.json` |

If any of these secrets are missing the workflow skips the release build and only
produces the debug APK. A workflow notice is emitted to explain the skip.

---

## Option C — Local Gradle Build (from source)

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Java JDK | 17 or higher | https://adoptium.net |
| Android Studio (or SDK only) | Latest | https://developer.android.com/studio |
| `adb` (Android Debug Bridge) | Bundled with SDK | In `$ANDROID_HOME/platform-tools` |

### Set environment variables

```bash
# macOS / Linux — add to ~/.bashrc or ~/.zshrc
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk          # macOS
# export ANDROID_HOME=$HOME/Android/Sdk                # Linux
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Quick Build (Debug APK)

A debug APK can be installed on any Android device without signing:

```bash
cd android
./build-apk.sh debug
```

The APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Install on a connected device (USB debugging enabled):
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Production Release APK

#### Step 1 — Create a signing keystore (one-time)

```bash
mkdir -p android/keystore
keytool -genkeypair \
  -v \
  -keystore android/keystore/release.keystore \
  -alias vinylvault \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**⚠️ Keep this keystore file and passwords safe.** If you lose the keystore
you cannot update the app on Google Play.

#### Step 2 — Get your certificate SHA-256 fingerprint

```bash
keytool -list -v \
  -keystore android/keystore/release.keystore \
  -alias vinylvault
```

Copy the `SHA256` certificate fingerprint — it includes colons (format: `AA:BB:CC:...`).

#### Step 3 — Update `assetlinks.json`

Edit `/.well-known/assetlinks.json` in the project root and replace the
`sha256_cert_fingerprints` value with your fingerprint,
**keeping the colon separators exactly as printed by `keytool`**:

```json
"sha256_cert_fingerprints": [
  "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
]
```

Deploy to Netlify so it is accessible at
`https://vinylvault.netlify.app/.well-known/assetlinks.json`.

#### Step 3b — Set the in-app fingerprint

The same fingerprint must also be embedded in the APK itself via the `asset_statements`
manifest metadata. Pass it as an env var so the two values stay in sync:

```bash
export TWA_SHA256_CERT="AA:BB:CC:DD:EE:FF:..."   # same value as in assetlinks.json
```

`build.gradle` reads `TWA_SHA256_CERT` (or Gradle property `-PTWA_SHA256_CERT=…`) and
injects it into the APK manifest. The build will fail with a clear error if it is not set.

> **Why both?** Android verifies TWA ownership by matching the fingerprint in
> `assetlinks.json` (served by your website) against the fingerprint declared inside
> the APK. They must be identical for TWA verification to pass.

#### Step 4 — Build release APK

```bash
export KEYSTORE_PATH="$(pwd)/android/keystore/release.keystore"
export KEYSTORE_PASSWORD="your-keystore-password"
export KEY_ALIAS="vinylvault"
export KEY_PASSWORD="your-key-password"
export TWA_SHA256_CERT="AA:BB:CC:DD:EE:FF:..."   # fingerprint from Step 2

cd android
./build-apk.sh release https://vinylvault.netlify.app
```

Outputs:
- **APK**: `app/build/outputs/apk/release/app-release.apk` — for direct install
- **AAB**: `app/build/outputs/bundle/release/app-release.aab` — for Google Play

---

## Configuring the Host URL

The APK wraps **your deployed Netlify URL**. If you use a custom domain, pass
it to the build script:

```bash
./build-apk.sh release https://your-custom-domain.com
```

Or edit `android/app/build.gradle` directly:
```groovy
manifestPlaceholders = [
    hostName: "your-custom-domain.com",
    defaultUrl: "https://your-custom-domain.com/?source=twa",
    ...
]
```

---

## Installing on a Phone (Sideload)

1. On your Android phone go to **Settings → Security → Install unknown apps**
   and enable it for Files (or your file manager).
2. Copy `app-release.apk` to your phone (USB, email, Google Drive, etc.).
3. Tap the APK file on your phone → Install.

The app will appear on your home screen as **VinylVault** with the gold vinyl
record icon.

---

## Google Play Submission

Upload `app-release.aab` (not the APK) to the
[Google Play Console](https://play.google.com/console):

1. Create a new app (Free, age rating: Everyone).
2. Upload the `.aab` under **Production → Releases → Create release**.
3. Fill in store listing (name, description, screenshots from `/static/`).
4. Submit for review (typically 1–3 business days).

---

## Common Gotchas and Fixes

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| App opens in a browser tab with an address bar | `assetlinks.json` not served or SHA-256 mismatch | Verify `https://vinylvault.netlify.app/.well-known/assetlinks.json` returns JSON with the exact fingerprint embedded in the APK; re-deploy Netlify |
| White flash on launch (before the PWA loads) | Android 12+ shows its own OS splash screen before Chrome takes over | `values-v31/styles.xml` sets `windowSplashScreenBackground` to match brand colors — ensure this file is present |
| Status bar still visible / shows browser chrome | TWA not verified as app owner | Fix `assetlinks.json` fingerprint mismatch (most common cause) |
| "Parse error" or "App not installed" | APK unsigned or built against wrong `targetSdk` | Use a release-signed APK; confirm `compileSdk`/`targetSdk` match your SDK installation |
| White/blank screen on launch | PWA host URL unreachable | Check Netlify deploy status and internet connectivity |
| Camera permission denied | Missing permission | `CAMERA` permission is declared in `AndroidManifest.xml`; Android 6+ requires runtime grant |
| Install fails with "blocked by Play Protect" | App not from Play Store and Play Protect is strict | Temporarily disable Play Protect, install, then re-enable |
| Back button exits the app unexpectedly | Not a real TWA (running in browser, not TWA mode) | Fix `assetlinks.json` — when TWA is verified, Chrome handles the back stack |
| `TWA_SHA256_CERT is not configured` Gradle error | Env var not exported | `export TWA_SHA256_CERT="AA:BB:..."` before running Gradle |
| PWABuilder score < 100 | Missing manifest fields or service worker | Ensure `manifest.json` has `name`, `short_name`, icons (192 + 512), `start_url`, `display: standalone`, `theme_color`, `background_color`; ensure `sw.js` is registered |

---

## Alternatives to PWABuilder (2026)

| Tool | Pros | Cons |
|------|------|------|
| **[PWABuilder](https://www.pwabuilder.com)** (recommended) | Free, browser-based, no local tools, generates signing key, one-click AAB | Requires online access; less control over advanced Gradle config |
| **[Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap)** | Google-maintained, full control, local build, same TWA foundation as PWABuilder | Requires Node.js + Java + Android SDK; more setup steps |
| **[GitHub Actions (this repo)](https://github.com/flencrypto/VinylVault/actions)** | Fully automated CI/CD, reproducible builds, no local tools | Requires GitHub secrets setup; debug builds only until secrets are added |
| **[AppsGeyser](https://appsgeyser.com)** | Zero-config, no account needed | Ads injected unless paid; no TWA (uses WebView); not suitable for Play Store |
| **[GoNative.io](https://gonative.io)** | Professional wrapper with extras (push, biometrics) | Paid ($99+/yr); overkill for a pure PWA |

**Recommendation for 2026:** Use **PWABuilder** for the initial build and key generation, then switch to this repo's **GitHub Actions CI** for automated release builds going forward. Bubblewrap is the best alternative if you need full local control without a browser tool.

---

## Architecture

```
android/
├── app/
│   ├── build.gradle           # App config, signing, TWA host URL, dependencies
│   ├── proguard-rules.pro     # Code shrinking rules
│   └── src/main/
│       ├── AndroidManifest.xml  # TWA activity, permissions, deep links, splash meta-data
│       └── res/
│           ├── drawable/splash.xml      # Splash screen (dark bg + gold vinyl icon)
│           ├── mipmap-*/                # Launcher icons (mdpi → xxxhdpi)
│           ├── values/colors.xml        # Brand colours (#C8973F gold, #0E0C0B surface)
│           ├── values/strings.xml       # App name
│           ├── values/styles.xml        # Base theme (minSdk 21+)
│           ├── values-v31/styles.xml    # Android 12+ splash screen overrides
│           └── xml/file_paths.xml       # FileProvider paths for camera
├── build.gradle               # Root Gradle config
├── settings.gradle            # Module list
├── gradle.properties          # JVM + AndroidX flags
├── gradlew                    # Gradle wrapper (Unix)
├── build-apk.sh               # Automated build script
└── gradle/wrapper/
    └── gradle-wrapper.properties  # Gradle version pin (8.6)
```
