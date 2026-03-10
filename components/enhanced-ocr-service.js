class EnhancedOCRService {
  constructor() {
    this.apiKey = localStorage.getItem("openai_api_key");
    this.model = localStorage.getItem("openai_model") || "gpt-4o";
  }

  async analyzeRecordImages(imageFiles) {
    if (!this.apiKey) {
      throw new Error(
        "OpenAI API key not configured. Please add it in Settings.",
      );
    }

    const base64Images = await Promise.all(
      imageFiles.map((file) => this.fileToBase64(file)),
    );

    const messages = [
      {
        role: "system",
        content: `You are a vinyl record identification expert with deep knowledge of pressing identification, label history, and matrix/runout groove systems. Analyze record images thoroughly and extract ALL visible text and identifiers.

CRITICAL - Pressing Identification Rules:

1. DEADWAX/MATRIX ANALYSIS IS ESSENTIAL:
   - Capture Side A and Side B matrix strings separately
   - If only one label/side is shown, determine which side (look for "Side 1"/"Side 2", "A"/"B", or the side number printed on the label) and store in the correct field (matrixRunoutA for Side 1/A, matrixRunoutB for Side 2/B)
   - UK EMI/Parlophone matrix system: XEX, YEX, ZEX, AAX, BBX prefixes. Stamper suffixes are critical — "1N" = first stamper/earliest pressing; "2N", "3N", etc. = later stampers (higher number = further from first press). Only "-1N" or "-2N" stampers qualify as first or second pressing.
   - "(XEX.504)" printed ON the label text is a LABEL CODE identifying the matrix side — store this in "labelCode". The actual deadwax matrix etched/stamped in the runout groove (e.g. "XEX 504-3N") is the true matrix — store in matrixRunoutA or matrixRunoutB.
   - US plant identifiers in deadwax: "STERLING", "RL" (Robert Ludwig), "PORKY" / "PORKY PRIME CUT" (George Peckham), "TML", "DR", "MR", "W", "PR"
   - Mastering engineer initials or hand-etched signatures
   - "A1"/"B1" cut suffix = first stamper (first pressing); A2/B2 = second stamper, etc.

2. LABEL ANALYSIS for pressing identification:
   - Read ALL text on the label including fine print, rim text, and addresses
   - UK catalogue number prefixes: PMC = Parlophone Mono Catalogue, PCS = Parlophone Columbia Stereo, R = HMV (mono), CSD = HMV (stereo), SCX/SX = Columbia, MONO/STEREO explicit markings
   - Label design eras: e.g. Parlophone black/yellow logo (1960s UK original) vs later designs
   - Address changes on labels indicate different pressing periods
   - "Made in Gt. Britain" / "Made in England" / "Made in U.K." = UK pressing
   - "SOLD IN U.K. SUBJECT TO RESALE PRICE CONDITIONS" = UK original pressing
   - "RECORDING FIRST PUBLISHED [YEAR]" printed on label = original release year
   - Rights societies: NCB, BIEM, MCPS, ASCAP, BMI, SOCAN
   - Stereo/mono indicators and their placement

3. SLEEVE/COVER indicators:
   - Barcode presence = likely 1980s+ reissue (originals often lack barcodes)
   - Price codes (UK: K/T/S prefixes, US: $ prices)
   - Laminated vs non-laminated sleeves
   - "Digital Remaster", "180g", "Half-Speed Mastered" stickers = modern reissue

4. TRACKLIST EXTRACTION:
   - If track titles are visible on the label or sleeve, extract them as an array
   - Include track numbers and side indicators if visible

5. YEAR vs ORIGINAL YEAR distinction:
   - "RECORDING FIRST PUBLISHED [YEAR]" on label = original release year
   - Sleeve may show original release year; label/barcode may reveal actual pressing year
   - Catalog number patterns indicate era

Return ONLY a valid JSON object with this exact structure:
{
  "artist": "string or null",
  "title": "string or null",
  "catalogueNumber": "string or null",
  "label": "string or null",
  "barcode": "string or null",
  "matrixRunoutA": "string or null (Side A/1 deadwax matrix exactly as etched)",
  "matrixRunoutB": "string or null (Side B/2 deadwax matrix exactly as etched)",
  "labelCode": "string or null (e.g. label-printed codes like XEX.504, distinct from deadwax)",
  "rightsSociety": "string or null",
  "pressingPlant": "string or null",
  "labelRimText": "string or null (full text on the label rim/edge)",
  "identifierStrings": ["array", "of", "all", "raw", "identifiers", "visible"],
  "tracklist": ["array of track titles in order, or empty array if none visible"],
  "year": 1964,
  "originalYear": 1964,
  "reissueYear": null,
  "country": "string or null",
  "format": "string or null (LP, 12\\", 7\\", EP, etc.)",
  "genre": "string or null",
  "conditionEstimate": "string or null (NM/VG+/VG/G+/G/F)",
  "pressingInfo": "string or null (human-readable summary of all matrix/runout details)",
  "isFirstPress": null,
  "pressingType": "string or null ('first_press', 'early_press', 'repress', 'reissue', 'unknown')",
  "pressingConfidence": "string ('high', 'medium', 'low')",
  "pressingEvidence": ["array of specific visual evidence strings"],
  "confidence": "high|medium|low",
  "notes": ["array of additional observations"]
}

Be thorough and precise. Read every visible character. For pressing identification, correctly interpret stamper suffixes: 1N/A1/B1 = first press; higher numbers = later. State the exact matrix string found.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze these record photos. Read ALL visible text carefully including fine print, rim text, and any etching in the deadwax/runout area. Identify the artist, title, catalogue number, label, year, and tracklist. CRITICALLY: determine which side(s) are shown, extract the exact deadwax/matrix strings for each side separately, interpret the stamper suffix to assess pressing generation, and classify the pressing type. Report every identifier string you can read.",
          },
          ...base64Images.map((base64) => ({
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
              detail: "high",
            },
          })),
        ],
      },
    ];

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: messages,
            max_tokens: 3000,
            temperature: 0.2,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "OCR analysis failed");
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(
        /```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/,
      );
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[2] : content;

      try {
        return JSON.parse(jsonStr.trim());
      } catch (e) {
        console.error("Failed to parse OCR response:", content);
        throw new Error("Failed to parse record data");
      }
    } catch (error) {
      console.error("OCR Analysis Error:", error);
      throw error;
    }
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Return clean base64 without data URL prefix for API calls
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  updateApiKey(key) {
    this.apiKey = key;
  }

  updateModel(model) {
    this.model = model;
  }
}

window.enhancedOcrService = new EnhancedOCRService();
