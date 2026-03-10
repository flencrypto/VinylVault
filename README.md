# VinylVault

## Assumptions

- This repository is currently a static web application (`index.html`, `style.css`, `script.js`) used to generate record listing drafts.
- The near-term goal is to make the project production-ready without rewriting the UI first.
- Credentialed third-party integrations (Discogs, AI providers, marketplace APIs) should move server-side before launch.

## Scope

This repository now includes a concrete completion plan and security/compliance baseline documents for the next implementation phase:

- Architecture and delivery roadmap.
- Security controls and operational requirements.
- Privacy and data-retention policy baseline.
- STRIDE-oriented threat model.

## Installing VinylVault

VinylVault is a **Progressive Web App (PWA)**. You can install it on phones, tablets, and desktop computers for a full-screen, app-like experience with no app store required. An optional Android APK is also available for sideloading.

---

### 📱 Mobile — Android

#### Android: Chrome, Edge, or Brave

These three browsers share the same installation flow on Android.

1. Open the VinylVault URL in **Chrome**, **Edge**, or **Brave** for Android.
2. Tap the **⋮ (three-dot) menu** in the top-right corner.
3. Tap **"Add to Home screen"** (or **"Install app"** if an install banner appears at the bottom).
4. Confirm by tapping **"Add"** or **"Install"** in the dialog.
5. The **VinylVault** icon will appear on your home screen. Tap it to launch in full-screen mode.

> **Tip:** If the option is missing, make sure you are on `https://` — PWA installation requires a secure connection.

#### Android: Samsung Internet

1. Open the VinylVault URL in **Samsung Internet**.
2. Tap the **☰ (hamburger) menu** at the bottom of the screen.
3. Tap **"Add page to"** → **"Home screen"**.
4. Tap **"Add"** to confirm.

#### Android: Firefox

Firefox for Android does not currently support PWA installation. Use Chrome, Edge, Brave, or Samsung Internet instead.

---

### 📱 Mobile — iPhone & iPad (iOS / iPadOS)

#### iOS / iPadOS: Safari

1. Open the VinylVault URL in **Safari** (only Safari can install PWAs on iOS/iPadOS).
2. Tap the **Share button** (box with an arrow pointing up) at the bottom of the screen.
3. Scroll down and tap **"Add to Home Screen"**.
4. Edit the name if you wish, then tap **"Add"** in the top-right corner.
5. The **VinylVault** icon will appear on your home screen. Tap it to launch in full-screen mode.

> **Note:** Chrome, Firefox, and other browsers on iOS/iPadOS use Apple's WebKit engine and cannot install PWAs — Safari is required.

---

### 🖥️ Desktop — Windows, macOS, and Linux

#### Windows / macOS / Linux: Chrome, Edge, or Brave

Chrome, Edge, and Brave all share the same installation flow on every desktop OS (Windows, macOS, and Linux).

1. Open the VinylVault URL in **Chrome**, **Edge**, or **Brave**.
2. Look for the **install icon** (⊕ or a small screen icon) in the right-hand side of the address bar.  
   - If no icon appears, click the **⋮ menu** → **"Save and share"** (Chrome) or **"Apps"** (Edge) → **"Install VinylVault"**.
3. Click **"Install"** in the confirmation dialog.
4. VinylVault opens in its own window and a shortcut is added to your taskbar / Dock / desktop.

> **Tip:** You can also re-open it from your OS's application launcher or start menu just like any other app.

#### macOS: Safari (macOS Sonoma (14) or later)

Safari on macOS Sonoma (14) or later supports installing web apps directly to the Dock.

1. Open the VinylVault URL in **Safari**.
2. In the menu bar click **File** → **Add to Dock…** (macOS Sonoma (14) or later).
3. Edit the name if you wish, then click **"Add"**.
4. VinylVault appears in your Dock and runs as a standalone app.

> **Note:** The "Add to Dock" option requires **macOS Sonoma (14) or later**. On older macOS versions use Chrome or Edge instead.

