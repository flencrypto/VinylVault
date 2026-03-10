#!/usr/bin/env python3
"""
Vinyl Pricing Intelligence Module
Intelligent pricing analysis using historical data, condition grading, and AI insights.
"""

import json
import logging
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class PricingAnalysis:
    """Container for pricing analysis results."""
    scraped_price: float
    recommended_price: float
    price_range: Dict[str, float]  # low, medium, high
    market_trend: str  # rising, falling, stable
    confidence_score: float  # 0-1
    historical_comparisons: List[Dict]
    ai_insights: Dict[str, Any]
    arbitrage_opportunity: bool

class VinylPricingAnalyzer:
    """Main class for vinyl pricing intelligence."""
    
    def __init__(self, discogs_token: Optional[str] = None, xai_api_key: Optional[str] = None):
        self.discogs_token = discogs_token
        self.xai_api_key = xai_api_key
        self.condition_grading = {
            'Mint': 1.0,
            'Near Mint': 0.9,
            'Very Good+': 0.8,
            'Very Good': 0.7,
            'Good': 0.6,
            'Fair': 0.4,
            'Poor': 0.2
        }
    
    def analyze_vinyl_pricing(self, scraped_data: Dict) -> PricingAnalysis:
        """
        Analyze vinyl pricing based on scraped data.
        
        Args:
            scraped_data: Dictionary containing scraped vinyl data
            
        Returns:
            PricingAnalysis object with comprehensive pricing insights
        """
        logger.info(f"Analyzing pricing for: {scraped_data.get('title', 'Unknown')}")
        
        # Extract and normalize data
        normalized_data = self._normalize_scraped_data(scraped_data)
        
        # Get historical comparisons
        historical_data = self._get_historical_comparisons(normalized_data)
        
        # Analyze market trends
        market_trend = self._analyze_market_trend(historical_data)
        
        # Get AI insights if API key available
        ai_insights = self._get_ai_insights(normalized_data, historical_data) if self.xai_api_key else {}
        
        # Calculate recommended pricing
        recommended_price = self._calculate_recommended_price(
            normalized_data, historical_data, ai_insights
        )
        
        # Check for arbitrage opportunities
        arbitrage_opportunity = self._check_arbitrage_opportunity(
            normalized_data, recommended_price
        )
        
        return PricingAnalysis(
            scraped_price=normalized_data['price'],
            recommended_price=recommended_price['medium'],
            price_range=recommended_price,
            market_trend=market_trend,
            confidence_score=self._calculate_confidence(historical_data, ai_insights),
            historical_comparisons=historical_data,
            ai_insights=ai_insights,
            arbitrage_opportunity=arbitrage_opportunity
        )
    
    def _normalize_scraped_data(self, scraped_data: Dict) -> Dict:
        """Normalize scraped data to standard format."""
        normalized = scraped_data.copy()
        
        # Normalize price
        if 'price' in normalized:
            price_str = str(normalized['price']).replace('$', '').replace(',', '')
            try:
                normalized['price'] = float(price_str)
            except ValueError:
                normalized['price'] = 0.0
        
        # Normalize condition
        if 'condition' in normalized:
            condition = normalized['condition'].lower()
            if 'mint' in condition:
                normalized['condition_score'] = self.condition_grading['Mint']
            elif 'near mint' in condition:
                normalized['condition_score'] = self.condition_grading['Near Mint']
            elif 'very good+' in condition:
                normalized['condition_score'] = self.condition_grading['Very Good+']
            elif 'very good' in condition:
                normalized['condition_score'] = self.condition_grading['Very Good']
            elif 'good' in condition:
                normalized['condition_score'] = self.condition_grading['Good']
            else:
                normalized['condition_score'] = self.condition_grading['Good']  # Default
        
        return normalized
    
    def _get_historical_comparisons(self, normalized_data: Dict) -> List[Dict]:
        """Get historical sales data for similar items."""
        comparisons = []
        
        # Mock historical data - in practice, this would query Discogs API
        # For now, using simulated data based on common vinyl pricing patterns
        
        if normalized_data.get('title', '').lower().find('beatles') != -1:
            comparisons = [
                {'price': 42.50, 'condition': 'Very Good+', 'date': '2024-01-15', 'country': 'UK'},
                {'price': 48.75, 'condition': 'Near Mint', 'date': '2024-02-20', 'country': 'UK'},
                {'price': 39.99, 'condition': 'Very Good', 'date': '2023-12-10', 'country': 'US'},
                {'price': 52.00, 'condition': 'Mint', 'date': '2024-03-01', 'country': 'UK'}
            ]
        elif normalized_data.get('title', '').lower().find('pink floyd') != -1:
            comparisons = [
                {'price': 35.00, 'condition': 'Very Good+', 'date': '2024-01-20', 'country': 'UK'},
                {'price': 42.00, 'condition': 'Near Mint', 'date': '2024-02-15', 'country': 'UK'},
                {'price': 30.50, 'condition': 'Very Good', 'date': '2023-11-30', 'country': 'US'}
            ]
        else:
            # Generic pricing based on condition and year
            base_price = 25.0  # Base price for common records
            year_factor = 1.0
            if normalized_data.get('year'):
                try:
                    year = int(normalized_data['year'])
                    if year < 1980:
                        year_factor = 1.5  # Older records are more valuable
                    elif year < 2000:
                        year_factor = 1.2
                except ValueError:
                    pass
            
            comparisons = [
                {'price': base_price * year_factor * 0.8, 'condition': 'Very Good', 'date': '2024-01-01'},
                {'price': base_price * year_factor * 1.0, 'condition': 'Very Good+', 'date': '2024-02-01'},
                {'price': base_price * year_factor * 1.2, 'condition': 'Near Mint', 'date': '2024-03-01'}
            ]
        
        # Filter by similar condition
        target_condition_score = normalized_data.get('condition_score', 0.7)
        filtered_comparisons = [
            comp for comp in comparisons 
            if abs(self.condition_grading.get(comp['condition'], 0.7) - target_condition_score) <= 0.2
        ]
        
        return filtered_comparisons if filtered_comparisons else comparisons
    
    def _analyze_market_trend(self, historical_data: List[Dict]) -> str:
        """Analyze market trend based on historical data."""
        if len(historical_data) < 2:
            return 'stable'
        
        # Sort by date and analyze trend
        sorted_data = sorted(historical_data, key=lambda x: x['date'])
        recent_prices = [item['price'] for item in sorted_data[-3:]]
        
        if len(recent_prices) > 1:
            price_change = recent_prices[-1] - recent_prices[0]
            if price_change > 5:
                return 'rising'
            elif price_change < -5:
                return 'falling'
        
        return 'stable'
    
    def _get_ai_insights(self, normalized_data: Dict, historical_data: List[Dict]) -> Dict[str, Any]:
        """Get AI-powered market insights using Grok/XAI."""
        # Mock AI analysis - in practice, this would call XAI API
        insights = {
            'demand_level': 'medium',
            'rarity_factor': 1.0,
            'collector_interest': 'moderate',
            'market_sentiment': 'neutral',
            'seasonal_factor': 1.0
        }
        
        # Simple AI-like analysis based on data
        title = normalized_data.get('title', '').lower()
        
        if 'beatles' in title or 'rolling stones' in title:
            insights.update({
                'demand_level': 'high',
                'rarity_factor': 1.5,
                'collector_interest': 'high',
                'market_sentiment': 'positive'
            })
        elif 'jazz' in title or 'blue note' in title:
            insights.update({
                'demand_level': 'medium-high',
                'rarity_factor': 1.3,
                'collector_interest': 'high'
            })
        
        # Adjust based on historical trend
        trend = self._analyze_market_trend(historical_data)
        if trend == 'rising':
            insights['market_sentiment'] = 'positive'
        elif trend == 'falling':
            insights['market_sentiment'] = 'negative'
        
        return insights
    
    def _calculate_recommended_price(self, normalized_data: Dict, 
                                   historical_data: List[Dict], 
                                   ai_insights: Dict) -> Dict[str, float]:
        """Calculate recommended pricing range."""
        scraped_price = normalized_data['price']
        condition_score = normalized_data.get('condition_score', 0.7)
        
        if not historical_data:
            # Fallback pricing based on condition
            base_price = 30.0
            price_low = base_price * condition_score * 0.8
            price_medium = base_price * condition_score
            price_high = base_price * condition_score * 1.2
        else:
            # Calculate based on historical data
            prices = [item['price'] for item in historical_data]
            avg_price = sum(prices) / len(prices)
            
            # Adjust for condition
            avg_condition = sum([self.condition_grading.get(item['condition'], 0.7) 
                               for item in historical_data]) / len(historical_data)
            condition_adjustment = condition_score / avg_condition
            
            # Apply AI insights
            rarity_factor = ai_insights.get('rarity_factor', 1.0)
            seasonal_factor = ai_insights.get('seasonal_factor', 1.0)
            
            base_price = avg_price * condition_adjustment * rarity_factor * seasonal_factor
            
            price_low = base_price * 0.8
            price_medium = base_price
            price_high = base_price * 1.2
        
        return {
            'low': round(price_low, 2),
            'medium': round(price_medium, 2),
            'high': round(price_high, 2)
        }
    
    def _calculate_confidence(self, historical_data: List[Dict], ai_insights: Dict) -> float:
        """Calculate confidence score for the analysis."""
        confidence = 0.5  # Base confidence
        
        # Increase confidence with more historical data
        if len(historical_data) >= 3:
            confidence += 0.3
        elif len(historical_data) >= 1:
            confidence += 0.1
        
        # Increase confidence with AI insights
        if ai_insights:
            confidence += 0.2
        
        return min(confidence, 1.0)
    
    def _check_arbitrage_opportunity(self, normalized_data: Dict, recommended_price: Dict) -> bool:
        """Check if current listing presents an arbitrage opportunity."""
        scraped_price = normalized_data['price']
        medium_recommended = recommended_price['medium']
        
        # Arbitrage opportunity if scraped price is significantly below recommended
        return scraped_price < medium_recommended * 0.7

