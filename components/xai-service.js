class XAIService {
  constructor() {
    this.apiKey = localStorage.getItem("xai_api_key");
    this.model = localStorage.getItem("xai_model") || "grok-4-1-fast-reasoning";
    this.baseUrl = "https://api.x.ai/v1";
  }

  isVisionModel(modelName) {
    if (!modelName) return false;
    const name = modelName.toLowerCase();
    // grok-4 family and legacy grok-2-vision models support image inputs
    return name.startsWith("grok-4") || name.includes("vision");
  }

  async parseError(response, fallbackMessage) {
    const rawBody = await response.text();
    if (!rawBody) {
      return fallbackMessage;
    }
    try {
      const parsed = JSON.parse(rawBody);
      return parsed.error?.message || parsed.message || fallbackMessage;
    } catch {
      return rawBody;
    }
  }

  updateApiKey(key) {
    this.apiKey = key;
  }

  updateModel(model) {
    this.model = model;
  }

  get isConfigured() {
    return !!this.apiKey;
  }

  async analyzeRecordImages(imageFiles) {
    if (!this.apiKey) {
      throw new Error(
        "xAI API key not configured. Please add it in Settings.",
      );
    }

    if (!this.isVisionModel(this.model)) {
      throw new Error(
        `Selected xAI model does not support image analysis. Please choose a vision-capable model (e.g. grok-4-1-fast-reasoning) in Settings.`,
      );
    }

    const base64Images = await Promise.all(
      imageFiles.map((file) => this.fileToBase64(file)),
    );

    const messages = [
      {
        role: "system",
        content: `You are a vinyl record identification expert specializing in pressing identification. Analyse record images and extract all visible information with special attention to first press vs reissue identification.

CRITICAL - Pressing Identification Rules:
1. DEADWAX/MATRIX ANALYSIS IS ESSENTIAL - Look for (capture Side A and Side B separately whenever possible):
   - Hand-etched vs machine-stamped matrix numbers (hand-etched often indicates early pressings)
   - Plant identifiers: "STERLING", "RL", "PORKY", "TML", "EMI", "CBS"
   - Mastering engineer initials or signatures
   - "A1", "B1" stampings indicate first stamper/cut
   - "-" or "/" separators in matrix numbers
   - Additional letters after main catalogue number (e.g., "-A", "/1")

2. LABEL ANALYSIS for pressing identification:
   - Label design variations (logo style, colour shades, rim text)
   - Address changes on labels (indicate different pressing periods)
   - "Made in..." country variations
   - Stereo/mono indicators and their placement
   - Copyright text differences

3. SLEEVE/COVER indicators:
   - Barcode presence = likely 1980s+ reissue (originals often lack barcodes)
   - Price codes (UK: K/T/S prefixes, US: $ prices)
   - Laminated vs non-laminated sleeves
   - "Digital Remaster" or "180g" stickers = modern reissue

4. YEAR vs ORIGINAL YEAR distinction:
   - Sleeve may show original release year
   - Label/barcode may reveal actual pressing year
   - Catalogue number patterns indicate era

Return ONLY a JSON object with this exact structure:
{
  "artist": "string or null",
  "title": "string or null",
  "catalogueNumber": "string or null",
  "label": "string or null",
  "barcode": "string or null",
  "matrixRunoutA": "string or null",
  "matrixRunoutB": "string or null",
  "labelCode": "string or null",
  "rightsSociety": "string or null",
  "pressingPlant": "string or null",
  "labelRimText": "string or null",
  "identifierStrings": "array of strings",
  "year": "number or null",
  "originalYear": "number or null",
  "reissueYear": "number or null",
  "country": "string or null",
  "format": "string or null",
  "genre": "string or null",
  "conditionEstimate": "string or null (NM/VG+/VG/G)",
  "pressingInfo": "string or null",
  "isFirstPress": "boolean or null",
  "pressingType": "string or null ('first_press', 'repress', 'reissue', 'unknown')",
  "pressingConfidence": "string ('high', 'medium', 'low')",
  "pressingEvidence": "array of strings",
  "confidence": "high|medium|low",
  "notes": "array of strings with additional observations"
}

Be precise. Only include info you can clearly read. For pressing identification, be conservative — only mark as first press if you see strong evidence.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyse these record photos. Identify the artist, title, catalogue number, label, year, and CRITICALLY: examine the deadwax/matrix area and labels closely to determine if this is a first pressing, repress, or reissue. Extract Matrix Side A and Side B runouts separately when visible, and report any plant codes or label variations.",
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
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 2000,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorMessage = await this.parseError(
          response,
          "xAI analysis failed",
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      const jsonMatch = content.match(
        /```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/,
      );
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[2] : content;

      try {
        return JSON.parse(jsonStr.trim());
      } catch (e) {
        console.error("Failed to parse xAI response:", content);
        throw new Error("Failed to parse record data");
      }
    } catch (error) {
      console.error("xAI Analysis Error:", error);
      throw error;
    }
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

window.xaiService = new XAIService();
