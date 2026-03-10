# Project Brief

## Purpose

VinylVault is an AI-powered Progressive Web App (PWA) that helps vinyl record collectors and sellers manage their collections, price their records accurately, and list them for sale on eBay with minimal manual effort.

Core capabilities:

- **AI-assisted listing generation** — photograph a record and its sleeve; OCR and AI (xAI/Grok) extract the artist, title, label, catalogue number, matrix/runout, and pressing details to produce a ready-to-publish eBay draft.
- **Pressing identification** — cross-references Discogs data and matrix patterns (including UK EMI/Parlophone conventions) to identify original pressings and regional variants.
- **Pricing intelligence** — aggregates sold and active prices from Discogs and eBay, normalizes by condition, currency, and pressing, and suggests a defensible asking price with provenance metadata.
- **Deal finder / arbitrage** — scans eBay listings for underpriced records relative to market value, enabling users to spot buy-low/sell-high opportunities.
- **Collection management** — stores a local inventory of records with condition notes, photos, valuations, and listing status.
- **Solana NFT minting** — optionally mints a vinyl record as an NFT on Solana using Metaplex Core, providing a digital certificate of ownership.

The application runs entirely client-side as a static PWA today, with a roadmap to move credentialed API calls (Discogs, AI, eBay) to a server-side broker for security and compliance.

## Target Users

 User type | Description |
|---|---|
| **Casual collector-sellers** | Vinyl enthusiasts who periodically sell duplicates or upgrades on eBay and want a fast, accurate listing workflow without specialist knowledge. |
| **Professional record dealers** | High-volume eBay sellers who need to process dozens of records per session and rely on consistent, well-formatted listings and competitive pricing data. |
| **Arbitrage / deal hunters** | Buyers who scour eBay and charity shops for underpriced records; they use the deal-finder to surface opportunities and validate resale margins quickly. |
| **Serious collectors** | Enthusiasts building a curated collection who need accurate pressing identification, condition grading, and real-time valuations for insurance or portfolio tracking. |
