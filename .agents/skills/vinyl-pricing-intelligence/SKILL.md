---
name: vinyl-pricing-intelligence
description: 'Enhanced intelligent pricing analysis for vinyl records using ML patterns, weighted factors, and comprehensive market intelligence. USE FOR: sophisticated vinyl pricing, arbitrage detection, risk assessment, market trend analysis, investment recommendations. DO NOT USE FOR: general pricing calculations, non-vinyl items, manual price entry.'
---

# Enhanced Vinyl Pricing Intelligence Skill

## Purpose

This enhanced skill provides sophisticated pricing analysis for vinyl records using machine learning patterns, weighted pricing factors, and comprehensive market intelligence. It goes beyond basic pricing to include arbitrage scoring, risk assessment, and investment recommendations.

## Enhanced Features

### 1. Advanced Data Normalization
- Enhanced price parsing with currency detection
- Fuzzy matching for condition grading
- Genre and label detection with prestige multipliers
- Age-based rarity factors with realistic scaling

### 2. ML-Powered Market Analysis
- Linear regression for trend analysis
- Market trend classification (strong_rising, rising, stable, falling, strong_falling)
- Volatility assessment using statistical methods
- Seasonal factor adjustments

### 3. Weighted Pricing Factors
- **Condition (30%)**: Fine-grained grading with 8 levels
- **Genre (20%)**: Genre-specific base pricing
- **Age (15%)**: Realistic age-based multipliers
- **Label Prestige (15%)**: Prestigious label recognition
- **Country (10%)**: Regional pricing adjustments
- **Market Trend (10%)**: Current market dynamics

### 4. Enhanced Arbitrage Detection
- Arbitrage scoring (0-1) based on profit margin
- Absolute profit consideration
- Confidence-based opportunity thresholds
- Risk-adjusted arbitrage recommendations

### 5. Comprehensive Risk Assessment
- Market volatility analysis
- Liquidity assessment by genre
- Condition risk evaluation
- Overall risk scoring

### 6. Market Intelligence
- Genre-specific market trends
- Investment advice based on factors
- Market timing recommendations
- Collector interest analysis

## Integration Points

This skill integrates with:
- **Vinyl Web Scraping Skill**: Processes enhanced scraped data
- **Discogs Service**: Accesses historical sales data
- **XAI/Grok API**: Provides AI-powered market analysis
- **Deal Finder**: Enhanced arbitrage detection with scoring
- **Collection Management**: Comprehensive record valuations

## Usage Examples

```python
from pricing_intelligence import analyze_vinyl_pricing

scraped_data = {
    'title': 'Heliodor HS 2527 Classical LP',
    'condition': 'Very Good+',
    'price': '$25.00',
    'year': '1960',
    'country': 'England',
    'label': 'Heliodor',
    'genre': 'Classical'
}

analysis = analyze_vinyl_pricing(scraped_data)
print(f"Recommended price: ${analysis.recommended_price}")
print(f"Arbitrage score: {analysis.arbitrage_score:.1%}")
print(f"Risk assessment: {analysis.risk_assessment['overall']}")
```

## Enhanced Data Points Analyzed

- **Enhanced Release Details**: Artist, title, year, country, label, format
- **Advanced Condition Grading**: 8-level system with finer granularity
- **Historical Analysis**: ML-powered trend detection
- **Market Intelligence**: Genre trends, investment advice, timing
- **Risk Factors**: Volatility, liquidity, condition risks
- **Pricing Factors**: Weighted factors influencing final price

## Best Practices

- Use enhanced data normalization for accurate parsing
- Consider all weighted factors in pricing decisions
- Monitor market trends with ML-powered analysis
- Assess risk before pursuing arbitrage opportunities
- Update pricing models regularly based on market changes

## Security Considerations

- Enhanced API key management
- Statistical analysis reduces dependency on external APIs
- Comprehensive error handling for data validation
- Cache market intelligence for performance