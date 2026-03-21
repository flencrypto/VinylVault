// components/stat-card.js — animated counter + mini sparkline
class StatCard extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'label', 'icon', 'trend', 'matrix', 'confidence'];
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

  // Enhanced matrix-specific rendering with provenance indicators
  _renderMatrix() {
    const matrix = this.getAttribute('matrix') || '';
    const confidence = parseFloat(this.getAttribute('confidence')) || 0;
    const pressingType = this.getAttribute('pressing-type') || '';
    const rarity = this.getAttribute('rarity') || '';
    
    const matrixLines = matrix.split('|').filter(line => line.trim());
    
    // Confidence styling
    let confidenceClass = 'bg-gray-600';
    let confidenceText = 'Low';
    let confidenceIcon = 'alert-circle';
    
    if (confidence >= 0.8) {
      confidenceClass = 'bg-green-600';
      confidenceText = 'High';
      confidenceIcon = 'check-circle';
    } else if (confidence >= 0.6) {
      confidenceClass = 'bg-yellow-600';
      confidenceText = 'Medium';
      confidenceIcon = 'alert-triangle';
    }
    
    // Pressing type styling
    let pressingClass = 'bg-blue-600';
    let pressingText = pressingType || 'Unknown';
    if (pressingType.includes('First')) {
      pressingClass = 'bg-purple-600';
    } else if (pressingType.includes('Reissue')) {
      pressingClass = 'bg-orange-600';
    }
    
    this.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <i data-feather="disc" class="w-4 h-4 text-vf-primary"></i>
          <span class="text-sm font-medium text-gray-300">Matrix Analysis</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs px-2 py-1 rounded-full ${confidenceClass} text-white flex items-center gap-1">
            <i data-feather="${confidenceIcon}" class="w-3 h-3"></i>
            ${confidenceText}
          </span>
        </div>
      </div>
      
      ${pressingType ? `
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs text-gray-400">Pressing Type</span>
        <span class="text-xs px-2 py-1 rounded-full ${pressingClass} text-white">
          ${pressingText}
        </span>
      </div>
      ` : ''}
      
      ${rarity ? `
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs text-gray-400">Rarity Indicator</span>
        <span class="text-xs px-2 py-1 rounded-full bg-vf-accent text-vf-surface">
          ${rarity}
        </span>
      </div>
      ` : ''}
      
      <div class="mt-2">
        <div class="text-xs text-gray-400 mb-1">Extracted Runout Data:</div>
        ${matrixLines.map(line => `
          <div class="text-xs font-mono text-gray-300 bg-vf-surface-light p-2 rounded mb-1 border border-vf-border" title="${line}">
            ${line}
          </div>
        `).join('')}
      </div>
      
      ${confidence < 0.8 ? `
      <div class="mt-3 text-xs text-yellow-400 flex items-center gap-1">
        <i data-feather="alert-triangle" class="w-3 h-3"></i>
        Review recommended for accuracy
      </div>
      ` : ''}
    `;
    
    if (typeof feather !== 'undefined') feather.replace();
  }

  // Enhanced render method to handle matrix type
  _render() {
    const type = this.getAttribute('type');
    
    if (type === 'matrix') {
      this._renderMatrix();
      return;
    }
    
    // Existing rendering logic for other types
    const label = this.getAttribute('label') || '';
    const icon = this.getAttribute('icon') || '';
    const trend = this.getAttribute('trend') || '';
    
    const iconSvg = StatCard._ICONS[icon] || '';
    
    this.innerHTML = `
      <div class="stat-card-inner">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            ${iconSvg ? `<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">${iconSvg}</svg>` : ''}
            <span class="text-sm font-medium text-gray-300">${label}</span>
          </div>
          ${trend ? `<span class="trend ${trend}"></span>` : ''}
        </div>
        <div class="mt-2">
          <span class="text-2xl font-bold text-white" data-counter>${this._formatNum(this.value)}</span>
        </div>
      </div>
    `;
    
    if (typeof feather !== 'undefined') feather.replace();
    
    if (this.value !== 0) {
      this._animateCounter();
    }
  }

  // Add matrix-specific rendering
  _renderMatrix() {
    const matrix = this.getAttribute('matrix') || '';
    const confidence = parseFloat(this.getAttribute('confidence')) || 0;
    
    const matrixLines = matrix.split('|').filter(line => line.trim());
    
    let confidenceClass = 'bg-gray-600';
    let confidenceText = 'Low';
    
    if (confidence >= 0.8) {
      confidenceClass = 'bg-green-600';
      confidenceText = 'High';
    } else if (confidence >= 0.6) {
      confidenceClass = 'bg-yellow-600';
      confidenceText = 'Medium';
    }
    
    this.innerHTML = `
      <div class="stat-card-inner">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-feather="info" class="w-4 h-4 text-gray-400"></i>
            <span class="text-sm font-medium text-gray-300">Matrix / Runout</span>
          </div>
          <span class="text-xs px-2 py-1 rounded-full ${confidenceClass} text-white">
            ${confidenceText} Confidence
          </span>
        </div>
        <div class="mt-2">
          ${matrixLines.map(line => `
            <div class="text-xs font-mono text-gray-400 truncate" title="${line}">
              ${line}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    if (typeof feather !== 'undefined') feather.replace();
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
