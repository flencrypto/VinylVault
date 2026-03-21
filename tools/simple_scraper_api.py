#!/usr/bin/env python3
"""
Simple Web Scraper API Server
Lightweight version without external dependencies
"""

import json
import asyncio
import sys
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add the tools directory to Python path
sys.path.append(os.path.dirname(__file__))

from advanced_web_scraper import create_scraper_agent
from vinyl_scraper_example import VinylScraper

class ScraperAPIHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.scraper = VinylScraper()
        super().__init__(*args, **kwargs)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def end_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/status':
            self._handle_status()
        elif parsed_path.path == '/api/config':
            self._handle_get_config()
        else:
            self._send_error(404, 'Endpoint not found')
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/scrape':
            self._handle_scrape()
        elif parsed_path.path == '/api/scrape/multiple':
            self._handle_scrape_multiple()
        else:
            self._send_error(404, 'Endpoint not found')
    
    def _handle_status(self):
        """Return API status"""
        response = {
            'status': 'running',
            'version': '1.0.0',
            'available_marketplaces': ['ebay', 'discogs', 'amazon']
        }
        self._send_json(response)
    
    def _handle_get_config(self):
        """Return current configuration"""
        self._send_json(self.scraper.config)
    
    def _handle_scrape(self):
        """Handle scraping request"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            marketplace = data.get('marketplace', 'ebay')
            query = data.get('query', '')
            max_results = data.get('maxResults', 50)
            
            if not query:
                self._send_error(400, 'Query parameter required')
                return
            
            # Run scraping asynchronously
            if marketplace == 'ebay':
                results = asyncio.run(self.scraper.scrape_ebay_vinyl(query, max_results))
            elif marketplace == 'discogs':
                results = asyncio.run(self.scraper.scrape_discogs_vinyl(query, max_results))
            elif marketplace == 'amazon':
                results = []  # Amazon scraping not implemented yet
            else:
                self._send_error(400, f'Unsupported marketplace: {marketplace}')
                return
            
            response = {
                'success': True,
                'marketplace': marketplace,
                'query': query,
                'results': results,
                'count': len(results)
            }
            self._send_json(response)
            
        except Exception as e:
            self._send_error(500, str(e))
    
    def _handle_scrape_multiple(self):
        """Handle multiple marketplace scraping"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            query = data.get('query', '')
            marketplaces = data.get('marketplaces', ['ebay', 'discogs'])
            max_results_per = data.get('maxResultsPer', 20)
            
            if not query:
                self._send_error(400, 'Query parameter required')
                return
            
            all_results = {}
            
            for marketplace in marketplaces:
                try:
                    if marketplace == 'ebay':
                        results = asyncio.run(self.scraper.scrape_ebay_vinyl(query, max_results_per))
                    elif marketplace == 'discogs':
                        results = asyncio.run(self.scraper.scrape_discogs_vinyl(query, max_results_per))
                    elif marketplace == 'amazon':
                        results = []
                    else:
                        results = {'error': f'Unsupported marketplace: {marketplace}'}
                    
                    all_results[marketplace] = results
                except Exception as e:
                    all_results[marketplace] = {'error': str(e)}
            
            response = {
                'success': True,
                'query': query,
                'results': all_results
            }
            self._send_json(response)
            
        except Exception as e:
            self._send_error(500, str(e))
    
    def _send_json(self, data):
        """Send JSON response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def _send_error(self, code, message):
        """Send error response"""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        response = {'error': message}
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def log_message(self, format, *args):
        """Custom log format"""
        print(f"[{self.log_date_time_string()}] {format % args}")

def run_server(port=5000):
    """Start the HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, ScraperAPIHandler)
    
    print(f"Starting Simple Web Scraper API Server...")
    print(f"Server running on http://localhost:{port}")
    print("Available endpoints:")
    print("  GET  /api/status - API status")
    print("  GET  /api/config - Get configuration")
    print("  POST /api/scrape - Scrape marketplace")
    print("  POST /api/scrape/multiple - Scrape multiple marketplaces")
    print("\nPress Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.shutdown()

if __name__ == '__main__':
    run_server()