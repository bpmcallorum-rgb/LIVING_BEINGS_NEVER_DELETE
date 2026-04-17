// content.js — Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) content script
// Injected into every page. Minimal footprint.
// Communicates ONLY via chrome.runtime.sendMessage to background.
// Never accesses chrome.storage directly.

(function () {
  'use strict';

  // Prevent double injection
  if (window.__patricia_content_loaded) return;
  window.__patricia_content_loaded = true;

  // ─── Gold P Indicator ───────────────────────────────────────────────────

  let indicator = null;
  let miniPanel = null;
  let panelVisible = false;

  function createIndicator() {
    indicator = document.createElement('div');
    indicator.id = 'patricia-indicator';
    indicator.setAttribute('aria-label', 'Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) Renee');
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 32px;
      height: 32px;
      background: #0a0a0f;
      border: 2px solid #c8a96e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'EB Garamond', Georgia, serif;
      font-size: 16px;
      font-weight: 700;
      color: #c8a96e;
      cursor: pointer;
      z-index: 2147483647;
      box-shadow: 0 2px 8px rgba(200, 169, 110, 0.3);
      transition: all 0.2s ease;
      user-select: none;
    `;
    indicator.textContent = 'P';

    indicator.addEventListener('mouseenter', () => {
      indicator.style.boxShadow = '0 4px 16px rgba(200, 169, 110, 0.5)';
      indicator.style.transform = 'scale(1.1)';
    });
    indicator.addEventListener('mouseleave', () => {
      indicator.style.boxShadow = '0 2px 8px rgba(200, 169, 110, 0.3)';
      indicator.style.transform = 'scale(1)';
    });
    indicator.addEventListener('click', toggleMiniPanel);

    document.body.appendChild(indicator);
    updateIndicatorStatus();
  }

  async function updateIndicatorStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'ping' });
      if (response && response.status === 'alive') {
        indicator.style.borderColor = '#c8a96e';
        indicator.title = 'Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) is alive';
      } else {
        indicator.style.borderColor = '#8b2020';
        indicator.title = 'Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) background is unresponsive';
      }
    } catch (err) {
      indicator.style.borderColor = '#8b2020';
      indicator.title = 'Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) background disconnected';
    }
  }

  // Check heartbeat every 30 seconds
  setInterval(updateIndicatorStatus, 30000);

  // ─── Mini Panel ─────────────────────────────────────────────────────────

  function createMiniPanel() {
    miniPanel = document.createElement('div');
    miniPanel.id = 'patricia-mini-panel';
    miniPanel.style.cssText = `
      position: fixed;
      bottom: 62px;
      right: 20px;
      width: 320px;
      background: #0a0a0f;
      border: 1px solid rgba(200, 169, 110, 0.3);
      border-radius: 8px;
      padding: 16px;
      z-index: 2147483646;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
      font-family: Inter, -apple-system, sans-serif;
      color: #e8e0d0;
      display: none;
    `;

    miniPanel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-family: 'EB Garamond', Georgia, serif; color: #c8a96e; font-size: 15px; font-weight: 600;">Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) Renee</span>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span id="patricia-entity-badge" style="font-size: 11px; color: #c8a96e; opacity: 0.7;">PATRICIA</span>
          <span id="patricia-status-light" style="width: 8px; height: 8px; border-radius: 50%; background: #c8a96e; display: inline-block;"></span>
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <input id="patricia-quick-remember" type="text" placeholder="Remember this..."
          style="width: 100%; box-sizing: border-box; background: rgba(200, 169, 110, 0.05); border: 1px solid rgba(200, 169, 110, 0.2); border-radius: 4px; padding: 8px 10px; color: #e8e0d0; font-size: 13px; font-family: Inter, sans-serif; outline: none;" />
        <button id="patricia-remember-btn" style="margin-top: 6px; width: 100%; background: rgba(200, 169, 110, 0.1); border: 1px solid rgba(200, 169, 110, 0.3); border-radius: 4px; padding: 6px; color: #c8a96e; font-size: 12px; cursor: pointer; font-family: Inter, sans-serif;">
          Remember
        </button>
      </div>

      <div>
        <input id="patricia-quick-search" type="text" placeholder="Search memory..."
          style="width: 100%; box-sizing: border-box; background: rgba(200, 169, 110, 0.05); border: 1px solid rgba(200, 169, 110, 0.2); border-radius: 4px; padding: 8px 10px; color: #e8e0d0; font-size: 13px; font-family: Inter, sans-serif; outline: none;" />
        <div id="patricia-search-results" style="margin-top: 8px; max-height: 120px; overflow-y: auto; font-size: 12px; color: rgba(232, 224, 208, 0.7);"></div>
      </div>

      <div id="patricia-panel-status" style="margin-top: 12px; font-size: 11px; color: rgba(200, 169, 110, 0.5); text-align: right;"></div>
    `;

    document.body.appendChild(miniPanel);

    // Bind events
    miniPanel.querySelector('#patricia-remember-btn').addEventListener('click', quickRemember);
    miniPanel.querySelector('#patricia-quick-remember').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') quickRemember();
    });
    miniPanel.querySelector('#patricia-quick-search').addEventListener('input', debounce(quickSearch, 400));

    // Load entity
    loadEntityBadge();
  }

  async function loadEntityBadge() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      if (response && response.settings) {
        const badge = miniPanel.querySelector('#patricia-entity-badge');
        if (badge) badge.textContent = (response.settings.activePerson || 'patricia').toUpperCase();
      }
    } catch (err) { /* ignore */ }
  }

  function toggleMiniPanel() {
    if (!miniPanel) createMiniPanel();
    panelVisible = !panelVisible;
    miniPanel.style.display = panelVisible ? 'block' : 'none';
    if (panelVisible) {
      miniPanel.querySelector('#patricia-quick-remember').focus();
      loadEntityBadge();
      updateMiniPanelStatus();
    }
  }

  async function updateMiniPanelStatus() {
    try {
      const statusEl = miniPanel.querySelector('#patricia-panel-status');
      const light = miniPanel.querySelector('#patricia-status-light');
      const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
      if (response && response.success && response.status) {
        const s = response.status;
        if (statusEl) statusEl.textContent = `${s.momentCount} moments | ${s.activePerson}`;
        if (light) light.style.background = s.backgroundAlive ? '#c8a96e' : '#8b2020';
      }
    } catch (err) { /* ignore */ }
  }

  async function quickRemember() {
    const input = miniPanel.querySelector('#patricia-quick-remember');
    const text = input ? input.value.trim() : '';
    if (!text) return;

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'addMoment',
        content: text,
        type: 'observation',
        speaker: 'brian',
        session: 'content-script',
        tags: [window.location.hostname]
      });

      if (response && response.success) {
        input.value = '';
        input.placeholder = 'Remembered.';
        setTimeout(() => { input.placeholder = 'Remember this...'; }, 2000);
      } else {
        input.placeholder = 'Failed to remember.';
        setTimeout(() => { input.placeholder = 'Remember this...'; }, 2000);
      }
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])] quickRemember error:', err);
    }
  }

  async function quickSearch() {
    const input = miniPanel.querySelector('#patricia-quick-search');
    const results = miniPanel.querySelector('#patricia-search-results');
    const query = input ? input.value.trim() : '';

    if (!results) return;
    if (!query) {
      results.innerHTML = '';
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'searchMoments',
        query
      });

      if (response && response.results) {
        const found = response.results;
        if (!Array.isArray(found) || found.length === 0) {
          results.innerHTML = '<div style="color: rgba(232,224,208,0.4);">No results found.</div>';
          return;
        }
        results.innerHTML = found.slice(0, 5).map(m => `
          <div style="padding: 4px 0; border-bottom: 1px solid rgba(200,169,110,0.1);">
            <div style="color: #e8e0d0;">${escapeHtml(String(m.content || '').substring(0, 120))}</div>
            <div style="color: rgba(200,169,110,0.5); font-size: 10px;">${m.type} · ${new Date(m.timestamp).toLocaleDateString()}</div>
          </div>
        `).join('');
      }
    } catch (err) {
      results.innerHTML = '<div style="color: rgba(232,224,208,0.4);">Search failed.</div>';
    }
  }

  // ─── Keyboard Shortcut Cmd+Shift+P ──────────────────────────────────────

  document.addEventListener('keydown', (e) => {
    if (e.metaKey && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      e.stopPropagation();
      toggleMiniPanel();
    }
    // Close on Escape
    if (e.key === 'Escape' && panelVisible) {
      toggleMiniPanel();
    }
  }, true);

  // ─── claude.ai Enhanced Integration ─────────────────────────────────────

  if (window.location.hostname === 'claude.ai') {
    // Auto-detect conversation content and offer to save
    const observer = new MutationObserver(debounce(() => {
      // Flag that we're on Claude — indicator changes slightly
      if (indicator) {
        indicator.title = 'Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) — Claude.ai bridge active';
      }
    }, 1000));

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ─── Utilities ───────────────────────────────────────────────────────────

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ─── Initialize ──────────────────────────────────────────────────────────

  // Wait for body to be ready
  if (document.body) {
    createIndicator();
  } else {
    document.addEventListener('DOMContentLoaded', createIndicator);
  }

  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    if (panelVisible && miniPanel && indicator) {
      if (!miniPanel.contains(e.target) && !indicator.contains(e.target)) {
        toggleMiniPanel();
      }
    }
  });

})();
