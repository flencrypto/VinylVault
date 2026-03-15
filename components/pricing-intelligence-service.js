/**
 * Pricing Intelligence Service
 * Provides multi-source, provenance-aware price context for vinyl records.
 * Phase 2 feature — provenance-aware pricing.
 *
 * Primary sources (in order of preference):
 *   1. eBay sold/completed listings (via ebay-service.js)
 *   2. Discogs current marketplace stats (lowest price, for-sale count)
 *
 * Future: PriceCharting, Popsike-style historical aggregation (server-side broker).
 *
 * @see SECURITY.md — all network calls respect existing rate limits
 */

class PricingIntelligenceService extends HTMLElement {
  constructor() {
    super();
    this._cache = new Map();
    this.CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
  }

  // ─── Public API ──────────────────────────────────────────────

  /**
   * Main public API — get price intelligence for a Discogs release.
   * @param {number|string} releaseId  Discogs release ID
   * @param {Object}  [options]
   * @param {boolean} [options.forceRefresh=false] Bypass cache
   * @param {string}  [options.condition="VG+"]    Target condition for eBay filter
   * @returns {Promise<Object>} Price intelligence object
   */
  async getPriceIntelligence(releaseId, options = {}) {
    if (!releaseId) throw new Error("releaseId is required");

    const cacheKey = `price-intel-${releaseId}`;
    const forceRefresh = options.forceRefresh === true;

    if (!forceRefresh) {
      const cached = this._cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
        console.debug(`[PricingIntel] Cache hit for release ${releaseId}`);
        return cached.data;
      }
    }

    console.debug(`[PricingIntel] Computing intelligence for release ${releaseId}`);
    const result = await this._computeIntelligence(releaseId, options);

