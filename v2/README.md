# VinylVault v2

**v2** is the Next.js 15 rewrite of VinylVault — a collector-first vinyl valuation and marketplace arbitrage tool.  
It moves all API keys and third-party calls server-side, adds proper route structure, and introduces a polished Radix UI component library.

> **Status:** In active development. The v1 static PWA (root of this repo) is the current production app.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI components | Radix UI primitives + Tailwind CSS |
| Icons | Lucide React |
| Package manager | pnpm |

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | https://nodejs.org |
| pnpm | ≥ 10 | `npm install -g pnpm` |

---

## Getting started

```bash
# 1. Enter the v2 directory
cd v2

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp ../.env.example .env.local   # copy template from repo root, then fill in your API keys

# 4. Start the development server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server (hot reload) |
| `pnpm run build` | Production build |
| `pnpm run start` | Serve a production build |
| `pnpm run lint` | Run ESLint |

---

## Environment variables

Create `v2/.env.local` (git-ignored) with your credentials:

```env
# Discogs — collection import, pressing comps, variant resolver
DISCOGS_USER_TOKEN=your-token-here

# eBay — sold-listing comps, listing preview generator
EBAY_CLIENT_ID=your-client-id
EBAY_CLIENT_SECRET=your-client-secret

# Optional: user-level eBay tokens (order placement, inventory)
EBAY_USER_TOKEN=...
EBAY_ACCESS_TOKEN=...

# OpenAI — OCR for label/runout photos, barcode + AI pressing identification
OPENAI_API_KEY=sk-...

# xAI (Grok) — second-opinion AI, cross-validates OpenAI results
# NOTE: OPENAI_API_KEY must also be set — xAI supplements OpenAI, it does not replace it.
XAI_API_KEY=xai-...
```

Restart `pnpm run dev` after editing `.env.local`.

For detailed instructions on where to obtain each key, see **[REQUIRED_KEYS_AND_LOGINS.txt](../REQUIRED_KEYS_AND_LOGINS.txt)** in the repo root.

### Integration gating

When a key is missing, the app shows a modal dialog with:
- Which env var is needed and why.
- Step-by-step instructions to obtain credentials.
- A link to the official developer portal.
- A link to the `/setup` page.

The `GET /api/setup/status` endpoint returns an object per integration with `configured` (boolean) and `missingVars` (array of unset env var names) — it never exposes secret values.

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/vault` | Collection overview (grid / list) |
| `/library` | Full library with search and filters |
| `/add` | Add a record (barcode scan, photo OCR, manual entry) |
| `/record/[id]` | Record detail — Overview, Value, Variant, Condition, Media, Activity tabs |
| `/valuation` | Portfolio valuation with Discogs + eBay comps |
| `/review` | Listing review queue |
| `/reports` | Collection analytics and reports |
| `/integrations` | Integration status cards |
| `/settings` | Application settings |
| `/setup` | API key setup guide with live status badges |
| `/sign-in` | Authentication |
| `/welcome` | Onboarding flow |

---

## Project structure

```text
v2/
├── app/
│   ├── (app)/               ← authenticated app shell
│   │   ├── add/             ← Add record page
│   │   ├── integrations/    ← Integration status page
│   │   ├── library/         ← Library page
│   │   ├── record/[id]/     ← Record detail page
│   │   ├── reports/         ← Reports page
│   │   ├── review/          ← Review queue page
│   │   ├── settings/        ← Settings page
│   │   ├── setup/           ← Setup / onboarding page
│   │   ├── valuation/       ← Valuation page
│   │   ├── vault/           ← Vault overview page
│   │   └── layout.tsx       ← App shell layout
│   ├── (auth)/sign-in/      ← Sign-in page
│   ├── (onboarding)/welcome/← Welcome / onboarding page
│   ├── api/setup/status/    ← GET /api/setup/status — integration status
│   ├── layout.tsx           ← Root layout
│   └── page.tsx             ← Root redirect / landing
├── components/
│   ├── library/             ← Library UI components
│   ├── record/              ← Record detail tabs
│   ├── setup/               ← Integration gate modals
│   ├── shell/               ← App shell (sidebar, topbar, bottom nav)
│   └── ui/                  ← Radix UI primitives (button, card, dialog, …)
├── lib/
│   ├── integrations/        ← Integration requirements registry + server checks
│   └── utils.ts             ← Shared utilities
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Deployment

The v2 app is a standard Next.js application and can be deployed to any platform that supports Node.js.

**Recommended: Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

cd v2
vercel deploy
```

Add the environment variables from `.env.local` to your Vercel project settings.

**Self-hosted / other platforms**

```bash
cd v2
pnpm run build
pnpm run start   # serves on port 3000 by default
```

---

## Related docs

- **[../README.md](../README.md)** — top-level project overview and v1 install instructions.
- **[../REQUIRED_KEYS_AND_LOGINS.txt](../REQUIRED_KEYS_AND_LOGINS.txt)** — all API keys and where to obtain them.
- **[../ANDROID_BUILD.md](../ANDROID_BUILD.md)** — Android APK build guide.
- **[../SECURITY.md](../SECURITY.md)** — security baseline.
- **[../PRIVACY.md](../PRIVACY.md)** — privacy and data-retention policy.
