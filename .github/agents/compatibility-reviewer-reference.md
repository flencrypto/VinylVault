# Compatibility Reviewer Agent - Quick Reference

## When to Use This Agent

Use `/compatibility-reviewer` when you need:
- Code review focused ONLY on compatibility issues
- Validation of API version compatibility
- Browser support verification
- Dependency compatibility checking
- Backward compatibility assessment

## What This Agent Does NOT Do

- Code style or formatting reviews
- Performance optimization suggestions
- Security vulnerability analysis
- Architectural design feedback
- Logic correctness evaluation

## Issue Reporting Format

**Compatibility Issue: [short title]**
- **Affected code** — file:line-range or code snippet
- **Compatibility dimension** — browser / backward / dependency / API / PWA / etc.
- **What breaks** — who / what stops working and why
- **Minimum affected version / target** — e.g. Node <18, Chrome <100, Discogs API v2, etc.
- **Recommended fix (minimal change)** — smallest code change that restores compatibility

## Example Reviews

### Browser Compatibility Issue
```
**Compatibility Issue: Optional Chaining in Legacy Browsers**
- **Affected code** — script.js:45-50
- **Compatibility dimension** — browser
- **What breaks** — Users on Safari <13.1, Chrome <80 cannot load the app
- **Minimum affected version** — Safari 13.1+, Chrome 80+
- **Recommended fix** — Replace optional chaining with traditional null checks
```

### API Compatibility Issue
```
**Compatibility Issue: Discogs API v2 Deprecation**
- **Affected code** — discogs-service.js:120-135
- **Compatibility dimension** — API
- **What breaks** — Discogs API v1 endpoints will stop working after Dec 2024
- **Minimum affected version** — Discogs API v2+
- **Recommended fix** — Update endpoint URLs and authentication
```

## Common Compatibility Checks for VinylVault

### Browser Support
- ES6+ features (optional chaining, nullish coalescing)
- Web APIs (Camera, FileReader, Service Workers)
- CSS Grid/Flexbox support

### API Integrations
- Discogs API version compatibility
- eBay API OAuth flows
- Solana web3.js RPC endpoints
- OpenAI/Grok API version changes

### Dependencies
- Node.js version requirements
- npm package semver compatibility
- TypeScript version constraints

### PWA Features
- Service Worker lifecycle events
- Manifest.json requirements
- Offline storage compatibility

## Quick Commands

```bash
# Review current changes
/compatibility-reviewer Check latest commits for compatibility

# Check specific file
/compatibility-reviewer Review src/ebay/browseService.ts

# Verify API compatibility
/compatibility-reviewer Check Discogs API integration compatibility

# Browser support audit
/compatibility-reviewer Audit browser support for new features
```