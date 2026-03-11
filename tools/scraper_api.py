#!/usr/bin/env python3
"""
Web Scraper API Server
Bridges JavaScript frontend with Python web scraping agent
"""

from flask import Flask, request, jsonify
try:
    from flask_cors import CORS
    CORS_AVAILABLE = True
except ImportError:
    CORS_AVAILABLE = False
    print("Warning: flask-cors not installed. CORS support disabled.")
import asyncio
import json
import os
import sys

# Add the tools directory to Python path
sys.path.append(os.path.dirname(__file__))

from advanced_web_scraper import create_scraper_agent
from vinyl_scraper_example import VinylScraper

app = Flask(__name__)
if CORS_AVAILABLE:
    CORS(app)  # Enable CORS for frontend requests
else:
    # Basic CORS headers manually
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response

class ScraperAPI:
    def __init__(self):
        self.scrapers = {}
        self.config = self._load_config()
    
    def _load_config(self):
        """Load configuration from file"""
        config_path = os.path.join(os.path.dirname(__file__), 'scraper_config.json')
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    async def scrape_ebay(self, query, max_results=50):
        """Scrape eBay for vinyl records"""
        scraper = VinylScraper()
        return await scraper.scrape_ebay_vinyl(query, max_results)
    
    async def scrape_discogs(self, query, max_results=50):
        """Scrape Discogs for vinyl records"""
        scraper = VinylScraper()
        return await scraper.scrape_discogs_vinyl(query, max_results)
    
    async def scrape_amazon(self, query, max_results=50):
        """Scrape Amazon for vinyl records"""
        # Amazon scraping would be implemented here
        # For now, return mock data
        return []
    
    async def scrape_marketplace(self, marketplace, query, max_results=50):
        """Scrape specific marketplace"""
        if marketplace == "ebay":
            return await self.scrape_ebay(query, max_results)
        elif marketplace == "discogs":
            return await self.scrape_discogs(query, max_results)
        elif marketplace == "amazon":
            return await self.scrape_amazon(query, max_results)
        else:
            raise ValueError(f"Unsupported marketplace: {marketplace}")

# Global API instance
api = ScraperAPI()

@app.route('/api/scrape', methods=['POST'])
async def scrape_endpoint():
    """Main scraping endpoint"""
    try:
        data = request.get_json()
        
        marketplace = data.get('marketplace', 'ebay')
        query = data.get('query', '')
        max_results = data.get('maxResults', 50)
        
        if not query:
            return jsonify({'error': 'Query parameter required'}), 400
        
        # Run scraping asynchronously
        results = await api.scrape_marketplace(marketplace, query, max_results)
        
        return jsonify({
            'success': True,
            'marketplace': marketplace,
            'query': query,
            'results': results,
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scrape/multiple', methods=['POST'])
async def scrape_multiple_endpoint():
    """Scrape multiple marketplaces"""
    try:
        data = request.get_json()
        
        query = data.get('query', '')
        marketplaces = data.get('marketplaces', ['ebay', 'discogs'])
        max_results_per = data.get('maxResultsPer', 20)
        
        if not query:
            return jsonify({'error': 'Query parameter required'}), 400
        
        all_results = {}
        
        for marketplace in marketplaces:
            try:
                results = await api.scrape_marketplace(marketplace, query, max_results_per)
                all_results[marketplace] = results
            except Exception as e:
                all_results[marketplace] = {'error': str(e)}
        
        return jsonify({
            'success': True,
            'query': query,
            'results': all_results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status', methods=['GET'])
def status_endpoint():
    """API status endpoint"""
    return jsonify({
        'status': 'running',
        'version': '1.0.0',
        'available_marketplaces': ['ebay', 'discogs', 'amazon']
    })

@app.route('/api/config', methods=['GET'])
def config_endpoint():
    """Get current configuration"""
    return jsonify(api.config)

@app.route('/api/config', methods=['POST'])
def update_config_endpoint():
    """Update configuration"""
    try:
        data = request.get_json()
        # Update configuration logic here
        return jsonify({'success': True, 'message': 'Configuration updated'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Helper function to run async functions in Flask
async def run_async(func, *args):
    """Run async function and return result"""
    return await func(*args)

# Wrap async functions for Flask
@app.route('/api/scrape/ebay', methods=['POST'])
def scrape_ebay_endpoint():
    """Scrape eBay endpoint"""
    data = request.get_json()
    query = data.get('query', '')
    max_results = data.get('maxResults', 50)
    
    if not query:
        return jsonify({'error': 'Query parameter required'}), 400
    
    try:
        results = asyncio.run(api.scrape_ebay(query, max_results))
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scrape/discogs', methods=['POST'])
def scrape_discogs_endpoint():
    """Scrape Discogs endpoint"""
    data = request.get_json()
    query = data.get('query', '')
    max_results = data.get('maxResults', 50)
    
    if not query:
        return jsonify({'error': 'Query parameter required'}), 400
    
    try:
        results = asyncio.run(api.scrape_discogs(query, max_results))
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Web Scraper API Server...")
    print("Available endpoints:")
    print("  POST /api/scrape/ebay - Scrape eBay")
    print("  POST /api/scrape/discogs - Scrape Discogs")
    print("  POST /api/scrape - General scraping endpoint")
    print("  POST /api/scrape/multiple - Scrape multiple marketplaces")
    print("  GET /api/status - API status")
    print("  GET /api/config - Get configuration")
    print("  POST /api/config - Update configuration")
    print("\nServer running on http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)