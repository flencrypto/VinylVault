#!/usr/bin/env python3
"""
Test script for the Web Scraper Agent
This script tests basic functionality of the scraper
"""

import asyncio
import sys
import os

# Add the tools directory to Python path
sys.path.append(os.path.dirname(__file__))

from advanced_web_scraper import create_scraper_agent

async def test_basic_functionality():
    """Test basic scraping functionality"""
    print("Testing basic scraping functionality...")
    
    try:
        agent = create_scraper_agent(
            url="https://httpbin.org/user-agent",
            headless=True,
            rotate_user_agent=True,
            random_delays=False,  # Disable delays for testing
            log_requests=True
        )
        
        await agent.initialize()
        
        # Test basic scraping
        content = await agent.scrape()
        
        if content and len(content) > 0:
            print("✓ Basic scraping test passed")
            print(f"  Content length: {len(content)} characters")
        else:
            print("✗ Basic scraping test failed")
            return False
        
        # Test selector-based scraping
        content_with_selector = await agent.scrape(selector="body")
        
        if content_with_selector and len(content_with_selector) > 0:
            print("✓ Selector-based scraping test passed")
            print(f"  Selected content length: {len(content_with_selector)} characters")
        else:
            print("✗ Selector-based scraping test failed")
            return False
        
        await agent.close()
        return True
        
    except Exception as e:
        print(f"✗ Basic functionality test failed with error: {e}")
        return False

async def test_configuration_options():
    """Test different configuration options"""
    print("\nTesting configuration options...")
    
    try:
        # Test with different browser types
        for browser_type in ["chromium", "firefox"]:
            agent = create_scraper_agent(
                url="https://httpbin.org/headers",
                headless=True,
                browser_type=browser_type,
                rotate_user_agent=True
            )
            
            await agent.initialize()
            content = await agent.scrape()
            await agent.close()
            
            if content and len(content) > 0:
                print(f"✓ {browser_type.capitalize()} browser test passed")
            else:
                print(f"✗ {browser_type.capitalize()} browser test failed")
                return False
        
        return True
        
    except Exception as e:
        print(f"✗ Configuration test failed with error: {e}")
        return False

async def test_error_handling():
    """Test error handling and retry logic"""
    print("\nTesting error handling...")
    
    try:
        agent = create_scraper_agent(
            url="https://invalid-url-that-does-not-exist-12345.com",
            headless=True,
            max_retries=2,
            exponential_backoff=True,
            log_requests=True
        )
        
        await agent.initialize()
        
        # This should fail but handle gracefully
        try:
            content = await agent.scrape()
            print("✗ Error handling test failed - should have raised an error")
            return False
        except Exception as e:
            print("✓ Error handling test passed - correctly caught error")
            print(f"  Error message: {e}")
        
        await agent.close()
        return True
        
    except Exception as e:
        print(f"✗ Error handling test failed with error: {e}")
        return False

async def main():
    """Run all tests"""
    print("Web Scraper Agent Test Suite")
    print("=" * 50)
    
    tests = [
        test_basic_functionality,
        test_configuration_options,
        test_error_handling
    ]
    
    passed_tests = 0
    total_tests = len(tests)
    
    for test in tests:
        if await test():
            passed_tests += 1
    
    print("\n" + "=" * 50)
    print(f"Test Results: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("✓ All tests passed! The Web Scraper Agent is ready to use.")
        return 0
    else:
        print("✗ Some tests failed. Please check the installation.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)