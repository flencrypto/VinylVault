# VinylVault Deployment Guide

## Issue: 401 Unauthorized Error on Netlify

### Problem

The VinylVault deployment at `https://vinyltrader.netlify.app/` is returning a `401 Unauthorized` error when accessed by external tools like PWABuilder. This prevents:

- PWA manifest analysis
- Service worker detection
- SEO crawlers
- Integration testing tools
- Public access to the site

### Root Cause

The 401 error is caused by **Netlify password protection** or **visitor access control** enabled at the platform level. This is NOT a code-level issue - it's a deployment setting in the Netlify UI.

### Solution

#### Option 1: Remove Password Protection (Recommended for Production)

1. Log into your Netlify account at https://app.netlify.com
2. Navigate to your site (`vinyltrader` or the specific site name)
3. Go to **Site settings** → **Access control**
4. Check the **Visitor access** section:
   - If "Password protection" is enabled, click **Remove password**
   - If "OAuth" is enabled, consider disabling it or switching to "Public"
5. Save changes and wait 1-2 minutes for propagation
6. Test with: `curl -I https://vinyltrader.netlify.app/`

You should see `HTTP/2 200` instead of `HTTP/2 401`.

#### Option 2: Temporarily Disable Protection for Analysis Tools

If you need to keep password protection in general but allow tools like PWABuilder, SEO crawlers, or integration tests to run:

1. In Netlify, go to **Site settings** → **Access control**.
2. Temporarily disable **Password protection** / visitor access control for the site.
3. Wait 1–2 minutes for the change to propagate.
4. Run your external tools (PWABuilder, lighthouse, SEO scans, etc.) against the site URL.
5. Once analysis is complete, re‑enable **Password protection** to restore restricted access.

#### Option 3: Use Branch Deploys with Public Access

1. Create a separate branch for public testing (e.g., `public-staging`)
2. In Netlify, configure this branch to deploy without password protection
3. Use the branch deploy URL for PWA analysis tools
4. Keep your main branch password-protected if needed

### Verification

After making changes, verify the fix:

```bash
# Check HTTP status (should be 200, not 401)
curl -I https://vinyltrader.netlify.app/

# Check manifest accessibility
curl -I https://vinyltrader.netlify.app/manifest.webmanifest

# Check service worker
curl -I https://vinyltrader.netlify.app/sw.js
```

### PWABuilder Analysis

Once password protection is removed, PWABuilder will be able to:

- Fetch and analyze your PWA manifest
- Detect and validate your service worker
- Generate platform-specific packages (Windows, Android, iOS)
- Provide PWA score and recommendations

### Related Files

- `netlify.toml` - Netlify configuration with security headers
- `manifest.webmanifest` - PWA manifest file
- `sw.js` - Service worker for offline functionality
- `index.html` - Main application entry point

### Security Considerations

If you're removing password protection:

1. ✅ The site uses HTTPS (enforced by Netlify)
2. ✅ Security headers are configured in `netlify.toml`
3. ✅ No API keys or other secrets are committed to this repository
4. ✅ In the current v1 static PWA, any API keys are entered by each user in the browser and stored locally (for example, in `localStorage`) as per‑user settings; they are not shared between users or stored on the server
5. ✅ In v2 (server‑backed) deployments, API keys are provided via server‑side environment variables and are never embedded in the client bundle
6. ✅ Frame protection (`X-Frame-Options: DENY`) prevents clickjacking
7. ✅ Content type sniffing is disabled (`X-Content-Type-Options: nosniff`)

With these constraints, the repository and deployed site are safe to make public from a deployment perspective: no secrets are stored in version control, and in v1 any keys users choose to enter are stored only in their own browser as client‑side settings (not as protected server‑side environment variables).

### Support

If you continue to see 401 errors after removing password protection:

1. Clear your browser cache
2. Wait 5 minutes for Netlify CDN propagation
3. Check Netlify deploy logs for errors
4. Verify you saved changes in the Netlify UI
5. Contact Netlify support if the issue persists

## Additional Deployment Notes

### Environment Variables

The following environment variables are used by the **v2 Next.js app / server-side deployments** or by **build-time tooling**. Configure them in Netlify (or your chosen hosting environment) only for those deployments:

- `EBAY_CLIENT_ID` - eBay API client ID
- `EBAY_CLIENT_SECRET` - eBay API client secret
- `DISCOGS_USER_TOKEN` - Discogs API token
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `XAI_API_KEY` - xAI/Grok API key (optional)

> Note: The current production site at `https://vinyltrader.netlify.app/` is the **v1 static PWA**, which reads API keys from the in‑app **Settings** (client-side). Setting these variables in Netlify alone will **not** resolve 401 errors on the v1 static PWA deployment.

### Build Settings

Current build configuration in `netlify.toml`:

```toml
[build]
  publish = "."
  command = "corepack enable && pnpm install --frozen-lockfile && pnpm run typecheck"
```

This ensures:
- Dependencies are installed with pnpm
- TypeScript is type-checked before deployment
- The root directory is published (static PWA)

### Redirect Rules

Currently, no redirect rules are configured. If you need to add redirects:

1. Create a `_redirects` file in the root
2. Add redirect rules (one per line)
3. Commit and deploy

Example:
```
/api/*  https://api.yourdomain.com/:splat  200
/old-path  /new-path  301
```

### Headers Configuration

Security headers are configured in `netlify.toml` for:

- All pages (`/*`) - Frame protection, content type sniffing prevention
- Manifest files (`/manifest.webmanifest` - canonical, `/manifest.json` - legacy/alias) - Correct content type
- Asset links (`/.well-known/assetlinks.json`) - Android TWA verification
- Static assets (`/static/*`) - Aggressive caching

No changes are needed to the headers configuration to fix the 401 error.
