# VinylVault

## Overview

VinylVault is a collector-first vinyl valuation and marketplace arbitrage tool. It helps you identify, value, and manage your vinyl record collection using AI-assisted pressing identification, live market data from Discogs and eBay, and optional Solana NFT minting for rare pressings.

The project has two parallel layers:

- **v1** — a static Progressive Web App (PWA) you can use right now in any browser.
- **v2** — a Next.js 15 rewrite (in progress) with server-side API handling and a richer UI.

An Android APK wrapping the v1 PWA is also available for sideloading or Play Store distribution.

## What's in this repo

| Layer | Description |
|-------|-------------|
| **v1 static PWA** | `index.html` + `script.js` + `style.css` — the original collector tool. Runs as a Progressive Web App in any browser or as a native Android app (TWA). |
| **v2 Next.js app** | `v2/` — in-progress Next.js 15 rewrite with server-side API key handling, Radix UI components, and a proper route structure. |
| **Android wrapper** | `android/` — Trusted Web Activity (TWA) Gradle project that packages the PWA as a Play-Store-ready APK/AAB. |
| **Solana contracts** | `contracts/` — Anchor smart contracts for NFT minting of rare pressings (Metaplex Core). |
| **Components** | `components/` — v1 web components: AI services (xAI, OCR), Discogs, eBay, Solana, Telegram, price charts, and more. |

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
2. Navigate to the [latest release APK](https://github.com/flencrypto/VinylVault/raw/master/releases/VinylVault-1.0.0-release.apk) — the download starts automatically.
3. The APK will land in your **Downloads** folder.

**Option B — Transfer from your computer**

1. Download [`VinylVault-1.0.0-release.apk`](https://github.com/flencrypto/VinylVault/raw/master/releases/VinylVault-1.0.0-release.apk) to your computer.
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

## Repository structure

```text
.
├── index.html               ← v1 PWA entry point
├── style.css                ← v1 global styles
├── script.js                ← v1 main application logic
├── collection.html          ← v1 Collection page
├── collection.js            ← v1 Collection page logic
├── vinyl.html               ← v1 individual record page
├── deals.html               ← v1 Deal Finder page
├── deals.js                 ← v1 Deal Finder logic
├── settings.html            ← v1 Settings page
├── sw.js                    ← Service Worker (PWA offline support)
├── manifest.json            ← PWA manifest
├── components/              ← v1 web components (AI, Discogs, eBay, Solana, …)
├── audio/                   ← audio assets
├── branding/                ← logos, colour tokens, and favicon sources
├── static/                  ← deployed icons, OG images, and screenshots
├── scripts/                 ← build and utility scripts
├── android/                 ← Android TWA wrapper (Gradle project)
├── contracts/               ← Solana Anchor smart contracts (NFT minting)
├── v2/                      ← Next.js 15 rewrite (in progress)
├── releases/                ← pre-built release APKs
├── docs/                    ← architecture and planning documents
├── ANDROID_BUILD.md         ← Android build guide
├── DISCOGS_API_INTEGRATION.md ← Discogs API implementation notes
├── REQUIRED_KEYS_AND_LOGINS.txt ← all API keys and where to obtain them
├── SECURITY.md              ← security baseline and hardening checklist
├── PRIVACY.md               ← UK GDPR data-handling and retention policy
└── THREATMODEL.md           ← STRIDE threat model and mitigations
```

## How to run

### v1 — static PWA

Serve the repository root with any static file server and open `index.html`.

```bash
# Python (no install required)
python3 -m http.server 8080
# then visit http://localhost:8080

# or via pnpm script
pnpm run preview:static
```

#### Lint and type-check (v1)

```bash
# Install dev dependencies (first time only)
pnpm install

# Syntax check the main script
node --check script.js

# ESLint
pnpm run lint

# TypeScript type check
pnpm run typecheck
```

### v2 — Next.js app

See **[v2/README.md](v2/README.md)** for full setup instructions.

Quick start:

```bash
cd v2
pnpm install
cp .env.example .env.local   # then fill in your API keys
pnpm run dev
# then visit http://localhost:3000
```

Required API keys are documented in **[REQUIRED_KEYS_AND_LOGINS.txt](REQUIRED_KEYS_AND_LOGINS.txt)**.

## Integrations

| Integration | Feature | Key(s) required |
|-------------|---------|----------------|
| **Discogs** | Collection import, pressing comps, Variant Resolver | `DISCOGS_USER_TOKEN` |
| **eBay** | Sold-listing comps, listing preview generator | `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET` |
| **OpenAI** | OCR for label/runout photos, barcode + AI pressing ID | `OPENAI_API_KEY` |
| **xAI (Grok)** | Second-opinion AI, cross-validation confidence | `XAI_API_KEY` |
| **Telegram** | Notifications | `TELEGRAM_BOT_TOKEN` |
| **Solana** | NFT minting for rare pressings | Wallet keypair |

All keys for the v1 app are entered via **Settings** and stored in `localStorage`.  
For the v2 app, keys are server-side env vars — see `REQUIRED_KEYS_AND_LOGINS.txt`.

## Documentation

- **[v2/README.md](v2/README.md)** — v2 Next.js app setup and routes.
- **[ANDROID_BUILD.md](ANDROID_BUILD.md)** — Android TWA build guide (PWABuilder, GitHub Actions CI, local Gradle).
- **[DISCOGS_API_INTEGRATION.md](DISCOGS_API_INTEGRATION.md)** — Discogs API implementation details.
- **[REQUIRED_KEYS_AND_LOGINS.txt](REQUIRED_KEYS_AND_LOGINS.txt)** — every API key and how to obtain it.
- **[docs/COMPLETION_PLAN.md](docs/COMPLETION_PLAN.md)** — phased completion plan with priorities and acceptance criteria.
- **[SECURITY.md](SECURITY.md)** — minimum security baseline and hardening checklist.
- **[PRIVACY.md](PRIVACY.md)** — UK GDPR-oriented data handling and retention policy.
- **[THREATMODEL.md](THREATMODEL.md)** — STRIDE threat model and mitigations.
