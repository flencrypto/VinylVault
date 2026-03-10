// components/stat-card.js — animated counter + mini sparkline
class StatCard extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'label', 'icon', 'trend'];
  }

  // Feather-icon SVG paths for icons used across the app
  static get _ICONS() {
    return {
      'disc': '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle>',
      'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>',
      'percent': '<line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle>',
      'dollar-sign': '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
      'trending-down': '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline>',
      'activity': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
      'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
    };
  }

  constructor() {
    super();
    this.value = 0;
    this._animTimer = null;
    this._decimals = 0;
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
    const numeric = raw.replace(/[^0-9.\-]/g, '');
    this.value = parseFloat(numeric) || 0;
    // Preserve decimal places from the source value
    const decMatch = numeric.match(/\.(\d+)/);
    this._decimals = decMatch ? decMatch[1].length : 0;
  }

  _renderIcon() {
    const name = this.getAttribute('icon') || '';
    const paths = StatCard._ICONS[name];
    if (paths) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" style="color:var(--vf-accent-light);"
        aria-hidden="true">${paths}</svg>`;
    }
    // Fallback: render the name as text (handles "pound-sign" → "£" etc.)
    const FALLBACK = { 'pound-sign': '£', 'euro-sign': '€' };
    return `<span style="font-size:1.6rem; color:var(--vf-accent-light);">${FALLBACK[name] || name}</span>`;
  }

  _render() {
    if (this._animTimer !== null) {
      clearInterval(this._animTimer);
      this._animTimer = null;
    }
    const trend = this.getAttribute('trend') || '';
    this.innerHTML = `
      <div class="card stat-card">
        <div style="display:flex; justify-content:space-between; align-items:start;">
          <div>
            <div style="font-size:0.95rem; color:var(--vf-text-muted); text-transform:uppercase; letter-spacing:0.5px;">${this.getAttribute('label') || ''}</div>
            <div class="stat-value" data-counter>0</div>
            ${trend ? `<div style="font-size:0.8rem; color:var(--vf-text-muted); margin-top:2px;">${trend}</div>` : ''}
          </div>
          <div style="opacity:0.5; margin-top:2px;">${this._renderIcon()}</div>
        </div>
        <!-- Mini sparkline (CSS only) -->
        <div aria-hidden="true" style="height:48px; background:linear-gradient(90deg, transparent, var(--vf-accent-light), transparent); opacity:0.15; margin-top:12px; border-radius:8px;"></div>
      </div>
    `;
    this._animateCounter();
  }

  _formatNum(n) {
    if (this._decimals > 0) {
      return n.toFixed(this._decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    // toLocaleString handles negative sign correctly (e.g. -42 → "-42")
    return Math.floor(n).toLocaleString();
  }

  _animateCounter() {
    const counter = this.querySelector('[data-counter]');
    if (!counter) return;
    const raw = this.getAttribute('value') || '0';
    // Extract leading prefix (e.g. "£", "+") — require at least one non-digit/non-sign char
    const prefixMatch = raw.match(/^([^\d\-+]+)/);
    const suffixMatch = raw.match(/([^\d.]+)$/);
    const prefix = prefixMatch ? prefixMatch[1] : '';
    const suffix = suffixMatch ? suffixMatch[1] : '';
    const target = this.value;
    const duration = 1200;

    // Direction-aware animation: works for both positive and negative targets
    const absTarget = Math.abs(target);
    const sign = target < 0 ? -1 : 1;
    const absIncrement = absTarget / (duration / 16);
    let absProgress = 0;

    this._animTimer = setInterval(() => {
      absProgress += absIncrement;
      if (absProgress >= absTarget) {
        absProgress = absTarget;
        clearInterval(this._animTimer);
        this._animTimer = null;
      }
      const current = sign * absProgress;
      counter.textContent = prefix + this._formatNum(current) + suffix;
    }, 16);
  }
}

customElements.define('stat-card', StatCard);
