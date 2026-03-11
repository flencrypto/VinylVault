#!/usr/bin/env python3
"""
Integration test for web scraping agent
Tests the connection between JavaScript frontend and Python backend
"""

import asyncio
import sys
import os

# Add the tools directory to Python path
sys.path.append(os.path.dirname(__file__))

from scraper_api import ScraperAPI

def test_api_connection():
    """Test basic API functionality"""
    print("Testing Web Scraping API Integration...")
    print("=" * 50)
    
    api = ScraperAPI()
    
    # Test configuration loading
    print("1. Testing configuration loading...")
    config = api._load_config()
    print(f"   ✓ Configuration loaded: {len(config)} sections")
    
    # Test eBay scraping
    print("2. Testing eBay scraping...")
    try:
        results = asyncio.run(api.scrape_ebay("The Beatles", 3))
        print(f"   ✓ eBay scraping successful: {len(results)} results")
        for result in results:
            print(f"     - {result.get('artist', '')} - {result.get('title', '')}: ${result.get('price', 0)}")
    except Exception as e:
        print(f"   ✗ eBay scraping failed: {e}")
    
    # Test Discogs scraping
    print("3. Testing Discogs scraping...")
    try:
        results = asyncio.run(api.scrape_discogs("Pink Floyd", 3))
        print(f"   ✓ Discogs scraping successful: {len(results)} results")
        for result in results:
            print(f"     - {result.get('artist', '')} - {result.get('title', '')}: ${result.get('price', 0)}")
    except Exception as e:
        print(f"   ✗ Discogs scraping failed: {e}")
    
    # Test marketplace selection
    print("4. Testing marketplace selection...")
    try:
        results = asyncio.run(api.scrape_marketplace("ebay", "Miles Davis", 2))
        print(f"   ✓ Marketplace selection successful: {len(results)} results")
    except Exception as e:
        print(f"   ✗ Marketplace selection failed: {e}")
    
    print("\nIntegration test completed!")
    print("=" * 50)

def test_flask_app():
    """Test Flask app functionality"""
    print("\nTesting Flask API Server...")
    print("=" * 50)
    
    # This would test the actual Flask endpoints
    # For now, we'll just verify the module imports
    try:
        from flask import Flask
        from flask_cors import CORS
        print("✓ Flask dependencies available")
        
        # Test API instance creation
        api = ScraperAPI()
        print("✓ API instance created successfully")
        
        print("\nTo test the full Flask app, run:")
        print("  python scraper_api.py")
        print("Then visit http://localhost:5000/api/status")
        
    except ImportError as e:
        print(f"✗ Flask dependencies missing: {e}")
        print("Install with: pip install flask flask-cors")

if __name__ == "__main__":
    test_api_connection()
    test_flask_app()
    
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Install browsers: playwright install chromium")
    print("3. Start API server: python scraper_api.py")
    print("4. Open VinylVault and enable web scraping in Settings")