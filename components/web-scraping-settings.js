/**
 * WebScrapingSettings — UI component for configuring web scraping settings
 */

class WebScrapingSettings extends HTMLElement {
    constructor() {
        super();
        this.service = window.webScrapingService;
    }

    connectedCallback() {
        if (!this.shadowRoot) {
            this.attachShadow({ mode: "open" });
        }
        this.render();
        this.bindEvents();
    }

    render() {
        const status = this.service.getStatus();
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 1rem 0;
                }
                .settings-section {
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                }
                .settings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .settings-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #f8fafc;
                }
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 12px;
                    border-radius: 9999px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .status-badge.available {
                    background: #22c55e20;
                    color: #22c55e;
                }
                .status-badge.unavailable {
                    background: #ef444420;
                    color: #ef4444;
                }
                .settings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .setting-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #cbd5e1;
                }
                input, select {
                    background: #0f172a;
                    border: 1px solid #334155;
                    border-radius: 6px;
                    padding: 8px 12px;
                    color: #f8fafc;
                    font-size: 14px;
                }
                input:focus, select:focus {
                    outline: none;
                    border-color: #ec4899;
                }
                .checkbox-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .checkbox-group input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                }
                .actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                }
                button {
                    background: #ec4899;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 16px;
                    color: white;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                button:hover {
                    background: #db2777;
                }
                button.secondary {
                    background: #334155;
                }
                button.secondary:hover {
                    background: #475569;
                }
                .proxy-list {
                    background: #0f172a;
                    border: 1px solid #334155;
                    border-radius: 6px;
                    padding: 8px;
                    max-height: 100px;
                    overflow-y: auto;
                    font-family: monospace;
                    font-size: 12px;
                }
                .proxy-list:empty::before {
                    content: "No proxies configured";
                    color: #64748b;
                    font-style: italic;
                }
            </style>

            <div class="settings-section">
                <div class="settings-header">
                    <span class="settings-title">Web Scraping Settings</span>
                    <span class="status-badge ${status.available ? 'available' : 'unavailable'}">
                        ${status.available ? '✓ Available' : '✗ Unavailable'}
                    </span>
                </div>

                <div class="settings-grid">
                    <div class="setting-group">
                        <label>Enable Web Scraping</label>
                        <div class="checkbox-group">
                            <input type="checkbox" id="enableScraping" ${status.enabled ? 'checked' : ''}>
                            <label for="enableScraping">Use web scraping for deal finding</label>
                        </div>
                    </div>

                    <div class="setting-group">
                        <label>Anti-Detection Measures</label>
                        <div class="checkbox-group">
                            <input type="checkbox" id="antiDetection" ${status.config.antiDetection ? 'checked' : ''}>
                            <label for="antiDetection">Enable anti-detection (slower but safer)</label>
                        </div>
                    </div>

                    <div class="setting-group">
                        <label>Maximum Retries</label>
                        <input type="number" id="maxRetries" value="${status.config.maxRetries || 3}" min="1" max="10">
                    </div>

                    <div class="setting-group">
                        <label>Timeout (seconds)</label>
                        <input type="number" id="timeout" value="${status.config.timeout || 30}" min="10" max="120">
                    </div>
                </div>

                <div class="settings-grid">
                    <div class="setting-group">
                        <label>Enable Proxy Rotation</label>
                        <div class="checkbox-group">
                            <input type="checkbox" id="proxyEnabled" ${status.config.proxyEnabled ? 'checked' : ''}>
                            <label for="proxyEnabled">Use proxy rotation for scraping</label>
                        </div>
                    </div>

                    <div class="setting-group">
                        <label>Proxy List (one per line)</label>
                        <textarea id="proxyList" class="proxy-list" placeholder="http://proxy1:8080\nhttp://proxy2:8080">${(status.config.proxyList || []).join('\n')}</textarea>
                    </div>

                    <div class="setting-group">
                        <label>Enable Caching</label>
                        <div class="checkbox-group">
                            <input type="checkbox" id="cacheEnabled" ${status.config.cacheEnabled ? 'checked' : ''}>
                            <label for="cacheEnabled">Cache scraping results</label>
                        </div>
                    </div>
                </div>

                <div class="actions">
                    <button id="saveSettings">Save Settings</button>
                    <button id="testScraping" class="secondary">Test Scraping</button>
                    <button id="resetSettings" class="secondary">Reset to Defaults</button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        this.shadowRoot.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        this.shadowRoot.getElementById('testScraping').addEventListener('click', () => {
            this.testScraping();
        });

        this.shadowRoot.getElementById('resetSettings').addEventListener('click', () => {
            this.resetSettings();
        });
    }

    saveSettings() {
        const settings = {
            enabled: this.shadowRoot.getElementById('enableScraping').checked,
            proxyEnabled: this.shadowRoot.getElementById('proxyEnabled').checked,
            antiDetection: this.shadowRoot.getElementById('antiDetection').checked,
            maxRetries: parseInt(this.shadowRoot.getElementById('maxRetries').value),
            timeout: parseInt(this.shadowRoot.getElementById('timeout').value),
            cacheEnabled: this.shadowRoot.getElementById('cacheEnabled').checked,
            proxyList: this.shadowRoot.getElementById('proxyList').value
                .split('\n')
                .filter(line => line.trim())
                .map(line => line.trim())
        };

        this.service.updateConfig(settings);
        
        // Show success message
        if (typeof showToast === 'function') {
            showToast('Web scraping settings saved', 'success');
        }
        
        // Re-render to show updated status
        this.render();
        this.bindEvents();
    }

    async testScraping() {
        if (!this.service.isAvailable) {
            if (typeof showToast === 'function') {
                showToast('Web scraping service is not available', 'error');
            }
            return;
        }

        try {
            // Test with a simple query
            const results = await this.service.scrapeEbayVinyl('The Beatles', 3);
            
            if (typeof showToast === 'function') {
                showToast(`Scraping test successful: ${results.length} results found`, 'success');
            }
        } catch (error) {
            if (typeof showToast === 'function') {
                showToast(`Scraping test failed: ${error.message}`, 'error');
            }
        }
    }

    resetSettings() {
        // Clear all web scraping settings
        const keys = [
            'web_scraping_enabled',
            'web_scraping_proxy_enabled', 
            'web_scraping_proxy_list',
            'web_scraping_anti_detection',
            'web_scraping_max_retries',
            'web_scraping_timeout',
            'web_scraping_cache_enabled'
        ];

        keys.forEach(key => localStorage.removeItem(key));
        
        // Reload service config
        this.service.config = this.service._loadConfig();
        
        if (typeof showToast === 'function') {
            showToast('Web scraping settings reset to defaults', 'success');
        }
        
        // Re-render
        this.render();
        this.bindEvents();
    }
}

customElements.define('web-scraping-settings', WebScrapingSettings);