#### Windows / macOS / Linux: Firefox

Firefox does not currently support PWA installation on desktop. Use Chrome, Edge, or Brave for the installable app experience, or simply keep VinylVault open in a Firefox tab.

---

### 📦 Android APK (sideload — alternative to PWA)

A signed release APK is available for Android devices if you prefer a native install from outside the Play Store.

#### Step 1 — Get the APK onto your phone

Choose whichever method is easiest:

**Option A — Download directly on your phone (simplest)**

1. On your Android phone open Chrome (or any browser).
2. Navigate to the [latest release APK](https://github.com/flencrypto/VinylVault/raw/main/releases/VinylVault-1.0.0-release.apk) — the download starts automatically.
3. The APK will land in your **Downloads** folder.

**Option B — Transfer from your computer**

1. Download [`VinylVault-1.0.0-release.apk`](https://github.com/flencrypto/VinylVault/raw/main/releases/VinylVault-1.0.0-release.apk) to your computer.
2. Copy it to your phone using one of:
   - **USB cable** — connect the phone, switch to **File Transfer (MTP)** mode, and copy the APK to the phone's storage.
   - **Google Drive / Dropbox** — upload on your computer, open the Drive/Dropbox app on your phone, and tap **Download**.
   - **Email** — attach the APK to an email and open it on your phone.

**Option C — ADB (developers)**

```bash
adb install releases/VinylVault-1.0.0-release.apk
```

If using ADB, skip Steps 2 and 3 — ADB installs directly and does not require "Install unknown apps".

---

#### Step 2 — Enable "Install unknown apps"

The exact steps depend on your Android version:

**Android 8.0 and later (most phones)**

Android 8+ grants install permission per browser or file manager — not globally.

1. When you tap the APK (or the browser shows a download-complete prompt), Android will ask:
   > **"Your phone is not allowed to install unknown apps from this source"**
2. Tap **Settings** in that dialog.
3. Toggle **Allow from this source** on.
4. Tap the back arrow to return and proceed with the install.

   — *or* —

   Go to **Settings → Apps** (or **Applications**) → tap the app you downloaded with (e.g. **Chrome** or **Files**) → **Install unknown apps** → toggle **Allow from this source**.

**Android 7 and earlier**

1. Open **Settings → Security** (or **Settings → Lock screen and security**).
2. Toggle **Unknown sources** on.
3. Tap **OK** on the warning dialog.

---

#### Step 3 — Install and launch

1. Open your **Files** app (or **Downloads** folder) and tap `VinylVault-1.0.0-release.apk`.
2. Tap **Install** in the confirmation screen.
3. Tap **Done** (or **Open** to launch immediately).
4. **VinylVault** will appear on your home screen with the gold vinyl record icon.

> ⚠️ Only install APKs from sources you trust. Always verify the file is from the official VinylVault repository before installing.

#### Step 4 — Re-secure your device (Android 7 and earlier only)

If you enabled **Unknown sources** globally in Step 2, go back to **Settings → Security** and turn it off again to keep your device protected.

On Android 8 and later the per-app permission is automatically restricted after install — no action needed.

---

For developer instructions (building from source, signing, and publishing to Google Play) see **[ANDROID_BUILD.md](ANDROID_BUILD.md)**.

---

## How to run (current app)

1. Serve the repository with any static file server.
2. Open `index.html` in a browser.

Examples:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Current file tree (selected)

```text
.
├── index.html
├── style.css
├── script.js
├── components/
├── SECURITY.md
├── PRIVACY.md
├── THREATMODEL.md
└── docs/
    └── COMPLETION_PLAN.md
```

## Commands to run

```bash
python3 -m http.server 8080
node --check script.js
```

## Documentation added

- `docs/COMPLETION_PLAN.md` — phased completion plan with priorities and acceptance criteria.
- `SECURITY.md` — minimum security baseline and hardening checklist.
- `PRIVACY.md` — UK GDPR-oriented data handling and retention policy.
- `THREATMODEL.md` — STRIDE threat model and mitigations.
