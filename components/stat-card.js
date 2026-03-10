// components/stat-card.js — now with smooth counter animation + mini sparkline
class StatCard extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'label', 'icon', 'trend'];
  }

  constructor() {
    super();
    this.value = 0;
    this._animTimer = null;
  }

  connectedCallback() {
    this._updateValue();
    this._render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this._updateValue();
      this._render();
    }
  }

  disconnectedCallback() {
    if (this._animTimer !== null) {
      clearInterval(this._animTimer);
      this._animTimer = null;
    }
  }

  _updateValue() {
    const raw = this.getAttribute('value') || '0';
    // Strip non-numeric chars (except leading minus and first decimal point)
    const numeric = raw.replace(/[^0-9.\-]/g, '');
    this.value = parseFloat(numeric) || 0;
  }

  _render() {
    if (this._animTimer !== null) {
      clearInterval(this._animTimer);
      this._animTimer = null;
    }
    this.innerHTML = `
      <div class="card stat-card">
        <div style="display:flex; justify-content:space-between; align-items:start;">
          <div>
            <div style="font-size:0.95rem; color:var(--vf-text-muted); text-transform:uppercase; letter-spacing:0.5px;">${this.getAttribute('label') || ''}</div>
            <div class="stat-value" id="counter">0</div>
          </div>
          <div style="font-size:2rem; opacity:0.3;">${this.getAttribute('icon') || '📀'}</div>
        </div>
        <!-- Mini sparkline (CSS only) -->
        <div style="height:48px; background:linear-gradient(90deg, transparent, var(--vf-accent-light), transparent); opacity:0.15; margin-top:12px; border-radius:8px;"></div>
      </div>
    `;
    this._animateCounter();
  }

  _animateCounter() {
    const counter = this.querySelector('#counter');
    if (!counter) return;
    const raw = this.getAttribute('value') || '0';
    // Extract leading non-digit prefix (e.g. "£", "+") and trailing suffix (e.g. "%")
    const prefixMatch = raw.match(/^([^0-9]*)[\d]/);
    const suffixMatch = raw.match(/[\d]([^0-9]*)$/);
    const prefix = prefixMatch ? prefixMatch[1] : '';
    const suffix = suffixMatch ? suffixMatch[1] : '';
    const target = this.value;

    let start = 0;
    const duration = 1200;
    const increment = target / (duration / 16);
    this._animTimer = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(this._animTimer);
        this._animTimer = null;
      }
      counter.textContent = prefix + Math.floor(start).toLocaleString() + suffix;
    }, 16);
  }
}

customElements.define('stat-card', StatCard);
