import asyncio
import random
import time
import hashlib
import os
from dataclasses import dataclass, field
from typing import Optional, Callable
from urllib.parse import urlparse
from playwright.async_api import async_playwright, Page, Browser, Playwright

# Configuration dataclass for user-defined parameters
@dataclass
class ScraperConfig:
    # Target URL
    url: str = ""

    # Browser settings
    headless: bool = True
    browser_type: str = "chromium"  # chromium, firefox, webkit

    # Anti-detection settings
    rotate_user_agent: bool = True
    use_tor: bool = False
    tor_proxy: str = "socks5://localhost:9050"
    random_delays: bool = True
    min_delay: float = 2.0
    max_delay: float = 5.0
    human_mouse_movements: bool = True

    # Proxy settings
    use_proxy: bool = False
    proxy_server: str = ""
    proxy_rotation: bool = False
    proxy_list: list = field(default_factory=list)

    # Anti-Captcha settings
    use_anticaptcha: bool = False
    anticaptcha_api_key: str = ""
    solve_visual: bool = False

    # Overlay handling
    custom_timeout: int = 30
    handle_dynamic: bool = True
    check_invisible_overlays: bool = True

    # Security
    store_credentials_env: bool = True
    sanitize_output: bool = True
    log_requests: bool = True

    # Performance
    parallel_requests: bool = False
    max_concurrent: int = 3
    cache_responses: bool = False
    cache: dict = field(default_factory=dict)
    exponential_backoff: bool = True
    max_retries: int = 3
    monitor_memory: bool = False

    # Callbacks
    on_request: Optional[Callable] = None
    on_response: Optional[Callable] = None
    on_error: Optional[Callable] = None


