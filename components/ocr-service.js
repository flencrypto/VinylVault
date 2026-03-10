/**
 * OCRService v3.1 — web component
 *
 * Wraps the OpenAI vision API with an optional canvas-based crop modal
 * so users can isolate the region of interest (label, deadwax, sleeve)
 * before sending the image to AI.  The crop area supports 8-point resize
 * handles and free-draw drag.
 *
 * Public API (unchanged from v1 for backwards compat):
 *   analyzeRecordImages(imageFiles)   → Promise<Object>  (OpenAI result)
 *   updateApiKey(key)
 *   updateModel(model)
 *
 * New API:
 *   showCropModal(imageFile)          → Promise<Blob|File>  (cropped image)
 *   analyzeRecordImagesWithCrop(files)→ Promise<Object>  (crop then analyse)
 */
class OCRService extends HTMLElement {
  // ─── Class-level constants ───────────────────────────────────────────────────

  static MIN_CROP_W = 80;   // minimum crop width  in px
  static MIN_CROP_H = 60;   // minimum crop height in px

  // ─── Constructor ────────────────────────────────────────────────────────────

  constructor() {
    super();

    // Crop canvas state (v3.1)
    this.cropCanvas = null;
    this.cropCtx = null;
    this.isDragging = false;
    this.isResizing = false;
    this._activeDragHandle = null; // handle locked for current drag/resize gesture
    this.startX = this.startY = 0;
    this.cropRect = null;          // { x, y, w, h }
    this.handleSize = 12;          // handle square side in px
    this.originalImg = null;       // stored for redrawCanvas()

    // Dialog / internal state
    this.cropModal = null;
    this._cropResolve = null;
    this._cropReject = null;
    this._originalFile = null;
    this._hoverListenersAttached = false;
    this._cancelListenerAttached = false;

    // OpenAI config
    this.apiKey = localStorage.getItem("openai_api_key");
    this.model = localStorage.getItem("openai_model") || "gpt-4o";

    // Build the dialog (doesn't need the element to be connected to DOM)
    this._buildCropModal();
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  connectedCallback() {
    // Hidden service element — no visible rendering
    this.style.display = "none";

    // Add hover-behaviour listeners after the core mousedown/mouseup
    // listeners that were already set up in _buildCropModal()
    if (!this._hoverListenersAttached) {
      this.cropCanvas.addEventListener("mousemove", (e) =>
        this.handleMouseMove(e),
      );
      this.cropCanvas.addEventListener("mouseout", () => this.resetCursor());
      this._hoverListenersAttached = true;
    }

    // Ensure the dialog lives inside the document body
    if (this.cropModal && !document.body.contains(this.cropModal)) {
      document.body.appendChild(this.cropModal);
    }
  }

  // ─── Crop modal builder ─────────────────────────────────────────────────────

  _buildCropModal() {
    // <dialog> element
    this.cropModal = document.createElement("dialog");
    this.cropModal.style.cssText =
      "border:none;border-radius:14px;padding:0;background:transparent;" +
      "max-width:92vw;max-height:92vh;";

    // Wrapper card
    const card = document.createElement("div");
    card.style.cssText =
      "background:#1a1613;color:#f5ede2;padding:20px;border-radius:14px;" +
      "border:1px solid #2d2520;display:flex;flex-direction:column;gap:12px;";

    // Title row
    const titleRow = document.createElement("div");
    titleRow.style.cssText =
      "display:flex;justify-content:space-between;align-items:center;";
    const title = document.createElement("h3");
    title.textContent = "✂️ Crop Image for OCR";
    title.style.cssText = "margin:0;font-size:1.05em;color:#c8973f;";
    const hint = document.createElement("p");
    hint.textContent =
      "Draw a crop area, then drag the handles to refine. Click Crop & Analyse when ready.";
    hint.style.cssText = "font-size:0.78em;color:#94a3b8;margin:0;";
    titleRow.appendChild(title);
    card.appendChild(titleRow);
    card.appendChild(hint);

    // Canvas
    this.cropCanvas = document.createElement("canvas");
    this.cropCanvas.style.cssText =
      "cursor:crosshair;max-width:100%;display:block;border-radius:6px;";
    this.cropCtx = this.cropCanvas.getContext("2d");
    card.appendChild(this.cropCanvas);

    // Core drag/drop mouse events (hover events added in connectedCallback)
    this.cropCanvas.addEventListener("mousedown", (e) =>
      this.startCropDrag(e),
    );
    this.cropCanvas.addEventListener("mouseup", () => this.endCropDrag());

    // Touch equivalents
    this.cropCanvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        this.startCropDrag(e.touches[0]);
      },
      { passive: false },
    );
    this.cropCanvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        this.handleMouseMove(e.touches[0]);
      },
      { passive: false },
    );
    this.cropCanvas.addEventListener("touchend", () => this.endCropDrag());

    // Button row
    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;";

    const confirmBtn = document.createElement("button");
    confirmBtn.id = "ocrCropConfirmBtn";
    confirmBtn.textContent = "✂️ Crop & Analyse";
    confirmBtn.style.cssText =
      "flex:1;padding:10px 14px;background:#c8973f;border:none;border-radius:8px;" +
      "color:#0e0c0b;font-weight:700;cursor:pointer;font-size:0.9em;";
    confirmBtn.addEventListener("click", () => this._confirmCrop());

    const skipBtn = document.createElement("button");
    skipBtn.textContent = "Use Full Image";
    skipBtn.style.cssText =
      "padding:10px 14px;background:transparent;border:1px solid #475569;" +
      "border-radius:8px;color:#94a3b8;cursor:pointer;font-size:0.9em;";
    skipBtn.addEventListener("click", () => this._skipCrop());

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText =
      "padding:10px 14px;background:transparent;border:1px solid #ef4444;" +
      "border-radius:8px;color:#ef4444;cursor:pointer;font-size:0.9em;";
    cancelBtn.addEventListener("click", () => this._cancelCrop());

    btnRow.appendChild(confirmBtn);
    btnRow.appendChild(skipBtn);
    btnRow.appendChild(cancelBtn);
    card.appendChild(btnRow);

    this.cropModal.appendChild(card);
  }

  // ─── showCropModal ──────────────────────────────────────────────────────────

  /**
   * Display the crop dialog for a single image file.
   * Returns a Promise that resolves with a Blob (cropped) or the original
   * File (when user chooses "Use Full Image").
   *
   * @param {File|Blob} imageFile
   * @returns {Promise<Blob|File>}
   */
  showCropModal(imageFile) {
    return new Promise((resolve, reject) => {
      this._cropResolve = resolve;
      this._cropReject = reject;
      this._originalFile = imageFile;

      // Auto-connect to body so connectedCallback fires and dialog is available
      if (!this.isConnected) {
        document.body.appendChild(this);
      } else if (!document.body.contains(this.cropModal)) {
        document.body.appendChild(this.cropModal);
      }

      // Native dialog cancel (Escape key) → resolve with original image so
      // the caller's Promise never hangs.
      if (!this._cancelListenerAttached) {
        this.cropModal.addEventListener("cancel", (e) => {
          e.preventDefault(); // stop the dialog closing by itself; _skipCrop closes it
          this._skipCrop();
        });
        this._cancelListenerAttached = true;
      }

      const img = new Image();
      const url = URL.createObjectURL(imageFile);

      img.onload = () => {
        URL.revokeObjectURL(url);

        // Scale image to fit a comfortable canvas size
        const maxW = Math.min(window.innerWidth * 0.82, 820);
        const maxH = Math.min(window.innerHeight * 0.58, 580);
        const scale = Math.min(
          maxW / img.naturalWidth,
          maxH / img.naturalHeight,
          1,
        );
        const width = Math.round(img.naturalWidth * scale);
        const height = Math.round(img.naturalHeight * scale);

        this.cropCanvas.width = width;
        this.cropCanvas.height = height;
        this.cropCtx.drawImage(img, 0, 0, width, height);
        this.originalImg = img; // stored for redrawCanvas()
        this.cropRect = null;
        this._activeDragHandle = null; // separate from hover handle

        this.cropModal.showModal();
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image for cropping"));
      };

      img.src = url;
    });
  }

  // ─── Crop confirm / skip / cancel ───────────────────────────────────────────

  _confirmCrop() {
    if (!this.cropRect || this.cropRect.w < OCRService.MIN_CROP_W || this.cropRect.h < OCRService.MIN_CROP_H) {
      // No usable crop — fall back to full image
      this._skipCrop();
      return;
    }

    // Scale factors from display canvas → original image resolution
    const scaleX = this.originalImg
      ? this.originalImg.naturalWidth / this.cropCanvas.width
      : 1;
    const scaleY = this.originalImg
      ? this.originalImg.naturalHeight / this.cropCanvas.height
      : 1;

    // Source rectangle in full-resolution coordinates
    const srcX = this.cropRect.x * scaleX;
    const srcY = this.cropRect.y * scaleY;
    const srcW = this.cropRect.w * scaleX;
    const srcH = this.cropRect.h * scaleY;

    // Offscreen canvas must be sized at full resolution so the export is lossless
    const off = document.createElement("canvas");
    off.width = Math.round(srcW);
    off.height = Math.round(srcH);
    const ctx = off.getContext("2d");

    if (this.originalImg) {
      ctx.drawImage(
        this.originalImg,
        srcX, srcY, srcW, srcH,
        0, 0, off.width, off.height,
      );
    } else {
      // Fallback: draw from the display canvas (lower quality)
      ctx.drawImage(
        this.cropCanvas,
        this.cropRect.x,
        this.cropRect.y,
        this.cropRect.w,
        this.cropRect.h,
        0,
        0,
        off.width,
        off.height,
      );
    }

    off.toBlob(
      (blob) => {
        if (!blob) {
          // Encoding failed — fall back to the original file rather than
          // resolving with null, which would cause confusing downstream errors.
          this.cropModal.close();
          this.cropRect = null;
          if (this._cropResolve) this._cropResolve(this._originalFile);
          return;
        }
        this.cropModal.close();
        this.cropRect = null;
        if (this._cropResolve) this._cropResolve(blob);
      },
      "image/jpeg",
      0.92,
    );
  }

  _skipCrop() {
    this.cropModal.close();
    this.cropRect = null;
    if (this._cropResolve) this._cropResolve(this._originalFile);
  }

  _cancelCrop() {
    this.cropModal.close();
    this.cropRect = null;
    if (this._cropReject)
      this._cropReject(new Error("Crop cancelled by user"));
  }

  // ─── Mouse / touch event handlers ───────────────────────────────────────────

  handleMouseMove(e) {
    const rect = this.cropCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (this.isResizing) {
      // While resizing, keep using the handle chosen at mousedown
      this.resizeCropRect(mouseX, mouseY);
      this.redrawCanvas();
      return;
    }

    if (this.isDragging) {
      this._doDrag(mouseX, mouseY);
      return;
    }

    // No active operation — update cursor based on what's under the pointer
    if (!this.cropRect) return;
    const hoverHandle = this.getHandleAt(mouseX, mouseY);
    if (hoverHandle) {
      this.cropCanvas.style.cursor = this.getCursorForHandle(hoverHandle);
    } else if (this.isInsideCropRect(mouseX, mouseY)) {
      this.cropCanvas.style.cursor = "move";
    } else {
      this.cropCanvas.style.cursor = "crosshair";
    }
  }

  startCropDrag(e) {
    const rect = this.cropCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Lock in the active handle for the entire drag gesture
    this._activeDragHandle = this.getHandleAt(mouseX, mouseY);

    if (this._activeDragHandle) {
      // Start resize
      this.isResizing = true;
      this.isDragging = false;
    } else if (this.cropRect && this.isInsideCropRect(mouseX, mouseY)) {
      // Move entire rect
      this.isDragging = true;
      this.isResizing = false;
      this.startX = mouseX - this.cropRect.x;
      this.startY = mouseY - this.cropRect.y;
    } else {
      // Start new crop rect
      this.isDragging = true;
      this.isResizing = false;
      this._activeDragHandle = null;
      this.startX = mouseX;
      this.startY = mouseY;
      this.cropRect = { x: mouseX, y: mouseY, w: 0, h: 0 };
    }

    this.cropCanvas.style.cursor =
      this.getCursorForHandle(this._activeDragHandle) || "move";
  }

  endCropDrag() {
    this.isDragging = false;
    this.isResizing = false;
    this._activeDragHandle = null;
    this.cropCanvas.style.cursor = "crosshair";

    // Discard crop rects that are too small to be useful
    if (this.cropRect && (this.cropRect.w < OCRService.MIN_CROP_W || this.cropRect.h < OCRService.MIN_CROP_H)) {
      this.cropRect = null;
    }

    this.redrawCanvas();
  }

  resetCursor() {
    if (this.cropCanvas) this.cropCanvas.style.cursor = "crosshair";
  }

  // ─── Internal drag helper ───────────────────────────────────────────────────

  _doDrag(mouseX, mouseY) {
    if (!this.cropRect) return;

    if (this._activeDragHandle === null && this.startX !== undefined) {
      // Drawing a new rect
      const x = Math.min(mouseX, this.startX);
      const y = Math.min(mouseY, this.startY);
      const w = Math.abs(mouseX - this.startX);
      const h = Math.abs(mouseY - this.startY);
      this.cropRect = { x, y, w, h };
    } else {
      // Moving existing rect
      const newX = Math.max(
        0,
        Math.min(
          mouseX - this.startX,
          this.cropCanvas.width - this.cropRect.w,
        ),
      );
      const newY = Math.max(
        0,
        Math.min(
          mouseY - this.startY,
          this.cropCanvas.height - this.cropRect.h,
        ),
      );
      this.cropRect = { ...this.cropRect, x: newX, y: newY };
    }

    this.redrawCanvas();
  }

  // ─── Handle geometry ────────────────────────────────────────────────────────

  getHandleAt(x, y) {
    if (!this.cropRect) return null;
    const { x: rx, y: ry, w: rw, h: rh } = this.cropRect;
    const hs = this.handleSize;

    if (Math.abs(x - rx) < hs && Math.abs(y - ry) < hs) return "nw";
    if (Math.abs(x - (rx + rw)) < hs && Math.abs(y - ry) < hs) return "ne";
    if (Math.abs(x - rx) < hs && Math.abs(y - (ry + rh)) < hs) return "sw";
    if (Math.abs(x - (rx + rw)) < hs && Math.abs(y - (ry + rh)) < hs)
      return "se";
    if (Math.abs(y - ry) < hs && x > rx && x < rx + rw) return "n";
    if (Math.abs(y - (ry + rh)) < hs && x > rx && x < rx + rw) return "s";
    if (Math.abs(x - rx) < hs && y > ry && y < ry + rh) return "w";
    if (Math.abs(x - (rx + rw)) < hs && y > ry && y < ry + rh) return "e";

    return null;
  }

  getCursorForHandle(handle) {
    const map = {
      nw: "nwse-resize",
      ne: "nesw-resize",
      sw: "nesw-resize",
      se: "nwse-resize",
      n: "ns-resize",
      s: "ns-resize",
      w: "ew-resize",
      e: "ew-resize",
    };
    return map[handle] || "default";
  }

  isInsideCropRect(x, y) {
    if (!this.cropRect) return false;
    const { x: rx, y: ry, w: rw, h: rh } = this.cropRect;
    return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
  }

  // ─── Resize ─────────────────────────────────────────────────────────────────

  resizeCropRect(currentX, currentY) {
    if (!this.cropRect || !this._activeDragHandle) return;

    let { x, y, w, h } = this.cropRect;

    switch (this._activeDragHandle) {
      case "nw":
        w += x - currentX;
        x = currentX;
        h += y - currentY;
        y = currentY;
        break;
      case "ne":
        w = currentX - x;
        h += y - currentY;
        y = currentY;
        break;
      case "sw":
        w += x - currentX;
        x = currentX;
        h = currentY - y;
        break;
      case "se":
        w = currentX - x;
        h = currentY - y;
        break;
      case "n":
        h += y - currentY;
        y = currentY;
        break;
      case "s":
        h = currentY - y;
        break;
      case "w":
        w += x - currentX;
        x = currentX;
        break;
      case "e":
        w = currentX - x;
        break;
    }

    // 1. Normalise sign — if the user drags past the opposite edge, flip the
    //    anchor so the rect always has positive w/h before we clamp.
    if (w < 0) {
      x += w;
      w = -w;
    }
    if (h < 0) {
      y += h;
      h = -h;
    }

    // 2. Enforce minimum size after normalisation so the anchor is stable.
    if (w < OCRService.MIN_CROP_W) w = OCRService.MIN_CROP_W;
    if (h < OCRService.MIN_CROP_H) h = OCRService.MIN_CROP_H;

    // 3. Clamp to canvas bounds.
    x = Math.max(0, Math.min(x, this.cropCanvas.width - w));
    y = Math.max(0, Math.min(y, this.cropCanvas.height - h));

    this.cropRect = { x, y, w, h };
  }

  // ─── Canvas rendering ────────────────────────────────────────────────────────

  redrawCanvas() {
    if (!this.cropCtx) return;

    // Redraw the original image
    if (this.originalImg) {
      this.cropCtx.drawImage(
        this.originalImg,
        0,
        0,
        this.cropCanvas.width,
        this.cropCanvas.height,
      );
    }

    if (!this.cropRect) return;

    // Semi-transparent overlay outside crop area
    this.cropCtx.fillStyle = "rgba(0,0,0,0.5)";
    this.cropCtx.fillRect(
      0,
      0,
      this.cropCanvas.width,
      this.cropCanvas.height,
    );

    // Re-expose the crop area (clear the overlay there)
    this.cropCtx.clearRect(
      this.cropRect.x,
      this.cropRect.y,
      this.cropRect.w,
      this.cropRect.h,
    );
    if (this.originalImg) {
      this.cropCtx.drawImage(
        this.originalImg,
        this.cropRect.x *
          (this.originalImg.naturalWidth / this.cropCanvas.width),
        this.cropRect.y *
          (this.originalImg.naturalHeight / this.cropCanvas.height),
        this.cropRect.w *
          (this.originalImg.naturalWidth / this.cropCanvas.width),
        this.cropRect.h *
          (this.originalImg.naturalHeight / this.cropCanvas.height),
        this.cropRect.x,
        this.cropRect.y,
        this.cropRect.w,
        this.cropRect.h,
      );
    }

    // Crop border
    this.cropCtx.strokeStyle = "#c8973f";
    this.cropCtx.lineWidth = 3;
    this.cropCtx.strokeRect(
      this.cropRect.x,
      this.cropRect.y,
      this.cropRect.w,
      this.cropRect.h,
    );

    // Rule-of-thirds guide lines (subtle)
    this.cropCtx.strokeStyle = "rgba(200,151,63,0.3)";
    this.cropCtx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      const gx = this.cropRect.x + (this.cropRect.w * i) / 3;
      const gy = this.cropRect.y + (this.cropRect.h * i) / 3;
      this.cropCtx.beginPath();
      this.cropCtx.moveTo(gx, this.cropRect.y);
      this.cropCtx.lineTo(gx, this.cropRect.y + this.cropRect.h);
      this.cropCtx.stroke();
      this.cropCtx.beginPath();
      this.cropCtx.moveTo(this.cropRect.x, gy);
      this.cropCtx.lineTo(this.cropRect.x + this.cropRect.w, gy);
      this.cropCtx.stroke();
    }

    // 8-point resize handles
    const hs = this.handleSize;
    const { x: rx, y: ry, w: rw, h: rh } = this.cropRect;
    const handlePositions = [
      { handle: "nw", x: rx - hs / 2, y: ry - hs / 2 },
      { handle: "ne", x: rx + rw - hs / 2, y: ry - hs / 2 },
      { handle: "sw", x: rx - hs / 2, y: ry + rh - hs / 2 },
      { handle: "se", x: rx + rw - hs / 2, y: ry + rh - hs / 2 },
      { handle: "n", x: rx + rw / 2 - hs / 2, y: ry - hs / 2 },
      { handle: "s", x: rx + rw / 2 - hs / 2, y: ry + rh - hs / 2 },
      { handle: "w", x: rx - hs / 2, y: ry + rh / 2 - hs / 2 },
      { handle: "e", x: rx + rw - hs / 2, y: ry + rh / 2 - hs / 2 },
    ];

    handlePositions.forEach((p) => {
      // Filled gold square
      this.cropCtx.fillStyle = "#c8973f";
      this.cropCtx.fillRect(p.x, p.y, hs, hs);
      // Dark border for contrast
      this.cropCtx.strokeStyle = "#0e0c0b";
      this.cropCtx.lineWidth = 2;
      this.cropCtx.strokeRect(p.x, p.y, hs, hs);
    });
  }

  // ─── OpenAI API (existing, unchanged) ───────────────────────────────────────

  /**
   * Analyse one or more record images via OpenAI Vision.
   * Images are sent as-is (no crop).  Use analyzeRecordImagesWithCrop()
   * to show the crop UI first.
   *
   * @param {File[]|Blob[]} imageFiles
   * @returns {Promise<Object>}
   */
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

  /**
   * Show the crop modal for the first image in the array, then analyse all
   * images (cropped first + remaining originals) via OpenAI.
   *
   * @param {File[]} imageFiles
   * @returns {Promise<Object>}
   */
  async analyzeRecordImagesWithCrop(imageFiles) {
    if (!imageFiles || imageFiles.length === 0) {
      throw new Error("No images provided");
    }

    // Show crop modal for the primary (first) image
    const croppedFirst = await this.showCropModal(imageFiles[0]);
    const filesToSend = [croppedFirst, ...imageFiles.slice(1)];

    return this.analyzeRecordImages(filesToSend);
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

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

customElements.define("ocr-service", OCRService);
window.ocrService = new OCRService();
