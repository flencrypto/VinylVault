---
name: vinyl-pricing-intelligence
description: 'Intelligent pricing analysis for vinyl records using historical data, condition grading, and AI-powered market insights. USE FOR: pricing vinyl records accurately, comparing against historical sales, analyzing market trends, generating pricing recommendations. DO NOT USE FOR: general pricing calculations, non-vinyl items, manual price entry.'
---

# Vinyl Pricing Intelligence Skill

## Purpose

This skill provides sophisticated pricing analysis for vinyl records by combining web-scraped data with historical sales data, condition grading, and AI-powered market insights. It bridges the gap between raw scraping data and intelligent deal-finding by providing accurate, defensible pricing recommendations.

## Workflow

### 1. Data Enrichment
- Extract release details from scraped data (artist, title, year, country)
- Cross-reference with Discogs database for release-specific information
- Normalize condition grading across different platforms
- Identify pressing variations and regional differences

### 2. Historical Analysis
- Query Discogs API for historical sales data
- Filter by matching condition, pressing, and region
- Calculate price trends and market averages
- Identify seasonal patterns and market fluctuations

### 3. AI-Powered Analysis
- Use Grok AI via XAI API to analyze market trends
- Factor in rarity, demand, and collector interest
- Consider current market conditions and economic factors
- Generate pricing recommendations with confidence scores

### 4. Pricing Recommendation
- Generate defensible asking price based on analysis
- Provide pricing range (low, medium, high)
- Include provenance metadata and justification
- Flag arbitrage opportunities

## Integration Points

This skill integrates with:
- **Vinyl Web Scraping Skill**: Processes scraped listing data
- **Discogs Service**: Accesses historical sales data
- **XAI/Grok API**: Provides AI-powered market analysis
- **Deal Finder**: Identifies underpriced opportunities
- **Collection Management**: Updates record valuations

## Usage Examples

```python
from pricing_intelligence import analyze_vinyl_pricing

scraped_data = {
    'title': 'The Beatles - Abbey Road',
    'condition': 'Very Good+',
    'price': '$45.99',
    'year': '1969',
    'country': 'UK'
}

analysis = analyze_vinyl_pricing(scraped_data)
print(f"Recommended price: {analysis['recommended_price']}")
print(f"Market trend: {analysis['market_trend']}")
```

## Data Points Analyzed

- **Release Details**: Artist, title, year, country, label
- **Condition Grading**: Mint, Near Mint, Very Good, Good, Poor
- **Historical Prices**: Last sold prices, price trends
- **Market Factors**: Rarity, demand, collector interest
- **Current Market**: Economic conditions, seasonal trends

## Best Practices

- Always validate scraped data against Discogs database
- Use multiple data sources for price validation
- Consider regional pricing differences
- Factor in shipping costs and seller reputation
- Update pricing recommendations regularly

## Security Considerations

- Handle API keys securely
- Cache historical data to reduce API calls
- Implement rate limiting for external APIs
- Validate all external data sources