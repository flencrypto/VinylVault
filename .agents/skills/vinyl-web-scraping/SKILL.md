---
name: vinyl-web-scraping
description: 'Automated web scraping for vinyl record listings from eBay and other marketplaces. USE FOR: scraping vinyl record data, extracting pricing information, automating deal discovery, collecting market data. DO NOT USE FOR: general web scraping unrelated to vinyl records, API-based data fetching, manual data entry.'
---

# Vinyl Web Scraping Skill

## Purpose

This skill provides automated web scraping capabilities specifically tailored for vinyl record marketplaces. It enables users to extract pricing data, condition information, and listing details from eBay and other vinyl-focused platforms to support the VinylVault application's deal-finding and pricing intelligence features.

## Workflow

### 1. URL Collection
- Gather target URLs for vinyl record listings
- Validate URLs are from supported marketplaces
- Handle pagination and search result navigation

### 2. Browser Automation Setup
- Configure Playwright browser with vinyl-specific user agent
- Set appropriate viewport and delays to mimic human behavior
- Implement error handling for failed page loads

### 3. Data Extraction
- Extract key vinyl-specific data points:
  - Record title and artist information
  - Pricing data (current price, shipping costs)
  - Condition grading (Mint, Near Mint, Very Good, etc.)
  - Seller information and feedback ratings
  - Listing duration and end times

### 4. Data Normalization
- Standardize condition ratings across platforms
- Convert currencies to base currency
- Normalize date formats and time zones
- Clean and validate extracted text data

### 5. Error Handling & Retry Logic
- Implement exponential backoff for failed requests
- Handle CAPTCHAs and anti-bot measures
- Log scraping failures for debugging
- Validate data completeness before returning results

## Usage Examples

```python
# Scrape multiple eBay vinyl listings
urls = [
    "https://www.ebay.com/itm/123456789",
    "https://www.ebay.com/itm/987654321"
]
results = scrape_vinyl_listings(urls)
```

## Integration Points

This skill integrates with:
- **Discogs Service**: Cross-reference scraped data with Discogs database
- **Price Charting Service**: Validate pricing against market averages
- **Deal Finder**: Identify underpriced opportunities
- **Collection Management**: Add scraped records to user's collection

## Best Practices

- Always respect robots.txt and rate limits
- Use random delays between requests (2-4 seconds)
- Handle dynamic content loading with proper wait conditions
- Implement proper error handling and logging
- Cache results to avoid duplicate scraping

## Security Considerations

- Avoid scraping personal or sensitive information
- Comply with platform terms of service
- Use proper authentication for authenticated endpoints
- Implement proper data sanitization