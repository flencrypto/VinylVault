#!/usr/bin/env python3
"""
Example usage of the Web Scraper Agent
This script demonstrates how to use the web scraper agent with different configurations
"""

import asyncio
import json
from advanced_web_scraper import create_scraper_agent

async def example_basic_scraping():
    """Basic scraping example"""
    print("=== Basic Scraping Example ===")
    
    agent = create_scraper_agent(
        url="https://httpbin.org/headers",
        headless=True,
        rotate_user_agent=False,
        random_delays=False
    )
    
    try:
        await agent.initialize()
        content = await agent.scrape()
        print(f"Scraped content length: {len(content)}")
        print("Basic scraping completed successfully!")
    finally:
        await agent.close()

async def example_advanced_scraping():
    """Advanced scraping with anti-detection measures"""
    print("\n=== Advanced Scraping Example ===")
    
    agent = create_scraper_agent(
        url="https://httpbin.org/user-agent",
        headless=True,
        rotate_user_agent=True,
        random_delays=True,
        min_delay=2.0,
        max_delay=5.0,
        human_mouse_movements=True,
        check_invisible_overlays=True,
        cache_responses=True,
        exponential_backoff=True,
        max_retries=3,
        log_requests=True
    )
    
    try:
        await agent.initialize()
        content = await agent.scrape()
        print(f"Scraped content length: {len(content)}")
        print("Advanced scraping completed successfully!")
    finally:
        await agent.close()

async def example_ebay_scraping():
    """Example of scraping eBay for vinyl records"""
    print("\n=== eBay Vinyl Scraping Example ===")
    
    agent = create_scraper_agent(
        url="https://www.ebay.com/sch/i.html?_nkw=vinyl+records",
        headless=True,
        rotate_user_agent=True,
        random_delays=True,
        min_delay=3.0,
        max_delay=7.0,
        human_mouse_movements=True,
        check_invisible_overlays=True,
        custom_timeout=30,
        cache_responses=True,
        exponential_backoff=True,
        max_retries=5,
        log_requests=True
    )
    
    try:
        await agent.initialize()
        
        # Scrape product listings
        product_titles = await agent.scrape(selector=".s-item__title")
        product_prices = await agent.scrape(selector=".s-item__price")
        
        print(f"Found {len(product_titles)} product titles")
        print(f"Found {len(product_prices)} product prices")
        
        # Extract first few results
        if product_titles:
            print("\nSample product titles:")
            for i, title in enumerate(product_titles[:5]):
                print(f"{i+1}. {title}")
        
        print("eBay scraping completed successfully!")
    finally:
        await agent.close()

async def example_with_callbacks():
    """Example with custom callbacks"""
    print("\n=== Scraping with Callbacks Example ===")
    
    async def on_request(request):
        print(f"Request: {request.url}")
    
    async def on_response(response):
        print(f"Response: {response.status}")
    
    async def on_error(error):
        print(f"Error: {error}")
    
    agent = create_scraper_agent(
        url="https://httpbin.org/json",
        headless=True,
        on_request=on_request,
        on_response=on_response,
        on_error=on_error,
        log_requests=True
    )
    
    try:
        await agent.initialize()
        content = await agent.scrape()
        print(f"Scraped content length: {len(content)}")
        print("Scraping with callbacks completed successfully!")
    finally:
        await agent.close()

async def main():
    """Run all examples"""
    print("Web Scraper Agent Examples")
    print("=" * 50)
    
    # Run examples
    await example_basic_scraping()
    await example_advanced_scraping()
    await example_ebay_scraping()
    await example_with_callbacks()
    
    print("\nAll examples completed!")

if __name__ == "__main__":
    asyncio.run(main())