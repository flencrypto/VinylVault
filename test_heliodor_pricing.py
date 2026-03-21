#!/usr/bin/env python3
"""
Test pricing intelligence for Heliodor classical LP
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '.agents', 'skills', 'vinyl-pricing-intelligence'))
from pricing_intelligence import analyze_vinyl_pricing

def test_heliodor_pricing():
    """Test pricing analysis for the Heliodor classical LP."""
    
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
    
    print("🎵 Testing Vinyl Pricing Intelligence")
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
    
    print("\n📊 Pricing Analysis Results:")
    print("-" * 40)
    print(f"Scraped Price: ${analysis.scraped_price}")
    print(f"Recommended Price: ${analysis.recommended_price}")
    print(f"Price Range: ${analysis.price_range['low']} - ${analysis.price_range['high']}")
    print(f"Market Trend: {analysis.market_trend}")
    print(f"Confidence Score: {analysis.confidence_score:.1%}")
    print(f"Arbitrage Opportunity: {analysis.arbitrage_opportunity}")
    
    print("\n📈 Historical Comparisons:")
    print("-" * 40)
    for i, comp in enumerate(analysis.historical_comparisons[:3], 1):
        print(f"{i}. ${comp['price']} - {comp['condition']} - {comp.get('date', 'Unknown date')}")
    
    print("\n🤖 AI Insights:")
    print("-" * 40)
    for key, value in analysis.ai_insights.items():
        print(f"{key.replace('_', ' ').title()}: {value}")
    
    print("\n💡 Deal Assessment:")
    print("-" * 40)
    if analysis.arbitrage_opportunity:
        profit_potential = analysis.recommended_price - analysis.scraped_price
        profit_margin = (profit_potential / analysis.scraped_price) * 100
        print("✅ ARBITRAGE OPPORTUNITY DETECTED!")
        print(f"Potential Profit: ${profit_potential:.2f}")
        print(f"Profit Margin: {profit_margin:.1f}%")
        print(f"Confidence: {analysis.confidence_score:.1%}")
    else:
        print("❌ No significant arbitrage opportunity")
        print(f"Market price appears fair based on analysis")
    
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
    print("🎯 Pricing Intelligence Test Complete")
    print("=" * 60)
    
    # Summary
    print("\n📋 Summary for Heliodor HS 2527:")
    print("-" * 40)
    print("• Classical budget label release from 1960s")
    print("• Stereo format, UK pressing")
    print("• Condition grading significantly impacts value")
    print("• Market for classical vinyl is stable but niche")
    print("• Pricing intelligence considers genre-specific factors")