#!/usr/bin/env python3
"""
Test enhanced pricing intelligence for Heliodor classical LP
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '.agents', 'skills', 'vinyl-pricing-intelligence'))
from pricing_intelligence import analyze_vinyl_pricing

def test_heliodor_pricing():
    """Test enhanced pricing analysis for the Heliodor classical LP."""
    
    # Create test data based on the provided details
    vinyl_data = {
        'title': 'Heliodor HS 2527 Classical LP',
        'price': '$25.00',  # Example scraped price
        'condition': 'Very Good+',
        'year': '1960',  # Estimated based on 1960s pressing
        'country': 'England',
        'label': 'Heliodor',
        'format': 'LP',
        'genre': 'Classical',
        'notes': 'Budget label release, stereo, no deadwax visible'
    }
    
    print("🎵 Testing Enhanced Vinyl Pricing Intelligence")
    print("=" * 60)
    print("Record Details:")
    print(f"Title: {vinyl_data['title']}")
    print(f"Label: {vinyl_data['label']}")
    print(f"Country: {vinyl_data['country']}")
    print(f"Format: {vinyl_data['format']}")
    print(f"Genre: {vinyl_data['genre']}")
    print(f"Condition: {vinyl_data['condition']}")
    print(f"Year: {vinyl_data['year']}")
    print(f"Scraped Price: {vinyl_data['price']}")
    print("=" * 60)
    
    # Analyze pricing
    analysis = analyze_vinyl_pricing(vinyl_data)
    
    print("\n📊 Enhanced Pricing Analysis Results:")
    print("-" * 40)
    print(f"Scraped Price: ${analysis.scraped_price}")
    print(f"Recommended Price: ${analysis.recommended_price}")
    print(f"Price Range: ${analysis.price_range['low']} - ${analysis.price_range['high']}")
    print(f"Market Trend: {analysis.market_trend.value}")
    print(f"Confidence Score: {analysis.confidence_score:.1%}")
    print(f"Arbitrage Opportunity: {analysis.arbitrage_opportunity}")
    print(f"Arbitrage Score: {analysis.arbitrage_score:.1%}")
    
    print("\n📈 Historical Comparisons:")
    print("-" * 40)
    for i, comp in enumerate(analysis.historical_comparisons[:3], 1):
        print(f"{i}. ${comp['price']} - {comp['condition']} - {comp.get('date', 'Unknown date')}")
    
    print("\n🤖 Enhanced AI Insights:")
    print("-" * 40)
    for key, value in analysis.ai_insights.items():
        if hasattr(value, 'value'):  # Handle Enum values
            print(f"{key.replace('_', ' ').title()}: {value.value}")
        else:
            print(f"{key.replace('_', ' ').title()}: {value}")
    
    print("\n⚖️ Risk Assessment:")
    print("-" * 40)
    for key, value in analysis.risk_assessment.items():
        print(f"{key.replace('_', ' ').title()}: {value}")
    
    print("\n📊 Pricing Factors:")
    print("-" * 40)
    for key, value in analysis.pricing_factors.items():
        print(f"{key.replace('_', ' ').title()}: {value:.2f}")
    
    print("\n💡 Enhanced Deal Assessment:")
    print("-" * 40)
    if analysis.arbitrage_opportunity:
        profit_potential = analysis.recommended_price - analysis.scraped_price
        profit_margin = (profit_potential / analysis.scraped_price) * 100
        print("✅ STRONG ARBITRAGE OPPORTUNITY DETECTED!")
        print(f"Potential Profit: ${profit_potential:.2f}")
        print(f"Profit Margin: {profit_margin:.1f}%")
        print(f"Arbitrage Score: {analysis.arbitrage_score:.1%}")
        print(f"Confidence: {analysis.confidence_score:.1%}")
    else:
        print("❌ No significant arbitrage opportunity")
        print(f"Market price appears fair based on enhanced analysis")
    
    print("\n📈 Market Intelligence:")
    print("-" * 40)
    for key, value in analysis.market_intelligence.items():
        if isinstance(value, list):
            print(f"{key.replace('_', ' ').title()}:")
            for item in value:
                print(f"  • {item}")
        else:
            print(f"{key.replace('_', ' ').title()}: {value}")
    
    return analysis

def analyze_multiple_scenarios():
    """Test different pricing scenarios for this record."""
    
    scenarios = [
        {
            'name': 'VG+ Condition - Fair Market',
            'price': '$25.00',
            'condition': 'Very Good+'
        },
        {
            'name': 'VG+ Condition - Underpriced',
            'price': '$15.00',
            'condition': 'Very Good+'
        },
        {
            'name': 'Near Mint Condition',
            'price': '$35.00',
            'condition': 'Near Mint'
        },
        {
            'name': 'Good Condition',
            'price': '$18.00',
            'condition': 'Good'
        }
    ]
    
    print("\n" + "=" * 60)
    print("🧪 Multiple Scenario Analysis")
    print("=" * 60)
    
    for scenario in scenarios:
        print(f"\n📋 Scenario: {scenario['name']}")
        print("-" * 30)
        
        vinyl_data = {
            'title': 'Heliodor HS 2527 Classical LP',
            'price': scenario['price'],
            'condition': scenario['condition'],
            'year': '1960',
            'country': 'England',
            'label': 'Heliodor',
            'format': 'LP',
            'genre': 'Classical'
        }
        
        analysis = analyze_vinyl_pricing(vinyl_data)
        
        print(f"Scraped Price: ${analysis.scraped_price}")
        print(f"Recommended: ${analysis.recommended_price}")
        print(f"Arbitrage: {analysis.arbitrage_opportunity}")
        print(f"Arbitrage Score: {analysis.arbitrage_score:.1%}")
        print(f"Confidence: {analysis.confidence_score:.1%}")
        
        if analysis.arbitrage_opportunity:
            profit = analysis.recommended_price - analysis.scraped_price
            margin = (profit / analysis.scraped_price) * 100
            print(f"💰 Profit Potential: ${profit:.2f} ({margin:.1f}%)")

if __name__ == "__main__":
    # Test the specific Heliodor record
    analysis = test_heliodor_pricing()
    
    # Test multiple scenarios
    analyze_multiple_scenarios()
    
    print("\n" + "=" * 60)
    print("🎯 Enhanced Pricing Intelligence Test Complete")
    print("=" * 60)
    
    # Summary
    print("\n📋 Enhanced Summary for Heliodor HS 2527:")
    print("-" * 40)
    print("• Classical budget label release from 1960s")
    print("• Stereo format, UK pressing")
    print("• Enhanced condition grading with finer granularity")
    print("• Sophisticated market trend analysis with ML patterns")
    print("• Risk assessment and market intelligence included")
    print("• Pricing factors weighted by importance")