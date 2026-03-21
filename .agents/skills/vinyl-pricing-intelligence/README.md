# Vinyl Pricing Intelligence Skill

Intelligent pricing analysis for vinyl records using historical data, condition grading, and AI-powered market insights.

## Installation

Install required dependencies:

```bash
pip install requests
```

## API Configuration

Set up API keys for enhanced functionality:

```python
import os

# Discogs API (optional)
os.environ['DISCOGS_TOKEN'] = 'your_discogs_token'

# XAI API for Grok AI (optional)
os.environ['XAI_API_KEY'] = 'your_xai_api_key'
```

## Usage

### Basic Usage

```python
from pricing_intelligence import analyze_vinyl_pricing

scraped_data = {
    'title': 'The Beatles - Abbey Road (1969 UK Pressing)',
    'price': '$45.99',
    'condition': 'Very Good+',
    'year': '1969',
    'country': 'UK'
}

analysis = analyze_vinyl_pricing(scraped_data)

print(f"Recommended Price: ${analysis.recommended_price}")
print(f"Market Trend: {analysis.market_trend}")
print(f"Arbitrage Opportunity: {analysis.arbitrage_opportunity}")
```

### Advanced Usage with APIs

```python
from pricing_intelligence import VinylPricingAnalyzer

# Create analyzer with API keys
analyzer = VinylPricingAnalyzer(
    discogs_token='your_token',
    xai_api_key='your_key'
)

# Analyze multiple records
records = [
    {'title': 'Pink Floyd - Dark Side of the Moon', 'price': '$35.50', 'condition': 'Near Mint'},
    {'title': 'Led Zeppelin - IV', 'price': '$42.99', 'condition': 'Very Good+'}
]

for record in records:
    analysis = analyzer.analyze_vinyl_pricing(record)
    print(f"{record['title']}: ${analysis.recommended_price}")
```

## Analysis Factors

The skill considers multiple factors for accurate pricing:

### Condition Grading
- **Mint**: 100% value
- **Near Mint**: 90% value  
- **Very Good+**: 80% value
- **Very Good**: 70% value
- **Good**: 60% value
- **Fair**: 40% value
- **Poor**: 20% value

### Historical Data
- Last sold prices for similar items
- Price trends over time
- Regional pricing differences
- Seasonal fluctuations

### AI Insights (via Grok/XAI)
- Market demand analysis
- Collector interest levels
- Rarity assessment
- Economic factors
- Market sentiment

## Integration Points

This skill integrates seamlessly with:

### Vinyl Web Scraping Skill
```python
from scrape_vinyl_listings import scrape_vinyl_listings
from pricing_intelligence import analyze_vinyl_pricing

# Scrape and analyze in one workflow
urls = ["https://www.ebay.com/itm/vinyl-record"]
scraped_results = scrape_vinyl_listings(urls)

for result in scraped_results:
    analysis = analyze_vinyl_pricing(result)
    if analysis.arbitrage_opportunity:
        print(f"ARBITRAGE FOUND: {result['title']}")
```

### Deal Finder
- Identifies underpriced opportunities
- Provides confidence scores for decisions
- Flags high-potential arbitrage deals

### Collection Management
- Updates record valuations
- Tracks market trends
- Provides insurance value estimates

## Output Metrics

Each analysis returns comprehensive metrics:

- **recommended_price**: Defensible asking price
- **price_range**: Low/medium/high pricing range
- **market_trend**: Rising/falling/stable market
- **confidence_score**: 0-1 confidence in analysis
- **historical_comparisons**: Similar historical sales
- **ai_insights**: AI-powered market analysis
- **arbitrage_opportunity**: True if significant undervaluation

## Example Output

```json
{
  "scraped_price": 45.99,
  "recommended_price": 52.50,
  "price_range": {
    "low": 42.00,
    "medium": 52.50,
    "high": 63.00
  },
  "market_trend": "rising",
  "confidence_score": 0.85,
  "arbitrage_opportunity": true,
  "historical_comparisons": [
    {"price": 48.75, "condition": "Near Mint", "date": "2024-02-20"},
    {"price": 42.50, "condition": "Very Good+", "date": "2024-01-15"}
  ],
  "ai_insights": {
    "demand_level": "high",
    "rarity_factor": 1.5,
    "market_sentiment": "positive"
  }
}
```

## Best Practices

1. **Validate Data**: Always validate scraped data before analysis
2. **Use Multiple Sources**: Combine Discogs API with AI insights
3. **Consider Regional Differences**: Account for country-specific pricing
4. **Update Regularly**: Market conditions change frequently
5. **Document Decisions**: Keep records of pricing justifications

## Troubleshooting

### Common Issues

1. **No Historical Data**: Skill uses fallback pricing based on condition
2. **API Rate Limits**: Implement caching for frequent analyses
3. **Condition Mismatch**: Normalizes conditions across platforms
4. **Currency Differences**: Handles currency conversion

### Debug Mode

Enable detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```