    this._cache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  }

  /**
   * Attempt to match user's matrix against known variants of the same master.
   * @param {number}          releaseId
   * @param {string|string[]} userMatrixRaw — from OCR, photo notes, or manual input
   * @returns {Promise<Object>} { matchedVariant, score, matchType, explanation, ... }
   */
  async matchPressingVariant(releaseId, userMatrixRaw) {
    const releaseMeta = await this._fetchDiscogsReleaseMetadata(releaseId);
    if (!releaseMeta) {
      return { matchedVariant: null, score: 0, explanation: "No metadata available" };
    }

    const userNorm = this._normalizeMatrix(
      Array.isArray(userMatrixRaw) ? userMatrixRaw.join("\n") : userMatrixRaw
    );

    // TODO: Phase 1+ — fetch master variants via server broker.
    // For now: compare against self (baseline release) + warn.
    console.warn("[PricingIntel] Variant matching limited — full /masters/ lookup requires Phase 1 broker");

    const selfVariant = {
      releaseId,
      matrix: (releaseMeta.matrixNumbers || []).map(m => m.value),
      notes: (releaseMeta.notes || "").substring(0, 200),
      isMisprint: releaseMeta.hasMisprint
    };

    const selfNorm = this._normalizeMatrix(selfVariant.matrix.join("\n"));
    const selfMatch = this._compareMatrix(userNorm, selfNorm);

    return {
      matchedVariant: selfVariant,
      score: selfMatch.score,
      matchType: selfMatch.matchType,
      explanation: selfMatch.explanation,
      userNormalized: userNorm,
      baselineNormalized: selfNorm,
      allVariants: [selfVariant]
    };
  }

  /**
   * One-shot: photo → matrix → variant match + updated intelligence.
   * @param {number}    releaseId
   * @param {File|Blob} photo
   * @returns {Promise<Object>} full intelligence + match result
   */
  async getIntelligenceFromPhoto(releaseId, photo) {
    const ocr = window.enhancedOcrService || document.createElement("enhanced-ocr-service");

    const matrixResult = typeof ocr.extractMatrixFromImage === "function"
      ? await ocr.extractMatrixFromImage(photo)
      : { matrix: [], raw: "", confidence: 0, sideHints: [] };

    const intel = await this.getPriceIntelligence(releaseId, { forceRefresh: true });
    const variantMatch = await this.matchPressingVariant(releaseId, matrixResult.matrix);

    if (variantMatch.score >= 0.85) {
      intel.stats.confidence = "high";
      intel.stats.variantMatch = variantMatch;
    }

    return { ...intel, ocrMatrix: matrixResult, pressingMatch: variantMatch };
  }

  /**
   * Format matrix + provenance for AI prompt injection.
   * @param {Object} intelligenceResult  from getPriceIntelligence()
   * @param {string} [userMatrixRaw]     optional extra from user/OCR
   * @returns {string} prompt-safe context string
   */
  buildMatrixPromptContext(intelligenceResult, userMatrixRaw = "") {
    const { release, stats, comparables } = intelligenceResult || {};
    if (!release) return "";

    const prov = release.provenance;
    let ctx = `Release: ${release.artist} - ${release.title} (${release.year || "unknown year"})\n`;

    if (prov && prov.matrixNumbers && prov.matrixNumbers.length) {
      ctx += "Known matrix/runout from Discogs:\n";
      prov.matrixNumbers.forEach(m => {
        ctx += `- Side ${m.side}: ${m.value} (${m.description || "no description"})\n`;
      });
    }

    if (userMatrixRaw) {
      ctx += `\nUser-provided matrix (from photo/OCR/notes):\n${userMatrixRaw}\n`;
    }

    if (prov && prov.hasMisprint) {
      ctx += "This pressing has a known misprint/mispress variant.\n";
    }

    ctx += `\nPricing context:\n- Median sold (recent): $${stats?.medianSoldLast90d || "N/A"}\n`;
    ctx += `- Current lowest listing: $${stats?.currentLowestListing || "N/A"}\n`;
    ctx += `- Confidence: ${stats?.confidence || "low"}\n`;

    if (comparables && comparables.length) {
      ctx += "Recent comps:\n";
      comparables.slice(0, 3).forEach(c => {
        ctx += `- $${c.price} (${c.condition}, sold ${c.soldDate || "unknown"})\n`;
      });
    }

    return ctx;
  }

  // ─── Internal: Intelligence computation ──────────────────────

  async _computeIntelligence(releaseId, options) {
    const start = performance.now();

    let releaseMetadata = null;
    let ebayData = null;
    let discogsMarketData = null;
    const sources = [];

    // Step 1: ALWAYS fetch core release metadata from Discogs first
    try {
      releaseMetadata = await this._fetchDiscogsReleaseMetadata(releaseId);
      if (releaseMetadata) sources.push("discogs-metadata");
    } catch (err) {
      console.warn("[PricingIntel] Discogs metadata fetch failed", err.message);
    }

    // Step 2: eBay sold listings — now with smart keywords if metadata available
    try {
      ebayData = await this._fetchEbaySoldData(releaseId, {
        ...options,
        releaseMetadata
      });
      if (ebayData && ebayData.soldItems && ebayData.soldItems.length > 0) {
        sources.push("ebay");
      }
    } catch (err) {
      console.warn("[PricingIntel] eBay sold fetch failed", err.message);
    }

    // Step 3: Discogs current marketplace stats
    try {
      discogsMarketData = await this._fetchDiscogsMarketData(releaseId);
      if (discogsMarketData) sources.push("discogs");
    } catch (err) {
      console.warn("[PricingIntel] Discogs market fetch failed", err.message);
    }

    return this._normalizeToIntelligenceObject({
      releaseId,
      releaseMetadata,
      ebayData,
      discogsMarketData,
      sources,
      fetchDurationMs: performance.now() - start
    });
  }

  // ─── Data Fetchers ───────────────────────────────────────────

  async _fetchDiscogsReleaseMetadata(releaseId) {
    const discogsService = window.discogsService ||
      document.createElement("discogs-service");

    const release = await discogsService.getReleaseDetails(releaseId);
    if (!release) return null;

    // Labels
    const labels = (release.labels || []).map(l => ({
      name: l.name,
      catno: l.catno,
      role: l.role || "Label"
    }));

    // Companies → Printer / Pressed By / Manufactured By
    const companies = (release.companies || []).map(c => ({
      name: c.name,
      catno: c.catno,
      type: c.entity_type_name || c.role
    }));

    const printerInfo = companies.filter(c =>
      /print|press|manufacture|made/i.test(c.type)
    );

    // Identifiers → Matrix / Runout
    const matrixNumbers = (release.identifiers || [])
      .filter(id =>
        id.type === "Matrix / Runout" ||
        id.type === "Runout" ||
        /matrix|runout/i.test(id.description || "")
      )
      .map(id => ({
        side: id.for || "Unknown",
        value: (id.value || "").trim(),
        description: id.description || "",
        isMisprint: /misprint|mispress|error|typo/i.test(
          (id.value || "") + " " + (id.description || "")
        )
      }));

    // Credits
    const credits = [
      ...(release.credits || []),
      ...(release.extraartists || [])
    ].map(c => ({
      role: c.role,
      name: c.name,
      notes: c.notes || ""
    }));

    // Notes
    const notes = release.notes || "";

    // Simple misprint flag
    const hasMisprint =
      /misprint|mispress|mispressed|error|typo|wrong label|wrong cover/i.test(notes) ||
      matrixNumbers.some(m => m.isMisprint);

    return {
      title: release.title,
      artist: release.artists?.[0]?.name || release.artists_sort || "Unknown",
      year: release.year || null,
      formats: release.formats?.map(f => f.name).join(", ") || "Unknown",
      catno: release.labels?.[0]?.catno || null,
      label: labels,
      country: release.country || null,
      thumb: release.thumb || null,
      communityWant: release.community?.want || 0,
      communityHave: release.community?.have || 0,
      masterId: release.master_id || null,
      notes,
      matrixNumbers,
      printer: printerInfo,
      credits,
      hasMisprint,
      companies
    };
  }

  async _fetchEbaySoldData(releaseId, { releaseMetadata, condition = "VG+" } = {}) {
    const ebayService = window.ebayService;
    if (!ebayService || !ebayService.hasSearchCredentials) return null;

    let keywords;
    if (releaseMetadata && releaseMetadata.title && releaseMetadata.artist) {
      keywords = `"${releaseMetadata.artist}" "${releaseMetadata.title}" vinyl LP`;
      if (releaseMetadata.year) keywords += ` ${releaseMetadata.year}`;
      if (releaseMetadata.catno) keywords += ` ${releaseMetadata.catno}`;
      if (releaseMetadata.matrixNumbers && releaseMetadata.matrixNumbers.length > 0) {
        keywords += ` ${releaseMetadata.matrixNumbers[0].value}`;
      }
    } else {
      keywords = `discogs release ${releaseId} vinyl`;
    }

    const conditionFilter = condition !== "Any" ? condition : "Used";

    const results = await ebayService.searchListings(keywords, {
      limit: 20,
      sort: "newlyListed",
      filter: `conditionIds:{3000}`,   // 3000 = "Used" in eBay condition IDs
    });

    if (!results || results.length === 0) return null;

    // Filter to likely relevant items
    const relevantItems = results.filter(item => {
      const titleLower = (item.title || "").toLowerCase();
      return titleLower.includes("vinyl") || titleLower.includes("lp") ||
             titleLower.includes("record") || titleLower.includes("pressing");
    });

    if (relevantItems.length === 0) return null;

    const prices = relevantItems
      .filter(item => item.price?.value)
      .map(item => ({
        price: parseFloat(item.price.value),
        currency: item.price.currency || "USD",
        soldDate: item.itemEndDate || null,
        condition: item.condition || "Unknown",
        title: item.title,
        url: item.itemWebUrl
      }))
      .sort((a, b) => a.price - b.price);

    if (prices.length === 0) return null;

    const pricesNumeric = prices.map(p => p.price);
    const avg = pricesNumeric.reduce((sum, p) => sum + p, 0) / prices.length;
    const medianIndex = Math.floor(pricesNumeric.length / 2);
    const median = pricesNumeric[medianIndex];

    return {
      soldItems: prices.slice(0, 6),
      count: prices.length,
      lowestSold: Math.min(...pricesNumeric),
      highestSold: Math.max(...pricesNumeric),
      averageSold: Number(avg.toFixed(2)),
      medianSold: Number(median.toFixed(2)),
      lastSold: prices[0].soldDate,
      searchKeywordsUsed: keywords
    };
  }

  async _fetchDiscogsMarketData(releaseId) {
    const discogsService = window.discogsService ||
      document.createElement("discogs-service");

    const release = await discogsService.getReleaseDetails(releaseId);
    if (!release) return null;

    return {
      lowestPrice: release.lowest_price ? parseFloat(release.lowest_price) : null,
      numForSale: release.num_for_sale || 0,
      numWant: release.community?.want || 0,
      numHave: release.community?.have || 0,
      currency: "USD",
      lastUpdated: release.community?.last_updated || null
    };
  }

  // ─── Normalization ───────────────────────────────────────────

  _normalizeToIntelligenceObject({ releaseId, releaseMetadata, ebayData, discogsMarketData, sources, fetchDurationMs }) {
    const now = new Date().toISOString();

    const stats = {
      medianSoldLast90d: null,
      averageSoldLast90d: null,
      lowestSoldRecent: null,
      highestSoldRecent: null,
      numSalesRecent: 0,
      currentLowestListing: null,
      numListingsActive: 0,
      priceTrend: "unknown",
      confidence: "low"
    };

    if (ebayData) {
      stats.medianSoldLast90d = ebayData.medianSold;
      stats.averageSoldLast90d = ebayData.averageSold;
      stats.lowestSoldRecent = ebayData.lowestSold;
      stats.highestSoldRecent = ebayData.highestSold;
      stats.numSalesRecent = ebayData.count;
      stats.confidence = ebayData.count >= 10 ? "high"
        : ebayData.count >= 4 ? "medium"
        : "low";
    }

    if (discogsMarketData) {
      stats.currentLowestListing = discogsMarketData.lowestPrice;
      stats.numListingsActive = discogsMarketData.numForSale;

      if (stats.medianSoldLast90d === null && discogsMarketData.lowestPrice) {
        stats.medianSoldLast90d = discogsMarketData.lowestPrice;
        stats.confidence = "low";
      }
    }

    // Naive trend based on sold items order
    if (ebayData && ebayData.count >= 5) {
      const recent = ebayData.soldItems.slice(0, 3).map(i => i.price);
      const older = ebayData.soldItems.slice(-3).map(i => i.price);
      const recentAvg = recent.reduce((s, p) => s + p, 0) / recent.length;
      const olderAvg = older.reduce((s, p) => s + p, 0) / older.length;
      stats.priceTrend = recentAvg > olderAvg * 1.10 ? "rising"
        : recentAvg < olderAvg * 0.90 ? "falling"
        : "stable";
    }

    return {
      releaseId: Number(releaseId),
      timestamp: now,
      sources,
      currency: "USD",
      release: releaseMetadata ? {
        artist: releaseMetadata.artist,
        title: releaseMetadata.title,
        year: releaseMetadata.year,
        thumb: releaseMetadata.thumb,
        catno: releaseMetadata.catno,
        label: releaseMetadata.label,
        country: releaseMetadata.country,
        provenance: {
          notes: (releaseMetadata.notes || "").substring(0, 500) +
                 (releaseMetadata.notes && releaseMetadata.notes.length > 500 ? "…" : ""),
          matrixNumbers: releaseMetadata.matrixNumbers,
          printer: releaseMetadata.printer,
          credits: (releaseMetadata.credits || []).slice(0, 8),
          hasMisprint: releaseMetadata.hasMisprint
        }
      } : null,
      stats,
      comparables: ebayData?.soldItems || [],
      searchKeywordsUsed: ebayData?.searchKeywordsUsed || null,
      disclaimer: "Prices reflect recent sold values and current listings. Not financial advice.",
      meta: { fetchDurationMs }
    };
  }

  // ─── Matrix helpers ──────────────────────────────────────────

  /**
   * Normalize matrix strings for comparison.
   * @param {string} rawMatrix
   * @returns {string[]} normalized parts
   */
  _normalizeMatrix(rawMatrix) {
    if (!rawMatrix) return [];
    return rawMatrix
      .trim()
      .toUpperCase()
      .split(/[\n\r]+/)
      .map(s => s.trim()
        .replace(/[\s,\-]+/g, " ")
        .replace(/\s*(ETCHED|etched|hand-etched|stamped)/gi, "")
      )
      .filter(Boolean);
  }

  /**
   * Compare two sets of matrix arrays for pressing match.
   * Returns match score 0–1 + explanation.
   */
  _compareMatrix(userMatrixNorm, variantMatrixNorm) {
    if (!userMatrixNorm.length || !variantMatrixNorm.length) {
      return { score: 0, matchType: "no-data", explanation: "Missing matrix data" };
    }

    let matches = 0;
    let partial = 0;

    for (const u of userMatrixNorm) {
      for (const v of variantMatrixNorm) {
        if (u === v) matches++;
        else if (u.includes(v) || v.includes(u)) partial++;
      }
    }

    const total = Math.max(userMatrixNorm.length, variantMatrixNorm.length);
    const score = (matches * 1.0 + partial * 0.4) / total;

    let matchType = "none";
    let explanation = "No clear match";

    if (score >= 0.85) {
      matchType = "strong";
      explanation = `${matches} exact matches, strong pressing match`;
    } else if (score >= 0.5) {
      matchType = "partial";
      explanation = `${partial} partial overlaps — possible variant`;
    }

    return { score, matchType, explanation };
  }

  // ─── Cache stubs (future IndexedDB) ─────────────────────────

  async _persistToIndexedDB() { /* stub */ }
  async _loadFromIndexedDB() { /* stub */ }
}

customElements.define("pricing-intelligence-service", PricingIntelligenceService);

window.pricingIntelligenceService = document.createElement("pricing-intelligence-service");