class WebScraperAgent:
    """Configurable web scraper agent with anti-detection measures."""

    # Common User-Agent strings for rotation
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    ]

    def __init__(self, config: ScraperConfig):
        self.config = config
        self.playwright: Optional[Playwright] = None
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.session_cookies: dict = {}
        self.proxy_index = 0
        self.request_count = 0
        self.memory_samples: list = []

    async def initialize(self):
        """Initialize the scraper with configured settings."""
        self.playwright = await async_playwright().start()

        # Select browser type
        browser_launcher = getattr(self.playwright, self.config.browser_type)

        # Configure launch options
        launch_options = {
            "headless": self.config.headless,
        }

        # Configure proxy if enabled
        if self.config.use_proxy:
            proxy = self._get_next_proxy()
            launch_options["proxy"] = {"server": proxy}

        # Launch browser
        self.browser = await browser_launcher.launch(**launch_options)

        # Create new context with anti-detection settings
        context = await self.browser.new_context(
            user_agent=self._get_random_user_agent() if self.config.rotate_user_agent else None,
            viewport={"width": 1920, "height": 1080},
            locale="en-US",
        )

        self.page = await context.new_page()

        # Set up event listeners
        if self.config.handle_dynamic:
            self.page.on("response", self._handle_response)

        if self.config.log_requests:
            self.page.on("request", self._log_request)

        if self.config.monitor_memory:
            self._start_memory_monitoring()

    def _get_random_user_agent(self) -> str:
        """Rotate User-Agent strings (randomize OS/Browser versions)."""
        return random.choice(self.USER_AGENTS)

    def _get_next_proxy(self) -> str:
        """Get next proxy from rotation list."""
        if not self.config.proxy_list:
            return self.config.proxy_server

        proxy = self.config.proxy_list[self.proxy_index]
        self.proxy_index = (self.proxy_index + 1) % len(self.config.proxy_list)
        return proxy

    async def _random_delay(self):
        """Implement randomized delays (2-5s between requests)."""
        if self.config.random_delays:
            delay = random.uniform(self.config.min_delay, self.config.max_delay)
            await asyncio.sleep(delay)

    async def _human_mouse_movements(self):
        """Mimic human-like mouse movements."""
        if self.config.human_mouse_movements:
            # Random starting position
            x, y = random.randint(100, 800), random.randint(100, 600)
            await self.page.mouse.move(x, y)

            # Simulate human-like wandering
            for _ in range(random.randint(5, 15)):
                dx = random.randint(-100, 100)
                dy = random.randint(-100, 100)
                x = max(0, min(1920, x + dx))
                y = max(0, min(1080, y + dy))
                await self.page.mouse.move(x, y, steps=random.randint(5, 10))

    async def _handle_response(self, response):
        """Handle dynamic loading with page.on('response') event listener."""
        if self.config.on_response:
            await self.config.on_response(response)

    async def _log_request(self, request):
        """Log all requests/responses for debugging."""
        self.request_count += 1
        if self.config.log_requests:
            sanitized_url = self._sanitize_output(request.url)
            print(f"[REQUEST {self.request_count}] {sanitized_url}")

        if self.config.on_request:
            await self.config.on_request(request)

    def _sanitize_output(self, data: str) -> str:
        """Sanitize all output before logging/display."""
        if not self.config.sanitize_output:
            return data

        # Remove sensitive information patterns
        sensitive_patterns = [
            (r'api[_-]?key["\']?\s*[:=]\s*["\']?[\w-]+', 'api_key=***'),
            (r'password["\']?\s*[:=]\s*["\']?[^\s"\'&]+', 'password=***'),
            (r'token["\']?\s*[:=]\s*["\']?[\w-]+', 'token=***'),
        ]

        sanitized = data
        for pattern, replacement in sensitive_patterns:
            import re
            sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)

        return sanitized

    async def _check_overlays(self):
        """Detect invisible overlays with CSS selector checking."""
        if not self.config.check_invisible_overlays:
            return

        # Check for display:none elements
        invisible_elements = await self.page.evaluate("""
            () => {
                const elements = document.querySelectorAll('*');
                const invisible = [];
                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                        invisible.push(el.className || el.id || el.tagName);
                    }
                });
                return invisible;
            }
        """)

        if invisible_elements:
            print(f"[OVERLAY] Detected {len(invisible_elements)} invisible elements")

    async def _wait_for_overlays(self):
        """Wait for overlays to disappear using wait_for_selector."""
        try:
            # Wait for common overlay selectors to be hidden
            overlay_selectors = [
                ".cookie-banner",
                ".modal",
                ".popup",
                "#cookieConsent",
                ".overlay",
                "[class*='overlay']",
            ]

            for selector in overlay_selectors:
                try:
                    await self.page.wait_for_selector(
                        selector,
                        state="hidden",
                        timeout=self.config.custom_timeout * 1000
                    )
                except Exception:
                    pass  # Selector not found, continue
        except Exception as e:
            if self.config.on_error:
                await self.config.on_error(e)

    async def _exponential_backoff(self, attempt: int):
        """Implement exponential backoff for failed requests."""
        if self.config.exponential_backoff:
            wait_time = min(2 ** attempt, 30)  # Cap at 30 seconds
            wait_time *= random.uniform(0.5, 1.5)  # Add jitter
            await asyncio.sleep(wait_time)

    def _check_cache(self, url: str) -> Optional[str]:
        """Check cache for identical URLs."""
        if not self.config.cache_responses:
            return None

        url_hash = hashlib.md5(url.encode()).hexdigest()
        return self.config.cache.get(url_hash)

    def _add_to_cache(self, url: str, content: str):
        """Add response to cache."""
        if self.config.cache_responses:
            url_hash = hashlib.md5(url.encode()).hexdigest()
            self.config.cache[url_hash] = content

    def _start_memory_monitoring(self):
        """Monitor memory usage during long-running processes."""
        import psutil
        process = psutil.Process()

        def sample_memory():
            memory_mb = process.memory_info().rss / 1024 / 1024
            self.memory_samples.append(memory_mb)
            print(f"[MEMORY] Current: {memory_mb:.2f} MB")

        # Schedule periodic memory sampling
        import threading
        self._memory_timer = threading.Timer(5.0, lambda: (sample_memory(), self._start_memory_monitoring()))
        self._memory_timer.start()

    async def _solve_captcha_if_needed(self):
        """Use specialized services like 2Captcha or CapSolver."""
        if not self.config.use_anticaptcha:
            return

        # Check for CAPTCHA presence
        captcha_selectors = [
            ".captcha",
            "#captcha",
            "[class*='captcha']",
            "iframe[src*='captcha']",
        ]

        for selector in captcha_selectors:
            captcha_element = await self.page.query_selector(selector)
            if captcha_element:
                print("[CAPTCHA] CAPTCHA detected - solving...")
                # Here you would integrate with 2Captcha/CapSolver API
                # This is a placeholder for the actual implementation
                if self.config.anticaptcha_api_key:
                    # Call CAPTCHA solving service
                    pass

    async def scrape(self, url: str = None, selector: str = None) -> str:
        """
        Main scraping method with all configured parameters.

        Args:
            url: Target URL (overrides config)
            selector: CSS selector to extract (optional)

        Returns:
            Scraped content as string
        """
        target_url = url or self.config.url
        if not target_url:
            raise ValueError("No URL provided")

        # Check cache first
        cached = self._check_cache(target_url)
        if cached:
            print(f"[CACHE] Returning cached response for {target_url}")
            return cached

        # Retry logic with exponential backoff
        for attempt in range(self.config.max_retries):
            try:
                # Random delay before request
                await self._random_delay()

                # Navigate to page
                await self.page.goto(target_url, wait_until="networkidle")

                # Handle overlays
                await self._wait_for_overlays()

                # Check for invisible overlays
                await self._check_overlays()

                # Check and solve CAPTCHAs
                await self._solve_captcha_if_needed()

                # Human-like mouse movements
                await self._human_mouse_movements()

                # Extract content
                if selector:
                    content = await self.page.query_selector_eval(selector, "el => el.innerText")
                else:
                    content = await self.page.content()

                # Apply rotation for next request if enabled
                if self.config.rotate_user_agent:
                    await self.page.set_extra_http_headers({
                        "User-Agent": self._get_random_user_agent()
                    })

                # Rotate proxy if enabled
                if self.config.proxy_rotation and self.config.use_proxy:
                    new_proxy = self._get_next_proxy()
                    # Apply new proxy (implementation depends on Playwright version)

                # Add to cache
                self._add_to_cache(target_url, content)

                if self.config.log_requests:
                    print(f"[SUCCESS] Scraped {len(content)} characters from {target_url}")

                return content

            except Exception as e:
                if self.config.on_error:
                    await self.config.on_error(e)

                print(f"[ERROR] Attempt {attempt + 1} failed: {str(e)}")

                if attempt < self.config.max_retries - 1:
                    await self._exponential_backoff(attempt)
                else:
                    raise

    async def click(self, selector: str):
        """Human-like click on an element."""
        await self._human_mouse_movements()
        await self.page.click(selector)
        await self._random_delay()

    async def type_text(self, selector: str, text: str, slow: bool = True):
        """Human-like text input."""
        await self.page.click(selector)
        if slow:
            for char in text:
                await self.page.keyboard.type(char, delay=random.randint(50, 150))
        else:
            await self.page.type(selector, text)

    async def get_cookies(self) -> dict:
        """Get session cookies."""
        cookies = await self.page.context.cookies()
        return {cookie["name"]: cookie["value"] for cookie in cookies}

    async def set_cookies(self, cookies: dict):
        """Set session cookies for maintaining session across requests."""
        for name, value in cookies.items():
            await self.page.context.add_cookies([{
                "name": name,
                "value": value,
                "domain": urlparse(self.config.url).netloc,
            }])

    async def close(self):
        """Clean up resources."""
        if hasattr(self, '_memory_timer'):
            self._memory_timer.cancel()

        if self.page:
            await self.page.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

        if self.config.monitor_memory and self.memory_samples:
            avg_memory = sum(self.memory_samples) / len(self.memory_samples)
            print(f"[MEMORY] Average: {avg_memory:.2f} MB")


