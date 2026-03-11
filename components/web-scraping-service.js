/**
 * WebScrapingService — Integrates Python web scraping agent with VinylVault deal finder
 * 
 * This service bridges the JavaScript frontend with the Python web scraping agent
 * to enable advanced scraping capabilities for vinyl marketplace data.
 */

class WebScrapingService {
    constructor() {
        this.isAvailable = false;
        this.scrapingAgent = null;
        this.config = this._loadConfig();
        this._checkAvailability();
    }

    _loadConfig() {
        return {
            enabled: localStorage.getItem('web_scraping_enabled') === 'true',
            proxyEnabled: localStorage.getItem('web_scraping_proxy_enabled') === 'true',
            proxyList: JSON.parse(localStorage.getItem('web_scraping_proxy_list') || '[]'),
            antiDetection: localStorage.getItem('web_scraping_anti_detection') === 'true',
            maxRetries: parseInt(localStorage.getItem('web_scraping_max_retries') || '3'),
            timeout: parseInt(localStorage.getItem('web_scraping_timeout') || '30'),
            cacheEnabled: localStorage.getItem('web_scraping_cache_enabled') === 'true'
        };
    }

    async _checkAvailability() {
        // Check if Python and required dependencies are available
        try {
            // This would check if the Python scraper can be executed
            // For now, we'll assume it's available if the config files exist
            this.isAvailable = true;
        } catch (error) {
            console.warn('Web scraping agent not available:', error);
            this.isAvailable = false;
        }
    }

    async scrapeEbayVinyl(query, maxResults = 50) {
        if (!this.isAvailable || !this.config.enabled) {
            throw new Error('Web scraping service is not available or disabled');
        }

        try {
            // Execute Python scraper via backend API or direct execution
            const result = await this._executePythonScraper({
                marketplace: 'ebay',
                query: query,
                maxResults: maxResults,
                config: this.config
            });

            return this._formatEbayResults(result);
        } catch (error) {
            console.error('Error scraping eBay:', error);
            throw error;
        }
    }

    async scrapeDiscogsVinyl(query, maxResults = 50) {
        if (!this.isAvailable || !this.config.enabled) {
            throw new Error('Web scraping service is not available or disabled');
        }

        try {
            const result = await this._executePythonScraper({
                marketplace: 'discogs',
                query: query,
                maxResults: maxResults,
                config: this.config
            });

            return this._formatDiscogsResults(result);
        } catch (error) {
            console.error('Error scraping Discogs:', error);
            throw error;
        }
    }

    async scrapeAmazonVinyl(query, maxResults = 50) {
        if (!this.isAvailable || !this.config.enabled) {
            throw new Error('Web scraping service is not available or disabled');
        }

        try {
            const result = await this._executePythonScraper({
                marketplace: 'amazon',
                query: query,
                maxResults: maxResults,
                config: this.config
            });

            return this._formatAmazonResults(result);
        } catch (error) {
            console.error('Error scraping Amazon:', error);
            throw error;
        }
    }

    async _executePythonScraper(params) {
        // Use HTTP API to communicate with Python scraper
        try {
            return await this._callPythonApi(params);
        } catch (error) {
            console.warn('API call failed, falling back to mock data:', error);
            return this._getMockScrapingData(params);
        }
    }

