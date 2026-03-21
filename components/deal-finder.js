class DealFinder extends HTMLElement {
  constructor() {
    super();
    this.deals = [];
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .deal-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }
        .deal-card:hover {
          border-color: #ec4899;
          transform: translateY(-2px);
        }
        .deal-card.hot {
          border-color: #22c55e;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, #1e293b 100%);
        }
        .deal-card.skip {
          opacity: 0.7;
          border-color: #334155;
        }
        .profit-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
        }
        .profit-badge.good {
          background: #22c55e20;
          color: #22c55e;
        }
        .profit-badge.medium {
          background: #f59e0b20;
          color: #f59e0b;
        }
        .profit-badge.bad {
          background: #ef444420;
          color: #ef4444;
        }
      </style>
      <slot></slot>
    `;
  }

  calculateMetrics(
    buyPrice,
    estimatedValue,
    condition = "VG",
    goal = "balanced",
  ) {
    // Condition multipliers for quick estimation
    const conditionMultipliers = {
      M: 1.5,
      NM: 1.3,
      "VG+": 1.0,
      VG: 0.7,
      "G+": 0.5,
      G: 0.35,
      F: 0.2,
      P: 0.1,
    };

    const condMult = conditionMultipliers[condition] || 0.7;
    const adjustedValue = estimatedValue * condMult;

    // Fee calculation (eBay UK approx)
    const ebayFees = adjustedValue * 0.13;
    const paypalFees = adjustedValue * 0.029 + 0.3;
    const shipping = 4.5;
    const packing = 1.5;
    const totalFees = ebayFees + paypalFees + shipping + packing;

    // Minimum profit threshold
    const minProfit = Math.max(buyPrice * 0.3, 3); // 30% or £3 minimum

    // Suggested listing price based on goal
    let listingPrice;
    switch (goal) {
      case "quick":
        listingPrice = adjustedValue * 0.85;
        break;
      case "max":
        listingPrice = adjustedValue * 1.1;
        break;
      default:
        listingPrice = adjustedValue;
    }

    const netProfit = listingPrice - buyPrice - totalFees;
    const roi = buyPrice > 0 ? ((netProfit / buyPrice) * 100).toFixed(1) : 0;
    const margin = ((netProfit / listingPrice) * 100).toFixed(1);

    // Deal score (0-100)
    let score = 0;
    if (netProfit >= minProfit) score += 40;
    if (roi >= 30) score += 30;
    if (roi >= 50) score += 20;
    if (adjustedValue > buyPrice * 2) score += 10;

    return {
      buyPrice,
      estimatedValue,
      adjustedValue,
      listingPrice: Math.round(listingPrice),
      totalFees: Math.round(totalFees * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      roi,
      margin,
      score,
      isViable: netProfit >= minProfit && roi >= 20,
      isHot: netProfit >= minProfit * 1.5 && roi >= 40,
      recommendation:
        netProfit < 0
          ? "PASS"
          : roi >= 50
            ? "QUICK FLIP"
            : roi >= 30
              ? "GOOD DEAL"
              : "MARGINAL",
    };
  }

  analyzeDeal(artist, title, buyPrice, listedCondition, discogsData = null, scraperData = null) {
    // If we have scraper data, use it for better estimation
    let estimatedValue = 15; // Default fallback

    if (scraperData && scraperData.marketValue) {
      estimatedValue = scraperData.marketValue;
    } else if (discogsData) {
      if (discogsData.lowest_price) {
        estimatedValue = discogsData.lowest_price;
      } else if (discogsData.median) {
        estimatedValue = discogsData.median;
      }
    }

    const metrics = this.calculateMetrics(
      buyPrice,
      estimatedValue,
      listedCondition,
    );

    return {
      artist,
      title,
      ...metrics,
      discogsUrl: discogsData?.uri || null,
      releaseId: discogsData?.id || null,
      scraperData: scraperData || null,
      timestamp: Date.now(),
    };
  }

  formatCurrency(amount) {
    return "£" + parseFloat(amount).toFixed(2);
  }

  async scrapeMarketplaceDeals(artist, title, marketplace = "ebay", maxResults = 20) {
    if (!window.webScrapingService || !window.webScrapingService.isAvailable) {
      throw new Error("Web scraping service is not available");
    }

    try {
      let listings = [];
      const query = `${artist} ${title}`;

      switch (marketplace.toLowerCase()) {
        case "ebay":
          listings = await window.webScrapingService.scrapeEbayVinyl(query, maxResults);
          break;
        case "discogs":
          listings = await window.webScrapingService.scrapeDiscogsVinyl(query, maxResults);
          break;
        case "amazon":
          listings = await window.webScrapingService.scrapeAmazonVinyl(query, maxResults);
          break;
        default:
          throw new Error(`Unsupported marketplace: ${marketplace}`);
      }

      // Analyze each listing
      const deals = [];
      for (const listing of listings) {
        const deal = this.analyzeDeal(
          artist,
          title,
          listing.price,
          listing.condition
        );
        
        // Add marketplace-specific data
        deals.push({
          ...deal,
          marketplace: listing.marketplace,
          url: listing.url,
          seller: listing.seller,
          imageUrl: listing.imageUrl,
          shipping: listing.shipping || 0,
          scraperData: listing.rawData
        });
      }

      return deals.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error(`Error scraping ${marketplace}:`, error);
      throw error;
    }
  }

  async scrapeAllMarketplaces(artist, title, maxResultsPerMarket = 10) {
    const marketplaces = ["ebay", "discogs", "amazon"];
    const allDeals = [];

    for (const marketplace of marketplaces) {
      try {
        const deals = await this.scrapeMarketplaceDeals(artist, title, marketplace, maxResultsPerMarket);
        allDeals.push(...deals);
      } catch (error) {
        console.warn(`Failed to scrape ${marketplace}:`, error);
        // Continue with other marketplaces
      }
    }

    return allDeals.sort((a, b) => b.score - a.score);
  }
}

customElements.define("deal-finder", DealFinder);