def analyze_vinyl_pricing(scraped_data: Dict, 
                         discogs_token: Optional[str] = None,
                         xai_api_key: Optional[str] = None) -> PricingAnalysis:
    """
    Convenience function for vinyl pricing analysis.
    
    Args:
        scraped_data: Dictionary containing scraped vinyl data
        discogs_token: Optional Discogs API token
        xai_api_key: Optional XAI API key for Grok AI
        
    Returns:
        PricingAnalysis object with comprehensive insights
    """
    analyzer = VinylPricingAnalyzer(discogs_token, xai_api_key)
    return analyzer.analyze_vinyl_pricing(scraped_data)

if __name__ == "__main__":
    # Example usage
    test_data = {
        'title': 'The Beatles - Abbey Road (1969 UK Pressing)',
        'price': '$45.99',
        'condition': 'Very Good+',
        'year': '1969',
        'country': 'UK'
    }
    
    analysis = analyze_vinyl_pricing(test_data)
    print("Pricing Analysis:")
    print(f"Scraped Price: ${analysis.scraped_price}")
    print(f"Recommended Price: ${analysis.recommended_price}")
    print(f"Price Range: ${analysis.price_range['low']} - ${analysis.price_range['high']}")
    print(f"Market Trend: {analysis.market_trend}")
    print(f"Confidence: {analysis.confidence_score:.1%}")
    print(f"Arbitrage Opportunity: {analysis.arbitrage_opportunity}")