    async _callPythonApi(params) {
        const apiUrl = 'http://localhost:5000/api/scrape';
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    marketplace: params.marketplace,
                    query: params.query,
                    maxResults: params.maxResults,
                    config: params.config
                }),
                // Add timeout to avoid hanging
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'API call failed');
            }

            return result.results;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('API request timed out after 30 seconds');
            }
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('API server not reachable. Make sure the Python server is running on port 5000.');
            }
            throw error;
        }
    }

    _formatEbayResults(data) {
        return data.map(item => ({
            marketplace: 'eBay',
            title: item.title || '',
            artist: item.artist || '',
            price: parseFloat(item.price || 0),
            condition: this._standardizeCondition(item.condition || ''),
            shipping: parseFloat(item.shipping || 0),
            seller: item.seller || '',
            url: item.url || '',
            imageUrl: item.imageUrl || '',
            timestamp: new Date().toISOString(),
            source: 'web-scraper',
            rawData: item
        }));
    }

    _formatDiscogsResults(data) {
        return data.map(item => ({
            marketplace: 'Discogs',
            title: item.title || '',
            artist: item.artist || '',
            price: parseFloat(item.price || 0),
            condition: this._standardizeCondition(item.condition || ''),
            year: parseInt(item.year || 0),
            label: item.label || '',
            format: item.format || '',
            seller: item.seller || '',
            url: item.url || '',
            releaseId: item.releaseId || '',
            timestamp: new Date().toISOString(),
            source: 'web-scraper',
            rawData: item
        }));
    }

    _formatAmazonResults(data) {
        return data.map(item => ({
            marketplace: 'Amazon',
            title: item.title || '',
            artist: item.artist || '',
            price: parseFloat(item.price || 0),
            condition: this._standardizeCondition(item.condition || ''),
            shipping: parseFloat(item.shipping || 0),
            seller: item.seller || '',
            url: item.url || '',
            imageUrl: item.imageUrl || '',
            timestamp: new Date().toISOString(),
            source: 'web-scraper',
            rawData: item
        }));
    }

    _standardizeCondition(condition) {
        const conditionMap = {
            'mint': 'M',
            'near mint': 'NM',
            'very good+': 'VG+',
            'very good': 'VG',
            'good+': 'G+',
            'good': 'G',
            'fair': 'F',
            'poor': 'P',
            'excellent': 'NM',
            'very good plus': 'VG+',
            'good plus': 'G+'
        };

        const normalized = condition.toLowerCase().trim();
        return conditionMap[normalized] || condition;
    }

    _getMockScrapingData(params) {
        // Mock data for demonstration
        const mockData = [];
        const artists = ['The Beatles', 'Pink Floyd', 'Miles Davis', 'Bob Dylan', 'David Bowie'];
        const albums = ['Abbey Road', 'Dark Side of the Moon', 'Kind of Blue', 'Highway 61 Revisited', 'The Rise and Fall of Ziggy Stardust'];
        const conditions = ['M', 'NM', 'VG+', 'VG', 'G+'];
        
        for (let i = 0; i < Math.min(params.maxResults, 10); i++) {
            mockData.push({
                title: albums[i % albums.length],
                artist: artists[i % artists.length],
                price: (15 + Math.random() * 85).toFixed(2),
                condition: conditions[i % conditions.length],
                shipping: (3 + Math.random() * 7).toFixed(2),
                seller: `Seller${i + 1}`,
                url: `https://${params.marketplace}.com/listing/${i}`,
                imageUrl: `https://example.com/image${i}.jpg`,
                ...(params.marketplace === 'discogs' ? {
                    year: 1960 + (i % 60),
                    label: 'Columbia',
                    format: 'LP',
                    releaseId: `release${i}`
                } : {})
            });
        }
        
        return mockData;
    }

    // Configuration methods
    enable() {
        this.config.enabled = true;
        localStorage.setItem('web_scraping_enabled', 'true');
    }

    disable() {
        this.config.enabled = false;
        localStorage.setItem('web_scraping_enabled', 'false');
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Persist to localStorage
        Object.keys(newConfig).forEach(key => {
            localStorage.setItem(`web_scraping_${key}`, 
                typeof newConfig[key] === 'object' 
                    ? JSON.stringify(newConfig[key])
                    : newConfig[key].toString()
            );
        });
    }

    getStatus() {
        return {
            available: this.isAvailable,
            enabled: this.config.enabled,
            config: this.config
        };
    }
}

// Singleton instance
window.webScrapingService = new WebScrapingService();