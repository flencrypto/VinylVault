// Collection Service - Shared functionality for collection management
class CollectionService {
  constructor() {
    this.storageKey = "vinyl_collection";
  }

  // Get all records from collection
  getCollection() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : [];
  }

  // Save entire collection
  saveCollection(collection) {
    localStorage.setItem(this.storageKey, JSON.stringify(collection));
  }

  // Add or update a record
  saveRecord(record) {
    const collection = this.getCollection();

    // Check if record exists
    const existingIndex = collection.findIndex(
      (r) =>
        r.artist === record.artist &&
        r.title === record.title &&
        r.catalogueNumber === record.catalogueNumber,
    );

    if (existingIndex >= 0) {
      // Update existing
      collection[existingIndex] = {
        ...collection[existingIndex],
        ...record,
        lastUpdated: new Date().toISOString(),
      };
    } else {
      // Add new
      record.dateAdded = record.dateAdded || new Date().toISOString();
      collection.push(record);
    }

    this.saveCollection(collection);
    return existingIndex >= 0 ? "updated" : "added";
  }

  // Scan dead wax/matrix from photo
  async scanDeadWax(imageFile) {
    try {
      // Use Tesseract OCR for matrix extraction
      const tesseractService = window.TesseractService;
      if (!tesseractService) {
        throw new Error('Tesseract OCR not available');
      }

      // Extract text from dead wax area
      const result = await tesseractService.recognize(imageFile, {
        tessedit_pageseg_mode: '6', // Sparse text mode
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-()/\\ ', // Matrix characters
      });

      // Clean and parse matrix data
      const matrixData = this._parseMatrixData(result.data.text);
      
      return {
        matrix: matrixData.matrixLines,
        confidence: matrixData.confidence,
        rawText: result.data.text,
        pressingMatchScore: matrixData.pressingMatchScore
      };
    } catch (error) {
      console.error('Dead wax scan failed:', error);
      throw error;
    }
  }

  // Parse matrix data from OCR text
  _parseMatrixData(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const matrixLines = [];
    let confidence = 0;
    let pressingMatchScore = 0;

    // Matrix pattern matching
    const matrixPatterns = [
      /[A-Z]{3}\s*\d+/g, // XEX 504, PCS 3079
      /[A-Z]\d+[A-Z]?/g, // A1, B2, A1N
      /\d+[A-Z]\d+/g, // 1N1, 2N2
      /[A-Z]{2,3}\s*\d+\s*[A-Z]?\d*/g, // EMI 1234 A1
    ];

    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.length > 2) { // Minimum length for matrix
        matrixLines.push(cleanLine);
        
        // Calculate confidence based on pattern matching
        let lineConfidence = 0.3; // Base confidence
        
        for (const pattern of matrixPatterns) {
          if (pattern.test(cleanLine)) {
            lineConfidence += 0.2;
          }
        }
        
        // Increase confidence for known matrix indicators
        if (cleanLine.includes('Side') || cleanLine.includes('Matrix') || 
            cleanLine.includes('Runout') || cleanLine.includes('Stamper')) {
          lineConfidence += 0.3;
        }
        
        confidence = Math.max(confidence, Math.min(lineConfidence, 1));
      }
    }

    // Calculate pressing match score
    pressingMatchScore = this._calculatePressingMatchScore(matrixLines);

    return {
      matrixLines: matrixLines.slice(0, 6), // Limit to 6 lines
      confidence: Math.round(confidence * 100) / 100,
      pressingMatchScore: Math.round(pressingMatchScore * 100) / 100
    };
  }

  // Calculate pressing match score based on matrix patterns
  _calculatePressingMatchScore(matrixLines) {
    let score = 0;
    
    for (const line of matrixLines) {
      // UK EMI/Parlophone patterns
      if (line.match(/XEX|YEX|ZEX|AAX|BBX/)) {
        score += 0.3;
        
        // Stamper suffix scoring
        if (line.match(/1N|A1|B1/)) {
          score += 0.4; // First press indicators
        } else if (line.match(/2N|A2|B2/)) {
          score += 0.2; // Early press
        }
      }
      
      // US plant identifiers
      if (line.match(/STERLING|RL|PORKY|TML|DR|MR|W|PR/)) {
        score += 0.2;
      }
      
      // General matrix patterns
      if (line.match(/\d+[A-Z]\d+/)) {
        score += 0.1;
      }
    }
    
    return Math.min(score, 1);
  }

  // Delete a record
  deleteRecord(index) {
    const collection = this.getCollection();
    collection.splice(index, 1);
    this.saveCollection(collection);
  }

  // Get portfolio stats
  getStats() {
    const collection = this.getCollection();
    const totalRecords = collection.length;
    let totalInvested = 0;
    let totalValue = 0;
    for (const r of collection) {
      totalInvested += parseFloat(r.purchasePrice) || 0;
      totalValue += parseFloat(r.estimatedValue) || 0;
    }
    const totalProfit = totalValue - totalInvested;
    const roi =
      totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(1) : 0;

    return {
      totalRecords,
      totalInvested,
      totalValue,
      totalProfit,
      roi,
    };
  }

  // Find record by artist/title/cat#
  findRecord(artist, title, catalogueNumber) {
    const collection = this.getCollection();
    return collection.find(
      (r) =>
        r.artist === artist &&
        r.title === title &&
        r.catalogueNumber === catalogueNumber,
    );
  }

  // Check if record exists
  recordExists(artist, title, catalogueNumber) {
    return !!this.findRecord(artist, title, catalogueNumber);
  }

  // Scan dead wax/matrix from image
  async scanDeadWax(imageFile, recordIndex = null) {
    try {
      // Use enhanced OCR service for matrix extraction
      const ocrService = window.enhancedOCRService || {
        extractMatrixFromImage: async (file) => {
          // Fallback implementation
          return {
            matrix: ["Matrix extraction not available"],
            confidence: 0.5,
          };
        },
      };

      const result = await ocrService.extractMatrixFromImage(imageFile);

      if (recordIndex !== null) {
        // Update existing record
        const collection = this.getCollection();
        if (collection[recordIndex]) {
          collection[recordIndex].matrix = result.matrix;
          collection[recordIndex].matrixConfidence = result.confidence;
          collection[recordIndex].lastUpdated = new Date().toISOString();
          this.saveCollection(collection);
        }
      }

      return result;
    } catch (error) {
      console.error("Error scanning dead wax:", error);
      throw error;
    }
  }

  // Calculate pressing match score based on matrix data
  calculatePressingMatchScore(matrix, matrixConfidence) {
    if (!matrix || matrix.length === 0) return 0;

    // Base score on confidence and matrix complexity
    let score = matrixConfidence * 0.7; // 70% weight to OCR confidence

    // Bonus for having multiple matrix lines
    if (matrix.length > 1) {
      score += 0.2; // 20% bonus for multiple identifiers
    }

    // Bonus for complex matrix patterns
    const complexPatterns = [
      "XEX",
      "YEX",
      "ZEX",
      "AAX",
      "BBX",
      "STERLING",
      "RL",
      "PORKY",
    ];
    const matrixText = matrix.join(" ").toUpperCase();
    if (complexPatterns.some((pattern) => matrixText.includes(pattern))) {
      score += 0.1; // 10% bonus for known pressing identifiers
    }

    return Math.min(score, 1.0);
  }
}

window.collectionService = new CollectionService();
