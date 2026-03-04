# VinylFort Branding Assets

This directory is the single source of truth for every visual asset used by the
VinylFort web app and Progressive Web App (PWA). Replace each placeholder with
your own production artwork, then copy/deploy to the locations listed below.

---

## Directory structure

```
branding/
├── README.md              ← you are here
├── brand-tokens.json      ← colour palette, typography, and spacing tokens
│
├── logo/
│   ├── logo.svg           ← primary logo (square/icon form, 512 × 512 recommended)
│   ├── logo-dark.svg      ← logo variant for dark backgrounds
│   ├── logo-light.svg     ← logo variant for light/white backgrounds
│   └── wordmark.svg       ← horizontal logo + brand name (1200 × 300 recommended)
│
├── images/
│   ├── banner.svg         ← hero/marketing banner (1440 × 480)
│   ├── background.svg     ← full-page background texture (1920 × 1080)
│   ├── og-image.svg       ← Open Graph / social share card (1200 × 630)
│   ├── splash-screen.svg  ← PWA splash screen (1242 × 2208 for iPhone 14 Pro Max)
│   └── email-header.svg   ← transactional email header (600 × 200)
│
└── favicon/
    ├── favicon.ico        ← multi-size ICO (16, 32, 48 px)
    ├── favicon-16.png     ← 16 × 16 PNG
    ├── favicon-32.png     ← 32 × 32 PNG
    ├── apple-touch-icon.png  ← 180 × 180 PNG (iOS home screen)
    └── README.md          ← deployment notes for favicon files
```

---

## Where each file is deployed

| Branding file                | Deploy to (repo path)              | Referenced by                       |
|------------------------------|------------------------------------|-------------------------------------|
| `logo/logo.svg`              | `static/icon-512.svg`              | `manifest.json`, PWA install        |
| `logo/logo-dark.svg`         | `static/icon-192.svg`              | `manifest.json`, nav bar            |
| `logo/wordmark.svg`          | `static/wordmark.svg`              | `components/vinyl-nav.js`           |
| `images/og-image.svg`        | `static/og-image.png` (export PNG) | `<meta property="og:image">`        |
| `images/splash-screen.svg`   | `static/splash-*.png` (export PNG) | `manifest.json` `screenshots`       |
| `images/banner.svg`          | `static/banner.png` (export PNG)   | Homepage hero section               |
| `images/background.svg`      | `static/background.png`            | `style.css` body background         |
| `images/email-header.svg`    | Email template / CDN               | Transactional email HTML            |
| `favicon/favicon.ico`        | `static/favicon.ico`               | `<link rel="icon">` in all HTML     |
| `favicon/apple-touch-icon.png` | `static/apple-touch-icon.png`    | `<link rel="apple-touch-icon">`     |

---

## How to replace a placeholder

1. **Open** the `.svg` placeholder in a vector editor (Figma, Inkscape, Illustrator).
2. **Replace** the placeholder artwork with your real design.
3. **Export** as SVG (keep) **and** as PNG at the recommended resolution.
4. **Copy** the exported file to the `static/` path listed in the table above.
5. **Commit** both `branding/` (source) and `static/` (deployed) versions.

> **Tip:** Keep the `branding/` source files in version control so you can
> regenerate any size or format in the future without starting from scratch.

---

## Colour palette

See [`brand-tokens.json`](./brand-tokens.json) for the full token set.
Key brand colours:

| Token            | Hex value   | Usage                          |
|------------------|-------------|--------------------------------|
| `--vf-primary`   | `#c8973f`   | Buttons, links, accents        |
| `--vf-accent`    | `#e8c06a`   | Highlights, badges             |
| `--vf-surface`   | `#0e0c0b`   | Page background                |
| `--vf-text`      | `#f5ede2`   | Primary text                   |

---

## Typography

| Role          | Family                   | Weights       |
|---------------|--------------------------|---------------|
| UI / body     | Inter                    | 400, 500, 600, 700, 800 |
| Display / heading | Cormorant Garamond   | 500, 600, 700 |
| Monospace     | system mono (`ui-monospace`) | 400       |

---

## Questions or changes?

Open a PR targeting `main` and tag the design lead for review.
