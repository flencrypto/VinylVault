/**
 * TelegramNotifier — sends deal alerts via the Telegram Bot API.
 *
 * Credentials are read from localStorage keys:
 *   telegram_bot_token  – Bot token from @BotFather
 *   telegram_chat_id    – Chat ID from @userinfobot
 *
 * Exposes itself as window.telegramService (matching ebayService / discogsService pattern).
 */
class TelegramNotifier {
  constructor() {
    this.botToken = localStorage.getItem("telegram_bot_token") || "";
    this.chatId = localStorage.getItem("telegram_chat_id") || "";
    this.apiBase = "https://api.telegram.org";

    // In-memory caches (also persisted to localStorage)
    this._notifiedIds = new Set(
      JSON.parse(localStorage.getItem("deal_scanner_notified_ids") || "[]"),
    );
    this._releaseCooldowns = JSON.parse(
      localStorage.getItem("telegram_release_cooldowns") || "{}",
    );
  }

  // ---------------------------------------------------------------------------
  // Credential management
  // ---------------------------------------------------------------------------

  updateCredentials(botToken, chatId) {
    if (botToken !== undefined) {
      this.botToken = botToken;
      localStorage.setItem("telegram_bot_token", botToken);
    }
    if (chatId !== undefined) {
      this.chatId = chatId;
      localStorage.setItem("telegram_chat_id", chatId);
    }
  }

  get isConfigured() {
    return !!(this.botToken && this.chatId);
  }

  // ---------------------------------------------------------------------------
  // Tiered alert classification
  // ---------------------------------------------------------------------------

