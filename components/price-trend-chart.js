// components/price-trend-chart.js — Interactive luxury price trend chart
class PriceTrendChart extends HTMLElement {
  constructor() {
    super();
    this.chart = null;
    this._retryCount = 0;
    this._maxRetries = 20; // up to ~4 seconds
    this.data = this._parseHistory();
  }

  _parseHistory() {
    const raw = this.getAttribute('data-history');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (_) {
        // Fall through to mock history on invalid JSON
      }
    }
    return this.getMockHistory();
  }

  getMockHistory() {
    // Realistic 12-month vinyl price history (replace with real fetch later)
    const basePrice = parseFloat(this.getAttribute('current-price')) || 85;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.map((m, i) => ({
      month: m,
      price: Math.round(basePrice * (0.85 + Math.random() * 0.4) + (i * 1.2))
    }));
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="card" style="padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <div style="font-size:0.95rem; color:var(--vf-text-muted);">PRICE TREND &bull; 12 MONTHS</div>
            <div style="font-size:1.6rem; font-weight:700; color:var(--vf-accent-light);" id="current-price">
              $${this.getAttribute('current-price') || '85'}
            </div>
          </div>
          <div style="font-size:2rem; opacity:0.2;">📈</div>
        </div>
        <canvas id="trend-canvas" style="max-height:260px;"></canvas>
      </div>
    `;

    this.renderChart();
  }

  renderChart() {
    if (typeof Chart === 'undefined') {
      if (this._retryCount >= this._maxRetries) return; // give up after max retries
      this._retryCount++;
      // Exponential backoff: 100ms, 200ms, 400ms … capped at 1000ms
      const delay = Math.min(100 * Math.pow(2, this._retryCount - 1), 1000);
      setTimeout(() => this.renderChart(), delay);
      return;
    }

    const canvas = this.querySelector('#trend-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.data.map(d => d.month),
        datasets: [{
          label: 'Market Value',
          data: this.data.map(d => d.price),
          borderColor: '#c8973f',
          backgroundColor: 'rgba(200, 151, 63, 0.1)',
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: '#e8c06a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(14,12,11,0.95)',
            titleColor: '#f5ede2',
            bodyColor: '#c8973f',
            borderColor: '#e8c06a',
            borderWidth: 1,
            displayColors: false,
            callbacks: { label: ctx => '$' + ctx.raw }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(232,192,106,0.08)' },
            ticks: { color: '#b8a78f', callback: v => '$' + v }
          },
          x: {
            grid: { color: 'rgba(232,192,106,0.05)' },
            ticks: { color: '#b8a78f' }
          }
        },
        interaction: { intersect: false, mode: 'index' },
        animation: { duration: 1400, easing: 'easeOutQuart' }
      }
    });
  }

  disconnectedCallback() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}

customElements.define('price-trend-chart', PriceTrendChart);
