#!/usr/bin/env python3
"""
Vinyl Web Scraping Module
Automated scraping of vinyl record listings from eBay and other marketplaces.
"""

from playwright.sync_api import sync_playwright
import time
import random
import logging
from typing import List, Dict, Optional
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VinylScraper:
    """Main class for scraping vinyl record listings."""
    
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.supported_domains = ['ebay.com', 'discogs.com']
        
    def validate_url(self, url: str) -> bool:
        """Validate that URL is from a supported domain."""
        parsed = urlparse(url)
        return any(domain in parsed.netloc for domain in self.supported_domains)
    
    def scrape_vinyl_listings(self, urls: List[str]) -> List[Dict]:
        """
        Scrape vinyl record listings from provided URLs.
        
        Args:
            urls: List of URLs to scrape
            
        Returns:
            List of dictionaries containing scraped data
        """
        results = []
        
        # Validate URLs
        valid_urls = [url for url in urls if self.validate_url(url)]
        invalid_urls = [url for url in urls if not self.validate_url(url)]
        
        if invalid_urls:
            logger.warning(f"Skipping unsupported URLs: {invalid_urls}")
        
        if not valid_urls:
            return results
            
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            context = browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            )
            
            for url in valid_urls:
                try:
                    page = context.new_page()
                    logger.info(f"Scraping URL: {url}")
                    
                    # Navigate to page with network idle wait
                    page.goto(url, wait_until='networkidle')
                    time.sleep(random.uniform(2, 4))  # Random delay to mimic human behavior
                    
                    # Extract data based on domain
                    domain = urlparse(url).netloc
                    scraped_data = self._extract_data_by_domain(page, domain)
                    
                    if scraped_data:
                        scraped_data['url'] = url
                        scraped_data['domain'] = domain
                        results.append(scraped_data)
                        logger.info(f"Successfully scraped data from {url}")
                    else:
                        logger.warning(f"No data extracted from {url}")
                        
                except Exception as e:
                    logger.error(f"Error scraping {url}: {e}")
                    # Add error result for tracking
                    results.append({
                        'url': url,
                        'error': str(e),
                        'success': False
                    })
                finally:
                    page.close()
            
            browser.close()
        
        return results
    
    def _extract_data_by_domain(self, page, domain: str) -> Optional[Dict]:
        """Extract data based on the specific domain."""
        if 'ebay.com' in domain:
            return self._extract_ebay_data(page)
        elif 'discogs.com' in domain:
            return self._extract_discogs_data(page)
        return None
    
    def _extract_ebay_data(self, page) -> Dict:
        """Extract vinyl record data from eBay listings."""
        data = {}
        
        try:
            # Extract title
            title_selectors = [
                'h1[data-testid="x-item-title"]',
                'h1.itemTitle',
                'h1'
            ]
            for selector in title_selectors:
                if page.is_visible(selector):
                    data['title'] = page.eval_on_selector(selector, 'el => el.innerText').strip()
                    break
            
            # Extract price
            price_selectors = [
                '.vi-price',
                '[data-testid="x-price-primary"]',
                '.prc'
            ]
            for selector in price_selectors:
                if page.is_visible(selector):
                    data['price'] = page.eval_on_selector(selector, 'el => el.innerText').strip()
                    break
            
            # Extract condition
            condition_selectors = [
                '[data-testid="x-item-condition"]',
                '[data-testid="condition"]',
                '.ux-labels-values__values'
            ]
            for selector in condition_selectors:
                if page.is_visible(selector):
                    data['condition'] = page.eval_on_selector(selector, 'el => el.innerText').strip()
                    break
            
            # Extract seller info
            seller_selectors = [
                '[data-testid="x-seller-info"]',
                '.mbg'
            ]
            for selector in seller_selectors:
                if page.is_visible(selector):
                    data['seller'] = page.eval_on_selector(selector, 'el => el.innerText').strip()
                    break
                    
        except Exception as e:
            logger.error(f"Error extracting eBay data: {e}")
            
        return data
    
    def _extract_discogs_data(self, page) -> Dict:
        """Extract vinyl record data from Discogs listings."""
        data = {}
        
        try:
            # Extract title/artist
            title_selectors = [
                'h1[itemprop="name"]',
                '.page_title'
            ]
            for selector in title_selectors:
                if page.is_visible(selector):
                    data['title'] = page.eval_on_selector(selector, 'el => el.innerText').strip()
                    break
            
            # Extract price
            price_selectors = [
                '.price',
                '[itemprop="price"]'
            ]
            for selector in price_selectors:
                if page.is_visible(selector):
                    data['price'] = page.eval_on_selector(selector, 'el => el.innerText').strip()
                    break
            
            # Extract condition
            condition_selectors = [
                '.item_condition',
                '.condition'
            ]
            for selector in condition_selectors:
                if page.is_visible(selector):
                    data['condition'] = page.eval_on_selector(selector, 'el => el.innerText').strip()
                    break
                    
        except Exception as e:
            logger.error(f"Error extracting Discogs data: {e}")
            
        return data

def scrape_vinyl_listings(urls: List[str], headless: bool = True) -> List[Dict]:
    """
    Convenience function to scrape vinyl listings.
    
    Args:
        urls: List of URLs to scrape
        headless: Whether to run browser in headless mode
        
    Returns:
        List of dictionaries containing scraped data
    """
    scraper = VinylScraper(headless=headless)
    return scraper.scrape_vinyl_listings(urls)

if __name__ == "__main__":
    # Example usage
    test_urls = [
        "https://www.ebay.com/itm/example-vinyl-listing",
        "https://www.discogs.com/sell/item/example"
    ]
    
    results = scrape_vinyl_listings(test_urls)
    print("Scraping results:")
    for result in results:
        print(f"URL: {result.get('url')}")
        print(f"Title: {result.get('title', 'N/A')}")
        print(f"Price: {result.get('price', 'N/A')}")
        print(f"Condition: {result.get('condition', 'N/A')}")
        print("-" * 40)