/**
 * TesseractOCRService — client-side OCR for vinyl record images.
 *
 * Uses Tesseract.js (lazy-loaded from CDN on first use) to extract
 * raw text from sleeve / label / deadwax photos, then applies
 * vinyl-specific heuristics to parse artist, title, label, catalogue
 * number, year, matrix runouts, and more.
 *
 * No API key required.  All processing happens in the browser.
 */

class TesseractOCRService {
  constructor() {
    /** @type {boolean} */
    this._scriptLoaded = false;
    /** @type {Promise<void>|null} */
    this._loadPromise = null;
  }

  // ─── CDN loader ──────────────────────────────────────────────────────────

  /**
   * Lazy-load the Tesseract.js UMD bundle from unpkg on first call.
   * Subsequent calls return immediately.
   * @returns {Promise<void>}
   */
  _ensureScript() {
    if (this._scriptLoaded || typeof Tesseract !== "undefined") {
      this._scriptLoaded = true;
      return Promise.resolve();
    }
    if (this._loadPromise) return this._loadPromise;

    this._loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/tesseract.js@5/dist/tesseract.min.js";
      script.crossOrigin = "anonymous";
      script.onload = () => {
        this._scriptLoaded = true;
        resolve();
      };
      script.onerror = () =>
        reject(new Error("Failed to load Tesseract.js from CDN"));
      document.head.appendChild(script);
    });

    return this._loadPromise;
  }

  // ─── Core OCR ────────────────────────────────────────────────────────────

  /**
   * Run Tesseract on a single image File / Blob.
   *
   * @param {File|Blob|string} image  File object or object-URL string
   * @param {function(number):void} [onProgress]  0-100 progress callback
   * @returns {Promise<string>} raw OCR text
   */
  async extractText(image, onProgress) {
    await this._ensureScript();

    const { data } = await Tesseract.recognize(image, "eng", {
      logger: (m) => {
        if (onProgress && m.status === "recognizing text") {
          onProgress(Math.min(99, Math.floor(m.progress * 100)));
        }
      },
    });

    return data.text || "";
  }

  /**
   * Run OCR on one or more image files and return a combined result.
   *
   * @param {File[]} imageFiles
   * @param {function(number):void} [onProgress]  overall 0-100 progress
   * @returns {Promise<Object>} parsed vinyl record data
   */
  async analyzeRecordImages(imageFiles, onProgress) {
    if (!imageFiles || imageFiles.length === 0) {
      throw new Error("No images provided");
    }

    const texts = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const perImageProgress = onProgress
        ? (p) => {
            const overall = Math.floor(
              ((i + p / 100) / imageFiles.length) * 100,
            );
            onProgress(Math.min(99, overall));
          }
        : null;

      const text = await this.extractText(imageFiles[i], perImageProgress);
      texts.push(text);
    }

    if (onProgress) onProgress(100);

    const combined = texts.join("\n\n---IMAGE BREAK---\n\n");
    const parsed = this.parseVinylText(combined);
    parsed.rawText = combined;
    return parsed;
  }

  // ─── Text parser ─────────────────────────────────────────────────────────

  /**
   * Parse raw OCR text and extract vinyl record metadata.
   *
   * Strategy (all case-insensitive unless noted):
   *  1. Year  — four-digit sequence in the vinyl era range
   *  2. Catalogue number — recognisable pattern (letter prefix + digits)
   *  3. Label — dictionary match against common labels
   *  4. Matrix / runout  — lines starting with common matrix patterns
   *  5. Artist / Title  — heuristic: long lines near the top or after known keywords
   *
   * @param {string} text  combined OCR text from all images
   * @returns {Object} parsed record data (same schema as enhanced-ocr-service)
   */
  parseVinylText(text) {
    const result = {
      artist: null,
      title: null,
      catalogueNumber: null,
      label: null,
      barcode: null,
      matrixRunoutA: null,
      matrixRunoutB: null,
      year: null,
      country: null,
      format: null,
      genre: null,
      conditionEstimate: null,
      pressingInfo: null,
      isFirstPress: null,
      pressingType: null,
      pressingConfidence: "low",
      pressingEvidence: [],
      identifierStrings: [],
      confidence: "low",
      notes: [],
    };

    if (!text || !text.trim()) return result;

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    // ── 1. Year ──────────────────────────────────────────────────────────
    const yearMatch = text.match(/\b(19[4-9]\d|20[0-2]\d)\b/);
    if (yearMatch) {
      result.year = parseInt(yearMatch[1], 10);
    }

    // ── 2. Catalogue number ──────────────────────────────────────────────
    // Patterns: "ILPS 9104", "2C 068-99111", "CBS 32401", "K 50035", "EPC 69169"
    const catPatterns = [
      // letter prefix, optional space, digits (4-8), optional suffix
      /\b([A-Z]{1,5}[\s\-]?\d{4,8}(?:[\s\-][A-Z])?)\b/g,
      // two-segment codes like "2C 068-99111"
      /\b(\d[A-Z]\s\d{3}-\d{4,6})\b/g,
    ];
    const catCandidates = [];
    for (const pat of catPatterns) {
      let m;
      const clone = new RegExp(pat.source, pat.flags);
      while ((m = clone.exec(text)) !== null) {
        catCandidates.push(m[1].replace(/\s+/g, " ").trim());
      }
    }
    if (catCandidates.length > 0) {
      // Prefer the first candidate that isn't all digits (likely a barcode)
      result.catalogueNumber =
        catCandidates.find((c) => /[A-Z]/.test(c)) || catCandidates[0];
      result.identifierStrings.push(...catCandidates);
    }

    // ── 3. Barcode ───────────────────────────────────────────────────────
    const barcodeMatch = text.match(/\b(\d{8,14})\b/);
    if (barcodeMatch) {
      result.barcode = barcodeMatch[1];
      if (!result.identifierStrings.includes(result.barcode)) {
        result.identifierStrings.push(result.barcode);
      }
    }

    // ── 4. Label ─────────────────────────────────────────────────────────
    result.label = this._detectLabel(text);

    // ── 5. Matrix / runout ───────────────────────────────────────────────
    const matrixLines = this._extractMatrixLines(lines);
    if (matrixLines.length > 0) {
      result.matrixRunoutA = matrixLines[0] || null;
      result.matrixRunoutB = matrixLines[1] || null;
      result.pressingInfo = matrixLines.join(" / ");
      result.identifierStrings.push(...matrixLines);
      // Pressing heuristics
      this._applyPressingHeuristics(result, matrixLines);
    }

    // ── 6. Format ────────────────────────────────────────────────────────
    if (/\b(LP|Long\s*Play)\b/i.test(text)) result.format = "LP";
    else if (/\b(EP|Extended\s*Play)\b/i.test(text)) result.format = "EP";
    else if (/\b45\s*RPM\b/i.test(text)) result.format = '7"';
    else if (/\b33\s*(?:1\/3)?\s*RPM\b/i.test(text)) result.format = "LP";

    // ── 7. Country ───────────────────────────────────────────────────────
    const countryMatch = text.match(
      /Made\s+in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    );
    if (countryMatch) result.country = countryMatch[1];
    else if (/\bUK\b|\bU\.K\.\b|United\s+Kingdom/i.test(text))
      result.country = "UK";
    else if (/\bUSA?\b|\bU\.S\.A?\.\b|United\s+States/i.test(text))
      result.country = "US";
    else if (/\bGermany\b|\bDeutschland\b/i.test(text))
      result.country = "Germany";
    else if (/\bFrance\b|\bFrançais\b/i.test(text)) result.country = "France";
    else if (/\bItaly\b|\bItalia\b/i.test(text)) result.country = "Italy";
    else if (/\bJapan\b|\bJapanese\b/i.test(text)) result.country = "Japan";

    // ── 8. Artist / Title heuristics ────────────────────────────────────
    this._inferArtistTitle(result, lines, text);

    // ── 9. Confidence ────────────────────────────────────────────────────
    let hits = 0;
    if (result.artist) hits++;
    if (result.title) hits++;
    if (result.catalogueNumber) hits++;
    if (result.label) hits++;
    if (result.year) hits++;
    if (hits >= 4) result.confidence = "high";
    else if (hits >= 2) result.confidence = "medium";
    else result.confidence = "low";

    // Deduplicate identifierStrings
    result.identifierStrings = [...new Set(result.identifierStrings)];

    return result;
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  /**
   * Detect record label name via dictionary matching.
   * @param {string} text
   * @returns {string|null}
   */
  _detectLabel(text) {
    const labels = [
      // Major / historic labels — ordered longest-match first where ambiguous
      "Blue Note",
      "Impulse",
      "Atlantic",
      "Prestige",
      "Riverside",
      "Contemporary",
      "Pacific Jazz",
      "Fantasy",
      "Verve",
      "ECM",
      "Milestone",
      "Savoy",
      "Bethlehem",
      // Rock / Pop
      "Island",
      "Harvest",
      "Parlophone",
      "Apple",
      "Columbia",
      "Capitol",
      "Elektra",
      "Reprise",
      "Warner Bros",
      "Asylum",
      "Geffen",
      "Chrysalis",
      "Virgin",
      "Stiff",
      "Rough Trade",
      "Factory",
      "Creation",
      "4AD",
      "Mute",
      "Sub Pop",
      "Matador",
      "Domino",
      "XL",
      // European
      "Vertigo",
      "Polydor",
      "Decca",
      "Deutsche Grammophon",
      "Philips",
      "Mercury",
      "RCA",
      "CBS",
      "EMI",
      "HMV",
      "Pye",
      "Fontana",
      "Immediate",
      "Bronze",
      "Bronze Records",
      "Charisma",
      "Transatlantic",
      // Electronic / Dance
      "Warp",
      "Ninja Tune",
      "Hospital",
      "Soma",
      "Planet E",
      "R&S",
      "Tresor",
      "Haçienda",
      // Classics
      "Deutsche Grammophon",
      "Decca Classics",
      "Archiv",
    ];

    const upperText = text.toUpperCase();
    for (const label of labels) {
      if (upperText.includes(label.toUpperCase())) return label;
    }
    return null;
  }

  /**
   * Extract matrix / runout lines from OCR text.
   * Matrix lines often appear near deadwax etching patterns.
   * @param {string[]} lines
   * @returns {string[]}
   */
  _extractMatrixLines(lines) {
    const matrixPattern =
      /^[A-Z0-9]{2,6}[\s\-][A-Z0-9]{2,8}(?:[\s\-][A-Z0-9]{1,4})*$/;
    const results = [];

    for (const line of lines) {
      if (matrixPattern.test(line) && line.length >= 5 && line.length <= 30) {
        results.push(line);
        if (results.length >= 4) break; // cap at 4 runout lines
      }
      // Also catch lines that include known plant codes
      if (
        /\b(STERLING|PORKY|PECKO|TML|RL|EMI|CBS|HAECO|MCA|RE|PR|WEA)\b/.test(
          line,
        )
      ) {
        if (!results.includes(line)) results.push(line);
      }
    }

    return results;
  }

  /**
   * Apply pressing identification heuristics based on matrix lines.
   * @param {Object} result - mutable result object
   * @param {string[]} matrixLines
   */
  _applyPressingHeuristics(result, matrixLines) {
    const allMatrix = matrixLines.join(" ").toUpperCase();
    const evidence = [];

    if (/\bA1\b|\bB1\b/.test(allMatrix)) {
      evidence.push("A1/B1 stamper identifier found — typical of first press");
      result.isFirstPress = true;
      result.pressingType = "first_press";
      result.pressingConfidence = "medium";
    }

    if (/\bSTERLING\b/.test(allMatrix)) {
      evidence.push("STERLING (Bob Ludwig) plant code — original US pressing");
      result.pressingConfidence = "high";
    }
    if (/\bPORKY\b/.test(allMatrix)) {
      evidence.push("PORKY (George Peckham) hand-etch — early UK pressing");
      result.pressingConfidence = "high";
    }
    if (/\bRL\b/.test(allMatrix)) {
      evidence.push("RL (Robert Ludwig) mastering initials");
      result.pressingConfidence = "medium";
    }

    if (!result.isFirstPress && evidence.length === 0) {
      result.pressingType = "unknown";
    }

    result.pressingEvidence = evidence;
  }

  /**
   * Heuristically infer artist and title from OCR text.
   * Vinyl sleeves typically put artist and title as the largest / topmost text.
   * @param {Object} result - mutable result object
   * @param {string[]} lines
   * @param {string} text
   */
  _inferArtistTitle(result, lines, text) {
    // Look for explicit "Artist:" / "By:" prefix patterns
    const artistKeywordMatch = text.match(
      /(?:^|\n)\s*(?:Artist|Performer|By)[:\s]+([^\n]{2,60})/im,
    );
    if (artistKeywordMatch) {
      result.artist = artistKeywordMatch[1].trim();
    }

    const titleKeywordMatch = text.match(
      /(?:^|\n)\s*(?:Title|Album|Record)[:\s]+([^\n]{2,80})/im,
    );
    if (titleKeywordMatch) {
      result.title = titleKeywordMatch[1].trim();
    }

    if (result.artist && result.title) return;

    // Fallback: use the first two substantial lines (>= 3 chars, no purely
    // numeric / symbol content) as artist and title candidates.
    const substantial = lines.filter(
      (l) =>
        l.length >= 3 &&
        l.length <= 80 &&
        /[A-Za-z]{2}/.test(l) && // contains at least two letters
        !/^[\d\s\-\/\\|]+$/.test(l) && // not purely digits/punctuation
        !/^(side|track|stereo|mono|℗|©|\(c\))/i.test(l),
    );

    if (!result.artist && substantial.length >= 1) {
      result.artist = substantial[0];
    }
    if (!result.title && substantial.length >= 2) {
      result.title = substantial[1];
    }
  }
}

window.tesseractOcrService = new TesseractOCRService();
