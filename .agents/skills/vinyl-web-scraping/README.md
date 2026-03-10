# Vinyl Web Scraping Skill

Automated web scraping for vinyl record listings from eBay, Discogs, and other marketplaces.

## Installation

Install required dependencies:

```bash
pip install playwright
playwright install
```

## Usage

### Basic Usage

```python
from scrape_vinyl_listings import scrape_vinyl_listings

urls = [
    "https://www.ebay.com/itm/123456789",
    "https://www.discogs.com/sell/item/987654321"
]

results = scrape_vinyl_listings(urls)

for result in results:
    print(f"Title: {result.get('title')}")
    print(f"Price: {result.get('price')}")
    print(f"Condition: {result.get('condition')}")
```

### Advanced Usage with Custom Settings

```python
from scrape_vinyl_listings import VinylScraper

# Create scraper with custom settings
scraper = VinylScraper(headless=False)  # Show browser window

# Scrape specific URLs
results = scraper.scrape_vinyl_listings(["https://www.ebay.com/itm/example"])
```

## Supported Platforms

- **eBay**: Extracts title, price, condition, seller information
- **Discogs**: Extracts title, price, condition

## Data Points Extracted

- **Title**: Record title and artist information
- **Price**: Current listing price
- **Condition**: Record condition (Mint, Near Mint, Very Good, etc.)
- **Seller**: Seller information and feedback ratings
- **URL**: Original listing URL
- **Domain**: Source domain/platform

## Error Handling

The skill includes comprehensive error handling:
- Invalid URLs are automatically filtered
- Failed scrapes are logged with error details
- Retry logic with exponential backoff
- CAPTCHA and anti-bot measure detection

## Integration with VinylVault

This skill integrates seamlessly with VinylVault components:

- **Discogs Service**: Cross-reference scraped data
- **Price Charting Service**: Validate pricing
- **Deal Finder**: Identify arbitrage opportunities
- **Collection Management**: Add records to inventory

## Best Practices

1. **Rate Limiting**: Always include random delays (2-4 seconds)
2. **Respect Robots.txt**: Check platform scraping policies
3. **Data Validation**: Verify extracted data before processing
4. **Error Logging**: Monitor scraping failures for debugging

## Example Output

```json
{
  "url": "https://www.ebay.com/itm/123456789",
  "domain": "ebay.com",
  "title": "The Beatles - Abbey Road (1969 UK 1st Pressing)",
  "price": "$45.99",
  "condition": "Very Good+",
  "seller": "vinyl_collector_99 (99.8% Positive)"
}
```

## Troubleshooting

### Common Issues

1. **Browser not launching**: Ensure Playwright is properly installed
2. **No data extracted**: Check if selectors match current page structure
3. **CAPTCHA encountered**: Increase delays or use headless=false mode

### Debug Mode

Run with headless=false to see browser interactions:

```python
results = scrape_vinyl_listings(urls, headless=False)
```