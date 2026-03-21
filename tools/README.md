# Web Scraper Agent

A sophisticated web scraping agent with anti-detection measures, proxy rotation, and human-like behavior simulation.

## Features

- **Anti-detection measures**: User-Agent rotation, random delays, human-like mouse movements
- **Proxy management**: Support for proxy rotation and TOR network
- **CAPTCHA handling**: Integration with CAPTCHA solving services
- **Memory monitoring**: Real-time memory usage tracking
- **Error handling**: Exponential backoff and retry logic
- **Caching**: Response caching for performance
- **Security**: Output sanitization and credential protection

## Quick Start

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
playwright install chromium
```

2. Run the example:
```bash
python example_usage.py
```

### Basic Usage

```python
from advanced_web_scraper import create_scraper_agent
import asyncio

async def main():
    agent = create_scraper_agent(
        url="https://example.com",
        headless=True,
        rotate_user_agent=True
    )
    
    await agent.initialize()
    content = await agent.scrape()
    await agent.close()

asyncio.run(main())
```

## Configuration Options

### Basic Configuration

```python
agent = create_scraper_agent(
    url="https://target-site.com",
    headless=True,                    # Run browser in background
    browser_type="chromium",          # chromium, firefox, webkit
    rotate_user_agent=True,           # Rotate User-Agent strings
    random_delays=True,               # Add random delays between requests
    min_delay=2.0,                    # Minimum delay in seconds
    max_delay=5.0,                    # Maximum delay in seconds
    human_mouse_movements=True        # Simulate human mouse movements
)
```

### Advanced Configuration

```python
agent = create_scraper_agent(
    url="https://target-site.com",
    use_proxy=True,                   # Enable proxy usage
    proxy_list=[                      # List of proxies for rotation
        "http://proxy1:8080",
        "http://proxy2:8080"
    ],
    proxy_rotation=True,              # Rotate proxies
    use_anticaptcha=True,             # Enable CAPTCHA solving
    anticaptcha_api_key="YOUR_KEY",   # CAPTCHA service API key
    cache_responses=True,             # Cache responses
    exponential_backoff=True,         # Exponential backoff on errors
    max_retries=5,                    # Maximum retry attempts
    monitor_memory=True               # Monitor memory usage
)
```

## Platform-Specific Examples

### eBay Scraping

```python
agent = create_scraper_agent(
    url="https://www.ebay.com/sch/i.html?_nkw=vinyl+records",
    headless=True,
    rotate_user_agent=True,
    random_delays=True,
    min_delay=3.0,
    max_delay=7.0,
    human_mouse_movements=True
)

# Scrape specific elements
product_titles = await agent.scrape(selector=".s-item__title")
product_prices = await agent.scrape(selector=".s-item__price")
```

### Amazon Scraping

```python
agent = create_scraper_agent(
    url="https://www.amazon.com/dp/PRODUCT_ID",
    headless=True,
    rotate_user_agent=True,
    use_proxy=True,                    # Amazon has strong anti-bot measures
    proxy_rotation=True
)

product_title = await agent.scrape(selector="#productTitle")
product_price = await agent.scrape(selector=".a-price-whole")
```

## Anti-Detection Features

### User-Agent Rotation

The agent automatically rotates between different User-Agent strings to avoid fingerprinting:
- Chrome (Windows/Mac/Linux)
- Firefox (Windows/Mac/Linux)  
- Safari (Mac)
- Edge (Windows)

### Human-Like Behavior

- **Random delays**: 2-5 seconds between actions
- **Mouse movements**: Human-like cursor wandering
- **Typing speed**: Variable typing speed with delays
- **Click behavior**: Natural click patterns

### Proxy Management

- **Proxy rotation**: Automatic rotation between multiple proxies
- **TOR support**: Integration with TOR network
- **Proxy validation**: Health checks for proxy servers

## Error Handling

### Exponential Backoff

The agent implements exponential backoff with jitter for failed requests:

```python
# Retry logic with exponential backoff
for attempt in range(max_retries):
    try:
        # Attempt scraping
        content = await agent.scrape()
        break
    except Exception as e:
        if attempt < max_retries - 1:
            wait_time = min(2 ** attempt, 30)  # Cap at 30 seconds
            wait_time *= random.uniform(0.5, 1.5)  # Add jitter
            await asyncio.sleep(wait_time)
        else:
            raise
```

### Memory Monitoring

Monitor memory usage during long scraping sessions:

```python
agent = create_scraper_agent(
    monitor_memory=True,
    # ... other config
)

# Memory usage is logged automatically
# [MEMORY] Current: 245.67 MB
```

## Security Considerations

### Output Sanitization

All output is sanitized to remove sensitive information:
- API keys
- Passwords
- Tokens
- Personal information

### Credential Storage

Store credentials in environment variables:

```python
import os

agent = create_scraper_agent(
    anticaptcha_api_key=os.getenv("CAPTCHA_API_KEY"),
    store_credentials_env=True
)
```

## Performance Optimization

### Response Caching

Cache responses to avoid redundant requests:

```python
agent = create_scraper_agent(
    cache_responses=True,
    # ... other config
)

# Subsequent requests to same URL will use cache
content = await agent.scrape(url="https://example.com")
```

### Parallel Processing

For multiple URLs, use asyncio for parallel processing:

```python
import asyncio

async def scrape_url(url):
    agent = create_scraper_agent(url=url)
    await agent.initialize()
    content = await agent.scrape()
    await agent.close()
    return content

urls = ["https://site1.com", "https://site2.com", "https://site3.com"]
results = await asyncio.gather(*[scrape_url(url) for url in urls])
```

## Troubleshooting

### Common Issues

1. **Browser not found**: Run `playwright install chromium`
2. **Proxy connection failed**: Check proxy server availability
3. **CAPTCHA detection**: Enable CAPTCHA solving service
4. **Memory leaks**: Enable memory monitoring

### Debug Mode

Enable detailed logging:

```python
agent = create_scraper_agent(
    log_requests=True,
    on_request=lambda req: print(f"Request: {req.url}"),
    on_response=lambda res: print(f"Response: {res.status}"),
    on_error=lambda err: print(f"Error: {err}")
)
```

## Legal Considerations

- Respect robots.txt files
- Follow website terms of service
- Implement rate limiting
- Use responsibly and ethically

## License

This project is part of the VinylVault application. See the main project LICENSE for details.