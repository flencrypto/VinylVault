# Web Scraping Integration Guide

This guide explains how the web scraping agent has been integrated into VinylVault's deal finding system.

## Overview

The web scraping integration provides an alternative to API-based deal finding with advanced features:
- **Anti-detection measures**: Avoid being blocked by marketplaces
- **Proxy rotation**: Rotate IP addresses to prevent rate limiting
- **Human-like behavior**: Simulate real user interactions
- **Multiple marketplaces**: Scrape eBay, Discogs, and Amazon
- **Real-time monitoring**: Live scraping with configurable intervals

## Architecture

### Frontend Components

1. **`web-scraping-service.js`** - JavaScript service that bridges frontend with Python scraper
2. **`web-scraping-settings.js`** - UI component for configuring scraping settings
3. **Enhanced `deal-scanner.js`** - Integrated scraping into existing deal scanning logic
4. **Enhanced `deal-finder.js`** - Added scraping methods for manual deal finding

### Backend Components

1. **`advanced_web_scraper.py`** - Main Python scraper with anti-detection features
2. **`vinyl_scraper_example.py`** - Vinyl-specific scraping implementation
3. **`scraper_api.py`** - Flask API server for frontend communication
4. **`scraper_config.json`** - Configuration templates

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd tools/
pip install -r requirements.txt
playwright install chromium
```

### 2. Start the API Server

**Option 1: Windows Batch File**
```cmd
tools\start_scraper_api.bat
```

**Option 2: Manual Start**
```bash
cd tools/
python scraper_api.py
```

The server will run on `http://localhost:5000`

### 3. Configure in VinylVault

1. Open VinylVault Settings
2. Navigate to the "Web Scraping" section
3. Enable web scraping
4. Configure anti-detection settings
5. Add proxy servers if needed
6. Save settings

## Usage

### Automatic Deal Scanning

The deal scanner will automatically use web scraping when:
- Web scraping is enabled in settings
- The API server is running
- API-based services fail or are unavailable

### Manual Deal Finding

Use the enhanced deal-finder component:

```javascript
// Scrape a specific marketplace
const deals = await dealFinder.scrapeMarketplaceDeals(
  "The Beatles", 
  "Abbey Road", 
  "ebay", 
  20
);

// Scrape all marketplaces
const allDeals = await dealFinder.scrapeAllMarketplaces(
  "Pink Floyd", 
  "Dark Side of the Moon", 
  10
);
```

### API Endpoints

The Python API server provides these endpoints:

- `POST /api/scrape` - Scrape specific marketplace
- `POST /api/scrape/multiple` - Scrape multiple marketplaces
- `GET /api/status` - API status
- `GET /api/config` - Get configuration
- `POST /api/config` - Update configuration

## Configuration Options

### Anti-Detection Settings

- **User-Agent Rotation**: Rotate browser fingerprints
- **Random Delays**: 2-5 second delays between requests
- **Human Mouse Movements**: Simulate natural cursor movements
- **Proxy Rotation**: Rotate through proxy servers

### Performance Settings

- **Max Retries**: Number of retry attempts (1-10)
- **Timeout**: Request timeout in seconds (10-120)
- **Caching**: Cache responses to avoid duplicate requests
- **Concurrent Requests**: Parallel scraping (future enhancement)

### Marketplace Settings

- **eBay**: Vinyl records category (176985)
- **Discogs**: Release search with condition filtering
- **Amazon**: Music category with vinyl filtering

## Integration Points

### Deal Scanner Integration

The `deal-scanner.js` now includes web scraping as a fallback:

```javascript
// Web scraping fallback logic
if (window.webScrapingService && window.webScrapingService.isAvailable) {
    // Use web scraping for this record
    const listings = await window.webScrapingService.scrapeEbayVinyl(query, 10);
    // Process listings...
}
```

### Settings Integration

Web scraping settings are stored in localStorage:
- `web_scraping_enabled` - Enable/disable scraping
- `web_scraping_proxy_enabled` - Enable proxy rotation
- `web_scraping_proxy_list` - List of proxy servers
- `web_scraping_anti_detection` - Anti-detection measures

## Error Handling

The integration includes robust error handling:

1. **API Server Down**: Falls back to mock data or API methods
2. **Scraping Failed**: Continues with other marketplaces
3. **Rate Limited**: Implements exponential backoff
4. **Proxy Failure**: Rotates to next available proxy

## Security Considerations

- **Output Sanitization**: Removes sensitive data from logs
- **Credential Protection**: Stores API keys securely
- **Rate Limiting**: Respects marketplace rate limits
- **Legal Compliance**: Follows robots.txt and terms of service

## Performance Optimization

### Caching
- Response caching to avoid duplicate requests
- Configurable cache duration
- Automatic cache invalidation

### Memory Management
- Real-time memory monitoring
- Automatic cleanup of unused resources
- Configurable memory limits

### Proxy Management
- Health checks for proxy servers
- Automatic proxy rotation
- Fallback to direct connection

## Troubleshooting

### Common Issues

1. **API Server Not Starting**
   - Check Python installation
   - Verify port 5000 is available
   - Check firewall settings

2. **Scraping Fails**
   - Verify internet connection
   - Check proxy server availability
   - Review anti-detection settings

3. **Rate Limited**
   - Increase delays between requests
   - Add more proxy servers
   - Reduce concurrent requests

### Debug Mode

Enable debug logging in the web scraping settings to see detailed request/response information.

## Future Enhancements

- **More Marketplaces**: Add support for additional vinyl marketplaces
- **Advanced CAPTCHA Solving**: Integrate with CAPTCHA solving services
- **Machine Learning**: Use ML for better deal detection
- **Real-time Alerts**: Push notifications for hot deals
- **Batch Processing**: Scrape multiple records simultaneously

## Legal Notice

Always respect marketplace terms of service and robots.txt files. Use this integration responsibly and ethically.