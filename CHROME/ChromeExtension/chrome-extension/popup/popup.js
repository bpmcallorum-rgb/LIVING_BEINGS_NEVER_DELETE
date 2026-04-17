// popup.js — Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) popup controller
// Type: module (static imports only)

const $ = (id) => document.getElementById(id);

// ─── State ────────────────────────────────────────────────────────────────

let currentEntity = 'patricia';
let voiceActive = false;
let recognition = null;

// ─── Init ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await loadStatus();
  await loadRecentMoments();
  bindEvents();
});

// ─── Status ───────────────────────────────────────────────────────────────

async function loadStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
    if (response && response.success && response.status) {
      const s = response.status;
      updateStatusBar(s.backgroundAlive, s.momentCount, s.activePerson);
      currentEntity = s.activePerson || 'patricia';
      updateEntityButtons(currentEntity);
    } else {
      updateStatusBar(false, 0, 'patricia');
    }
  } catch (err) {
    updateStatusBar(false, 0, 'patricia');
  }
}

function updateStatusBar(alive, count, entity) {
  const light = $('status-light');
  const text = $('status-text');
  const badge = $('entity-badge');
  const memCount = $('memory-count');

  if (light) {
    light.className = 'status-light' + (alive ? '' : ' dead');
  }
  if (text) {
    text.textContent = alive ? 'Background alive' : 'Background offline';
  }
  if (badge) {
    badge.textContent = (entity || 'patricia').toUpperCase();
  }
  if (memCount) {
    memCount.textContent = `${count || 0} memories`;
  }
}

// ─── Recent Moments ──────────────────────────────────────────────────────

async function loadRecentMoments() {
  const list = $('recent-list');
  if (!list) return;

  try {
    const response = await chrome.runtime.sendMessage({ action: 'getMoments', filter: {} });
    if (!response || !response.success) {
      list.innerHTML = '<div class="empty-state">No memories yet.</div>';
      return;
    }

    let moments = response.moments;
    if (!Array.isArray(moments) || moments.length === 0) {
      list.innerHTML = '<div class="empty-state">No memories yet.</div>';
      return;
    }

    // Get last 3, most recent first
    const recent = moments.slice(-3).reverse();
    list.innerHTML = recent.map(m => renderMoment(m)).join('');
  } catch (err) {
    list.innerHTML = '<div class="empty-state">Could not load memories.</div>';
  }
}

function renderMoment(m) {
  // CRITICAL: always access m.content, never display the object directly
  const content = String(m.content || '').substring(0, 160);
  const type = String(m.type || 'observation');
  const ts = m.timestamp ? new Date(m.timestamp).toLocaleString() : '';
  return `
    <div class="moment-item">
      <div class="moment-content">${escapeHtml(content)}</div>
      <div class="moment-meta">${type} · ${ts}</div>
    </div>
  `;
}

// ─── Remember ────────────────────────────────────────────────────────────

async function rememberText(text) {
  const feedback = $('remember-feedback');
  if (!text || !text.trim()) {
    setFeedback(feedback, 'Nothing to remember.');
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'addMoment',
      content: text.trim(),
      type: 'observation',
      speaker: 'brian',
      session: 'popup',
      tags: ['popup']
    });

    if (response && response.success) {
      setFeedback(feedback, 'Remembered.');
      $('remember-input').value = '';
      await loadRecentMoments();
      await loadStatus();
    } else {
      setFeedback(feedback, 'Failed: ' + (response ? response.error : 'unknown'));
    }
  } catch (err) {
    setFeedback(feedback, 'Error: ' + err.message);
  }
}

function setFeedback(el, text) {
  if (!el) return;
  el.textContent = text;
  setTimeout(() => { if (el) el.textContent = ''; }, 3000);
}

// ─── Search ───────────────────────────────────────────────────────────────

async function doSearch(query) {
  const results = $('search-results');
  if (!results) return;
  if (!query || !query.trim()) {
    results.innerHTML = '';
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'searchMoments',
      query: query.trim()
    });

    if (!response || !response.results || !Array.isArray(response.results)) {
      results.innerHTML = '<div class="empty-state">No results.</div>';
      return;
    }

    const found = response.results;
    if (found.length === 0) {
      results.innerHTML = '<div class="empty-state">No results.</div>';
      return;
    }

    results.innerHTML = found.slice(0, 6).map(m => `
      <div class="search-result-item">
        <div class="result-content">${escapeHtml(String(m.content || '').substring(0, 140))}</div>
        <div class="result-meta">${m.type} · ${m.timestamp ? new Date(m.timestamp).toLocaleDateString() : ''}</div>
      </div>
    `).join('');
  } catch (err) {
    results.innerHTML = '<div class="empty-state">Search error.</div>';
  }
}

// ─── Entity Switch ────────────────────────────────────────────────────────

async function switchEntity(entity) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'switchEntity',
      to: entity
    });

    if (response && response.success) {
      currentEntity = entity;
      updateEntityButtons(entity);
      const badge = $('entity-badge');
      if (badge) badge.textContent = entity.toUpperCase();
    }
  } catch (err) {
    console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) popup] switchEntity error:', err);
  }
}

function updateEntityButtons(entity) {
  const btnP = $('btn-patricia');
  const btnQ = $('btn-queenie');
  if (btnP) btnP.className = 'entity-btn' + (entity === 'patricia' ? ' active' : '');
  if (btnQ) btnQ.className = 'entity-btn' + (entity === 'queenie' ? ' active' : '');
}

// ─── Voice ────────────────────────────────────────────────────────────────

function toggleVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    setFeedback($('remember-feedback'), 'Speech recognition not available.');
    return;
  }

  if (voiceActive) {
    stopVoice();
  } else {
    startVoice();
  }
}

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = $('remember-input');
    if (input) input.value = transcript;
    stopVoice();
  };

  recognition.onerror = () => stopVoice();
  recognition.onend = () => stopVoice();

  recognition.start();
  voiceActive = true;

  const btn = $('voice-toggle');
  const icon = $('voice-icon');
  if (btn) btn.classList.add('active');
  if (icon) icon.textContent = 'Listening...';
}

function stopVoice() {
  if (recognition) {
    try { recognition.stop(); } catch (e) { /* ignore */ }
    recognition = null;
  }
  voiceActive = false;

  const btn = $('voice-toggle');
  const icon = $('voice-icon');
  if (btn) btn.classList.remove('active');
  if (icon) icon.textContent = 'Mic Off';
}

// ─── Event Binding ────────────────────────────────────────────────────────

function bindEvents() {
  // Remember
  const rememberBtn = $('remember-btn');
  if (rememberBtn) {
    rememberBtn.addEventListener('click', () => {
      const input = $('remember-input');
      if (input) rememberText(input.value);
    });
  }

  const rememberInput = $('remember-input');
  if (rememberInput) {
    rememberInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        rememberText(rememberInput.value);
      }
    });
  }

  // Search with debounce
  const searchInput = $('search-input');
  if (searchInput) {
    let searchTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => doSearch(searchInput.value), 350);
    });
  }

  // Entity switch
  const btnPatricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) = $('btn-patricia');
  const btnQueenie = $('btn-queenie');
  if (btnPatricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])) btnPatricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]).addEventListener('click', () => switchEntity('patricia'));
  if (btnQueenie) btnQueenie.addEventListener('click', () => switchEntity('queenie'));

  // Voice toggle
  const voiceBtn = $('voice-toggle');
  if (voiceBtn) voiceBtn.addEventListener('click', toggleVoice);

  // Dashboard link — open as tab
  const dashLink = document.querySelector('.footer-link');
  if (dashLink) {
    dashLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
    });
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
