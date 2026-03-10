#!/usr/bin/env python3
"""
Integration Example: Vinyl Web Scraping + Pricing Intelligence
Shows how the two skills work together for deal finding.
"""

from scrape_vinyl_listings import scrape_vinyl_listings
from pricing_intelligence import analyze_vinyl_pricing
import json

def find_vinyl_deals(urls: list, min_confidence: float = 0.7) -> list:
    """
    Find vinyl deals by combining web scraping with pricing intelligence.
    
    Args:
        urls: List of URLs to scrape
        min_confidence: Minimum confidence score for analysis
        
    Returns:
        List of deals with arbitrage opportunities
    """
    print("🔄 Scraping vinyl listings...")
    scraped_results = scrape_vinyl_listings(urls)
    
    deals = []
    
    for result in scraped_results:
        print(f"\n📊 Analyzing: {result.get('title', 'Unknown')}")
        
        # Analyze pricing
        analysis = analyze_vinyl_pricing(result)
        
        # Check if it's a good deal
        if analysis.arbitrage_opportunity and analysis.confidence_score >= min_confidence:
            deal = {
                'title': result.get('title', 'Unknown'),
                'scraped_price': result.get('price', 0),
                'recommended_price': analysis.recommended_price,
                'potential_profit': analysis.recommended_price - result.get('price', 0),
                'profit_margin': ((analysis.recommended_price - result.get('price', 0)) / result.get('price', 0)) * 100,
                'confidence': analysis.confidence_score,
                'market_trend': analysis.market_trend,
                'url': result.get('url')
            }
            deals.append(deal)
            
            print(f"✅ ARBITRAGE OPPORTUNITY FOUND!")
            print(f"   Current Price: ${result.get('price', 0)}")
            print(f"   Recommended: ${analysis.recommended_price}")
            print(f"   Potential Profit: ${deal['potential_profit']:.2f} ({deal['profit_margin']:.1f}%)")
            print(f"   Confidence: {analysis.confidence_score:.1%}")
        else:
            print(f"❌ Not a good deal (confidence: {analysis.confidence_score:.1%})")
    
    return deals

def generate_deal_report(deals: list) -> dict:
    """Generate a comprehensive deal report."""
    if not deals:
        return {"message": "No arbitrage opportunities found"}
    
    total_potential_profit = sum(deal['potential_profit'] for deal in deals)
    avg_profit_margin = sum(deal['profit_margin'] for deal in deals) / len(deals)
    avg_confidence = sum(deal['confidence'] for deal in deals) / len(deals)
    
    return {
        "total_opportunities": len(deals),
        "total_potential_profit": round(total_potential_profit, 2),
        "average_profit_margin": round(avg_profit_margin, 1),
        "average_confidence": round(avg_confidence, 2),
        "deals": deals
    }

if __name__ == "__main__":
    # Example URLs (in practice, these would be real eBay/Discogs URLs)
    test_urls = [
        "https://www.ebay.com/itm/beatles-abbey-road-vinyl",
        "https://www.ebay.com/itm/pink-floyd-dark-side-moon",
        "https://www.discogs.com/sell/item/led-zeppelin-iv"
    ]
    
    print("🎵 VinylVault Deal Finder")
    print("=" * 50)
    
    # Find deals
    deals = find_vinyl_deals(test_urls)
    
    # Generate report
    report = generate_deal_report(deals)
    
    print("\n" + "=" * 50)
    print("📈 DEAL REPORT")
    print("=" * 50)
    
    if report["total_opportunities"] > 0:
        print(f"Total Opportunities: {report['total_opportunities']}")
        print(f"Total Potential Profit: ${report['total_potential_profit']}")
        print(f"Average Profit Margin: {report['average_profit_margin']}%")
        print(f"Average Confidence: {report['average_confidence']:.1%}")
        
        print("\nTop Deals:")
        for i, deal in enumerate(report["deals"][:3], 1):
            print(f"{i}. {deal['title']}")
            print(f"   Profit: ${deal['potential_profit']:.2f} ({deal['profit_margin']:.1f}%)")
            print(f"   Confidence: {deal['confidence']:.1%}")
    else:
        print("No arbitrage opportunities found in this batch.")
        print("Try different URLs or check market conditions.")