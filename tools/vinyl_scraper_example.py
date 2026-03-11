#!/usr/bin/env python3
"""
Vinyl-specific web scraping example for VinylVault
This script demonstrates scraping vinyl records from various marketplaces
"""

import asyncio
import json
from advanced_web_scraper import create_scraper_agent

class VinylScraper:
    """Specialized scraper for vinyl record marketplaces"""
    
    def __init__(self):
        self.config = self._load_config()
    
    def _load_config(self):
        """Load vinyl-specific configuration"""
        try:
            with open('vinyl_scraper_config.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("Vinyl config not found, using defaults")
            return {}
    
    async def scrape_ebay_vinyl(self, query: str, max_results: int = 50):
        """Scrape vinyl records from eBay"""
        print(f"Scraping eBay for: {query}")
        
        marketplace_config = self.config.get('vinyl_marketplaces', {}).get('ebay', {})
        
        agent = create_scraper_agent(
            url=self._build_ebay_url(query),
            headless=True,
            rotate_user_agent=True,
            random_delays=True,
            min_delay=marketplace_config.get('required_delay', 3.0),
            max_delay=marketplace_config.get('required_delay', 3.0) + 2.0,
            human_mouse_movements=True,
            check_invisible_overlays=True,
            cache_responses=True,
            exponential_backoff=True,
            max_retries=3,
            log_requests=True
        )
        
        try:
            await agent.initialize()
            
            # Scrape listing containers
            listings = await agent.scrape(selector=marketplace_config.get('selectors', {}).get('listing_container', '.s-item'))
            
            vinyl_data = []
            for i in range(min(max_results, len(listings))):
                listing_data = await self._extract_ebay_listing_data(agent, i)
                if listing_data:
                    vinyl_data.append(listing_data)
            
            print(f"Found {len(vinyl_data)} vinyl listings on eBay")
            return vinyl_data
            
        finally:
            await agent.close()
    
    async def scrape_discogs_vinyl(self, query: str, max_results: int = 50):
        """Scrape vinyl records from Discogs"""
        print(f"Scraping Discogs for: {query}")
        
        marketplace_config = self.config.get('vinyl_marketplaces', {}).get('discogs', {})
        
        agent = create_scraper_agent(
            url=self._build_discogs_url(query),
            headless=True,
            rotate_user_agent=True,
            random_delays=True,
            min_delay=marketplace_config.get('required_delay', 5.0),
            max_delay=marketplace_config.get('required_delay', 5.0) + 2.0,
            human_mouse_movements=True,
            use_proxy=True,  # Discogs has strong anti-bot measures
            proxy_rotation=True,
            check_invisible_overlays=True,
            cache_responses=True,
            exponential_backoff=True,
            max_retries=5,
            log_requests=True
        )
        
        try:
            await agent.initialize()
            
            # Scrape listing containers
            listings = await agent.scrape(selector=marketplace_config.get('selectors', {}).get('listing_container', '.card'))
            
            vinyl_data = []
            for i in range(min(max_results, len(listings))):
                listing_data = await self._extract_discogs_listing_data(agent, i)
                if listing_data:
                    vinyl_data.append(listing_data)
            
            print(f"Found {len(vinyl_data)} vinyl releases on Discogs")
            return vinyl_data
            
        finally:
            await agent.close()
    
    def _build_ebay_url(self, query: str) -> str:
        """Build eBay search URL"""
        marketplace_config = self.config.get('vinyl_marketplaces', {}).get('ebay', {})
        base_url = marketplace_config.get('base_url', 'https://www.ebay.com/sch/i.html')
        search_params = marketplace_config.get('search_params', '_nkw={query}&_sacat=176985')
        
        return f"{base_url}?{search_params.format(query=query.replace(' ', '+'))}"
    
    def _build_discogs_url(self, query: str) -> str:
        """Build Discogs search URL"""
        marketplace_config = self.config.get('vinyl_marketplaces', {}).get('discogs', {})
        base_url = marketplace_config.get('base_url', 'https://www.discogs.com/search/')
        search_params = marketplace_config.get('search_params', 'q={query}&type=release')
        
        return f"{base_url}?{search_params.format(query=query.replace(' ', '+'))}"
    
    async def _extract_ebay_listing_data(self, agent, listing_index: int) -> dict:
        """Extract data from a single eBay listing"""
        marketplace_config = self.config.get('vinyl_marketplaces', {}).get('ebay', {})
        selectors = marketplace_config.get('selectors', {})
        
        try:
            # Extract individual fields
            title = await agent.scrape(selector=f"{selectors.get('title', '.s-item__title')}:nth-child({listing_index + 1})")
            price = await agent.scrape(selector=f"{selectors.get('price', '.s-item__price')}:nth-child({listing_index + 1})")
            condition = await agent.scrape(selector=f"{selectors.get('condition', '.s-item__subtitle')}:nth-child({listing_index + 1})")
            shipping = await agent.scrape(selector=f"{selectors.get('shipping', '.s-item__shipping')}:nth-child({listing_index + 1})")
            
            return {
                'marketplace': 'eBay',
                'title': self._clean_text(title),
                'price': self._extract_price(price),
                'condition': self._map_condition(condition),
                'shipping': self._extract_shipping(shipping),
                'total_price': self._calculate_total_price(price, shipping)
            }
        except Exception as e:
            print(f"Error extracting eBay listing {listing_index}: {e}")
            return None
    
    async def _extract_discogs_listing_data(self, agent, listing_index: int) -> dict:
        """Extract data from a single Discogs listing"""
        marketplace_config = self.config.get('vinyl_marketplaces', {}).get('discogs', {})
        selectors = marketplace_config.get('selectors', {})
        
        try:
            # Extract individual fields
            artist = await agent.scrape(selector=f"{selectors.get('artist', '.card__artist')}:nth-child({listing_index + 1})")
            title = await agent.scrape(selector=f"{selectors.get('title', '.card__title')}:nth-child({listing_index + 1})")
            year = await agent.scrape(selector=f"{selectors.get('year', '.card__year')}:nth-child({listing_index + 1})")
            price = await agent.scrape(selector=f"{selectors.get('price', '.card__price')}:nth-child({listing_index + 1})")
            condition = await agent.scrape(selector=f"{selectors.get('condition', '.card__condition')}:nth-child({listing_index + 1})")
            
            return {
                'marketplace': 'Discogs',
                'artist': self._clean_text(artist),
                'title': self._clean_text(title),
                'year': self._extract_year(year),
                'price': self._extract_price(price),
                'condition': self._map_condition(condition)
            }
        except Exception as e:
            print(f"Error extracting Discogs listing {listing_index}: {e}")
            return None
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        return text.strip()
    
    def _extract_price(self, price_text: str) -> float:
        """Extract numeric price from text"""
        if not price_text:
            return 0.0
        
        # Remove currency symbols and commas
        import re
        price_match = re.search(r'[\d.,]+', price_text)
        if price_match:
            price_str = price_match.group().replace(',', '')
            try:
                return float(price_str)
            except ValueError:
                return 0.0
        return 0.0
    
    def _extract_shipping(self, shipping_text: str) -> float:
        """Extract shipping cost from text"""
        if not shipping_text:
            return 0.0
        
        # Look for free shipping or numeric shipping cost
        if 'free' in shipping_text.lower():
            return 0.0
        
        return self._extract_price(shipping_text)
    
    def _calculate_total_price(self, price: float, shipping: float) -> float:
        """Calculate total price including shipping"""
        return price + shipping
    
    def _extract_year(self, year_text: str) -> int:
        """Extract year from text"""
        if not year_text:
            return 0
        
        import re
        year_match = re.search(r'\b(19|20)\d{2}\b', year_text)
        if year_match:
            try:
                return int(year_match.group())
            except ValueError:
                return 0
        return 0
    
    def _map_condition(self, condition_text: str) -> str:
        """Map condition text to standardized grades"""
        if not condition_text:
            return "Unknown"
        
        condition_mapping = self.config.get('vinyl_specific_config', {}).get('condition_mapping', {})
        condition_text_lower = condition_text.lower()
        
        # Map common condition abbreviations
        for abbr, full_name in condition_mapping.items():
            if abbr.lower() in condition_text_lower:
                return full_name
        
        # Map common condition phrases
        condition_phrases = {
            'mint': 'Mint',
            'near mint': 'Near Mint',
            'very good+': 'Very Good+',
            'very good': 'Very Good',
            'good': 'Good',
            'fair': 'Fair',
            'poor': 'Poor'
        }
        
        for phrase, grade in condition_phrases.items():
            if phrase in condition_text_lower:
                return grade
        
        return condition_text

async def main():
    """Main vinyl scraping example"""
    print("VinylVault Web Scraper Agent - Vinyl Marketplace Scraping")
    print("=" * 60)
    
    scraper = VinylScraper()
    
    # Test searches
    test_searches = [
        "The Beatles Abbey Road",
        "Pink Floyd Dark Side of the Moon",
        "Miles Davis Kind of Blue"
    ]
    
    for search_query in test_searches:
        print(f"\nSearching for: {search_query}")
        
        # Scrape eBay
        ebay_results = await scraper.scrape_ebay_vinyl(search_query, max_results=10)
        
        # Scrape Discogs
        discogs_results = await scraper.scrape_discogs_vinyl(search_query, max_results=10)
        
        # Combine and display results
        all_results = ebay_results + discogs_results
        
        print(f"\nFound {len(all_results)} total listings for '{search_query}':")
        for i, result in enumerate(all_results[:5]):  # Show first 5 results
            print(f"{i+1}. {result.get('artist', '')} - {result.get('title', '')} - ${result.get('price', 0):.2f} ({result.get('condition', 'Unknown')})")

if __name__ == "__main__":
    asyncio.run(main())