  /**
   * Classify a deal into a notification tier.
   *
   * @param {object} deal – must have numeric `roi` and `netProfit` fields
   * @returns {{ tier: string, emoji: string, label: string, silent: boolean } | null}
   */
  classifyDeal(deal) {
    const roi = parseFloat(deal.roi);
    const profit = parseFloat(deal.netProfit);

    if (roi >= 100 && profit >= 15) {
      return { tier: "instant_flip", emoji: "🔥", label: "INSTANT FLIP FOUND", silent: false };
    }
    if (roi >= 50 && profit >= 8) {
      return { tier: "hot_deal", emoji: "💎", label: "HOT DEAL FOUND", silent: false };
    }
    if (roi >= 30 && profit >= 3) {
      return { tier: "good_deal", emoji: "📊", label: "GOOD DEAL FOUND", silent: true };
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Deduplication helpers
  // ---------------------------------------------------------------------------

  _listingKey(deal) {
    return deal.ebayItemId || deal.discogsListingId || deal.itemId || null;
  }

  _isAlreadyNotified(deal) {
    const key = this._listingKey(deal);
    return key ? this._notifiedIds.has(String(key)) : false;
  }

  _markNotified(deal) {
    const key = this._listingKey(deal);
    if (key) {
      this._notifiedIds.add(String(key));
      localStorage.setItem(
        "deal_scanner_notified_ids",
        JSON.stringify([...this._notifiedIds]),
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Per-release cooldown (24 h unless price drops further)
  // ---------------------------------------------------------------------------

  _isOnCooldown(deal) {
    const releaseId = deal.releaseId || deal.discogsReleaseId;
    if (!releaseId) return false;
    const entry = this._releaseCooldowns[String(releaseId)];
    if (!entry) return false;
    const elapsed = Date.now() - entry.ts;
    if (elapsed >= 24 * 60 * 60 * 1000) {
      // Cooldown expired
      delete this._releaseCooldowns[String(releaseId)];
      this._saveReleaseCooldowns();
      return false;
    }
    // Allow re-alert if price dropped further
    if (deal.price && entry.price && deal.price < entry.price) {
      return false;
    }
    return true;
  }

  _recordReleaseCooldown(deal) {
    const releaseId = deal.releaseId || deal.discogsReleaseId;
    if (!releaseId) return;
    this._releaseCooldowns[String(releaseId)] = {
      ts: Date.now(),
      price: deal.price || deal.buyPrice || 0,
    };
    this._saveReleaseCooldowns();
  }

  _saveReleaseCooldowns() {
    localStorage.setItem(
      "telegram_release_cooldowns",
      JSON.stringify(this._releaseCooldowns),
    );
  }

  // ---------------------------------------------------------------------------
  // Message formatting
  // ---------------------------------------------------------------------------

  _formatMessage(deal, tier) {
    const artist = deal.artist || "Unknown Artist";
    const title = deal.title || "Unknown Title";
    const condition = deal.condition || "—";
    const buyPrice = parseFloat(deal.price || deal.buyPrice || 0).toFixed(2);
    const marketValue = parseFloat(deal.adjustedValue || deal.marketValue || 0).toFixed(2);
    const netProfit = parseFloat(deal.netProfit || 0).toFixed(2);
    const roi = parseFloat(deal.roi || 0).toFixed(0);
    const fees = parseFloat(deal.fees || deal.totalFees || 0).toFixed(2);
    const source = deal.source || (deal.ebayItemId ? "eBay" : "Discogs");
    const url = deal.url || deal.itemWebUrl || deal.listingUrl || deal.discogsUrl || "";

    const linkHtml = url
      ? `\n🔗 <a href="${url}">View Listing</a>`
      : "";

    const ctaLine =
      tier.tier !== "good_deal"
        ? "\n\n⚡ Auto-buy threshold met — check VinylVault Deals page"
        : "";

    return (
      `${tier.emoji} <b>${tier.label}</b>\n\n` +
      `🎵 <b>${artist}</b> — ${title}\n` +
      `📀 Condition: ${condition}\n` +
      `💰 Buy Now: £${buyPrice}\n` +
      `📊 Market Value: £${marketValue}\n` +
      `📈 Potential Profit: £${netProfit} (${roi}% ROI)\n` +
      `💸 Fees (est.): £${fees}\n\n` +
      `🏪 Source: ${source}` +
      linkHtml +
      ctaLine
    );
  }

  // ---------------------------------------------------------------------------
  // Core send method
  // ---------------------------------------------------------------------------

  async _sendMessage(text, silent = false) {
    if (!this.isConfigured) {
      throw new Error("Telegram not configured — set bot token and chat ID in Settings");
    }
    const url = `${this.apiBase}/bot${this.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: this.chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
        disable_notification: silent,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Telegram API error ${response.status}: ${err.description || response.statusText}`,
      );
    }
    return response.json();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Send a deal alert for the given deal object.
   * Applies deduplication and per-release cooldown before sending.
   *
   * @param {object} deal
   * @param {boolean} [force=false]  – skip dedup/cooldown checks
   * @returns {Promise<boolean>}     – true if message was sent
   */
  async sendDealAlert(deal, force = false) {
    if (!this.isConfigured) return false;

    const tier = this.classifyDeal(deal);
    if (!tier) return false;

    if (!force) {
      if (this._isAlreadyNotified(deal)) return false;
      if (this._isOnCooldown(deal)) return false;
    }

    const text = this._formatMessage(deal, tier);
    await this._sendMessage(text, tier.silent);

    this._markNotified(deal);
    this._recordReleaseCooldown(deal);
    return true;
  }

  /**
   * Send a test message to verify bot token and chat ID.
   *
   * @returns {Promise<object>}  – Telegram API response
   */
  async testConnection() {
    return this._sendMessage(
      "✅ <b>VinylVault connected!</b>\n\nTelegram alerts are working correctly. You will receive deal notifications here when undervalued vinyl is detected.",
      false,
    );
  }

  /**
   * Reload credentials from localStorage (useful after settings save).
   */
  reloadCredentials() {
    this.botToken = localStorage.getItem("telegram_bot_token") || "";
    this.chatId = localStorage.getItem("telegram_chat_id") || "";
  }
}

// Singleton — matches window.ebayService / window.discogsService pattern
window.telegramService = new TelegramNotifier();