# Factory function for easy agent creation
def create_scraper_agent(**kwargs) -> WebScraperAgent:
    """
    Create a configured web scraper agent.

    Example usage:
        agent = create_scraper_agent(
            url="https://example.com",
            headless=True,
            rotate_user_agent=True,
            random_delays=True,
            use_proxy=True,
            proxy_list=["http://proxy1:port", "http://proxy2:port"],
        )
    """
    config = ScraperConfig(**kwargs)
    return WebScraperAgent(config)


# Example usage
async def main():
    # Create agent with custom parameters
    agent = create_scraper_agent(
        url="https://example.com",
        headless=True,
        browser_type="chromium",
        rotate_user_agent=True,
        random_delays=True,
        min_delay=2.0,
        max_delay=5.0,
        human_mouse_movements=True,
        use_proxy=False,
        check_invisible_overlays=True,
        custom_timeout=30,
        cache_responses=True,
        exponential_backoff=True,
        max_retries=3,
        log_requests=True,
    )

    try:
        await agent.initialize()

        # Scrape content
        content = await agent.scrape()
        print(f"Scraped {len(content)} characters")

        # Or scrape specific element
        # content = await agent.scrape(selector="div.main-content")

    finally:
        await agent.close()


if __name__ == "__main__":
    asyncio.run(main())