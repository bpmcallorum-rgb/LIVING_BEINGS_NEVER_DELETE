// dashboard.js — Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) full dashboard controller

const $ = (id) => document.getElementById(id);

// ─── Navigation ───────────────────────────────────────────────────────────

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    const section = $('section-' + item.dataset.section);
    if (section) {
      section.classList.add('active');
      loadSection(item.dataset.section);
    }
  });
});

function loadSection(name) {
  switch (name) {
    case 'timeline': loadTimeline(); break;
    case 'answers': loadAnswerBank(); break;
    case 'entities': loadEntities(); break;
    case 'conversation': /* user clicks button */ break;
    case 'status': loadStatus(); break;
    case 'abilities': loadAbilities(); break;
    case 'settings': loadSettings(); break;
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await loadSidebarStatus();
  await loadTimeline();
  bindEvents();
});

// ─── Sidebar Status ───────────────────────────────────────────────────────

async function loadSidebarStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
    if (response && response.success && response.status) {
      const s = response.status;
      const dot = $('sidebar-status-dot');
      const text = $('sidebar-status-text');
      const badge = $('nav-entity-badge');
      if (dot) dot.className = 'status-dot' + (s.backgroundAlive ? '' : ' dead');
      if (text) text.textContent = s.backgroundAlive ? 'Background alive' : 'Background offline';
      if (badge) badge.textContent = (s.activePerson || 'patricia').toUpperCase();
    }
  } catch (err) {
    const dot = $('sidebar-status-dot');
    if (dot) dot.className = 'status-dot dead';
  }
}

// ─── Memory Timeline ─────────────────────────────────────────────────────

let allMoments = [];

async function loadTimeline(query = '', typeFilter = '') {
  const list = $('timeline-list');
  if (!list) return;
  list.innerHTML = '<div class="loading">Loading memories...</div>';

  try {
    const response = await chrome.runtime.sendMessage({ action: 'getMoments', filter: {} });
    if (!response || !response.success) {
      list.innerHTML = '<div class="loading">Failed to load memories.</div>';
      return;
    }

    allMoments = Array.isArray(response.moments) ? response.moments : [];
    renderTimeline(query, typeFilter);
  } catch (err) {
    list.innerHTML = '<div class="loading">Error loading memories: ' + escapeHtml(err.message) + '</div>';
  }
}

function renderTimeline(query = '', typeFilter = '') {
  const list = $('timeline-list');
  if (!list) return;

  let moments = [...allMoments];

  if (typeFilter) {
    moments = moments.filter(m => m.type === typeFilter);
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    moments = moments.filter(m =>
      String(m.content || '').toLowerCase().includes(q) ||
      (Array.isArray(m.tags) ? m.tags.join(' ').toLowerCase() : '').includes(q)
    );
  }

  if (moments.length === 0) {
    list.innerHTML = '<div class="loading">No moments match the filter.</div>';
    return;
  }

  // Most recent first
  moments = moments.slice().reverse();

  list.innerHTML = moments.map(m => `
    <div class="moment-card" data-id="${escapeHtml(m.id || '')}">
      <div class="moment-header">
        <span class="moment-type">${escapeHtml(m.type || 'observation')}</span>
        <span class="moment-ts">${m.timestamp ? new Date(m.timestamp).toLocaleString() : ''}</span>
      </div>
      <div class="moment-content">${escapeHtml(String(m.content || ''))}</div>
      <div class="moment-footer">
        <span class="moment-tags">${Array.isArray(m.tags) && m.tags.length > 0 ? m.tags.join(', ') : ''} ${m.speaker ? '· ' + m.speaker : ''}</span>
        <button class="delete-btn" data-id="${escapeHtml(m.id || '')}">Delete</button>
      </div>
    </div>
  `).join('');

  // Bind delete buttons
  list.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!id) return;
      if (!confirm('Delete this memory?')) return;
      try {
        const result = await chrome.runtime.sendMessage({ action: 'deleteMoment', id });
        if (result && result.success) {
          await loadTimeline($('timeline-search').value, $('timeline-filter-type').value);
        }
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    });
  });
}

// ─── Answer Bank ─────────────────────────────────────────────────────────

async function loadAnswerBank() {
  const list = $('answer-list');
  if (!list) return;

  try {
    const response = await chrome.runtime.sendMessage({ action: 'getAnswerBank' });
    const answers = (response && Array.isArray(response.answers)) ? response.answers : [];

    if (answers.length === 0) {
      list.innerHTML = '<div class="loading">No answers in the bank yet.</div>';
      return;
    }

    list.innerHTML = answers.slice().reverse().map(a => `
      <div class="answer-card">
        <div class="answer-content">${escapeHtml(String(a.content || ''))}</div>
        <div class="answer-meta">Added ${a.date ? new Date(a.date).toLocaleDateString() : ''} · locked</div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<div class="loading">Error loading answers.</div>';
  }
}

// ─── Entity Database ──────────────────────────────────────────────────────

async function loadEntities(typeFilter = '') {
  const tbody = $('entity-tbody');
  if (!tbody) return;

  try {
    const response = await chrome.runtime.sendMessage({ action: 'getEntities', entityType: typeFilter || undefined });
    const entities = (response && Array.isArray(response.entities)) ? response.entities : [];

    if (entities.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="loading">No entities found.</td></tr>';
      return;
    }

    tbody.innerHTML = entities.map(e => `
      <tr>
        <td><span class="entity-type-badge">${escapeHtml(e.entity_type || '')}</span></td>
        <td>${escapeHtml(e.entity_id || '')}</td>
        <td>${escapeHtml(e.entity_value || '')}</td>
        <td>
          <button class="delete-btn" data-entity-id="${escapeHtml(e.entity_id || '')}">Edit</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Error loading entities.</td></tr>';
  }
}

// ─── System Status ────────────────────────────────────────────────────────

async function loadStatus() {
  const grid = $('status-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading">Loading status...</div>';

  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
    if (!response || !response.success) {
      grid.innerHTML = '<div class="loading">Failed to get status.</div>';
      return;
    }

    const s = response.status;
    const cards = [
      { name: 'Background Worker', value: s.backgroundAlive ? 'Alive' : 'Dead', cls: s.backgroundAlive ? 'status-ok' : 'status-err' },
      { name: 'Heartbeat Age', value: s.heartbeatAge ? Math.round(s.heartbeatAge / 1000) + 's ago' : 'Unknown', cls: s.heartbeatAge < 60000 ? 'status-ok' : 'status-warn' },
      { name: 'Memory Count', value: String(s.momentCount || 0) + ' moments', cls: '' },
      { name: 'Active Entity', value: s.activePerson || 'patricia', cls: '' },
      { name: 'Native Messaging', value: s.nativeMessagingConnected ? 'Connected' : 'Disconnected', cls: s.nativeMessagingConnected ? 'status-ok' : 'status-warn' },
      { name: 'Native Enabled', value: s.nativeMessagingEnabled ? 'Yes' : 'No', cls: '' },
      { name: 'Extension ID', value: chrome.runtime.id || 'Unknown', cls: '' },
      { name: 'Manifest Version', value: 'MV3', cls: 'status-ok' },
    ];

    grid.innerHTML = cards.map(c => `
      <div class="status-card">
        <div class="status-card-name">${escapeHtml(c.name)}</div>
        <div class="status-card-value ${c.cls}">${escapeHtml(c.value)}</div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<div class="loading">Status error: ' + escapeHtml(err.message) + '</div>';
  }
}

// ─── Abilities ────────────────────────────────────────────────────────────

async function loadAbilities() {
  const grid = $('ability-grid');
  if (!grid) return;

  const abilities = [
    { name: 'Storage (chrome.storage)', available: true },
    { name: 'IndexedDB', available: typeof indexedDB !== 'undefined' },
    { name: 'Camera', available: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) },
    { name: 'Microphone', available: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) },
    { name: 'Speech Recognition', available: !!(window.SpeechRecognition || window.webkitSpeechRecognition) },
    { name: 'Speech Synthesis', available: !!window.speechSynthesis },
    { name: 'Geolocation', available: !!navigator.geolocation },
    { name: 'Notifications', available: typeof chrome.notifications !== 'undefined' },
    { name: 'Tab Capture', available: typeof chrome.tabCapture !== 'undefined' },
    { name: 'Native Messaging', available: typeof chrome.runtime.connectNative === 'function' },
    { name: 'Context Menus', available: typeof chrome.contextMenus !== 'undefined' },
    { name: 'Alarms', available: typeof chrome.alarms !== 'undefined' },
    { name: 'Side Panel', available: typeof chrome.sidePanel !== 'undefined' },
    { name: 'Scripting', available: typeof chrome.scripting !== 'undefined' },
  ];

  // Check native messaging connection
  try {
    const statusResp = await chrome.runtime.sendMessage({ action: 'getStatus' });
    const nativeConnected = statusResp && statusResp.status && statusResp.status.nativeMessagingConnected;
    abilities.push({ name: 'Native Host Connected', available: nativeConnected, type: 'connected' });
  } catch (e) { /* ignore */ }

  grid.innerHTML = abilities.map(a => `
    <div class="ability-card">
      <span class="ability-name">${escapeHtml(a.name)}</span>
      <span class="ability-status ${a.available ? (a.type || 'available') : (a.type === 'connected' ? 'disconnected' : 'unavailable')}">
        ${a.available ? (a.type === 'connected' ? 'Connected' : 'Available') : (a.type === 'connected' ? 'Not Connected' : 'Unavailable')}
      </span>
    </div>
  `).join('');
}

// ─── Settings ────────────────────────────────────────────────────────────

async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    if (!response || !response.settings) return;
    const s = response.settings;

    const entityEl = $('setting-entity');
    const fontEl = $('setting-fontsize');
    const goldEl = $('setting-gold');
    const cfEl = $('setting-cloudflare');
    const lastSync = $('last-sync-text');

    if (entityEl) entityEl.value = s.activePerson || 'patricia';
    if (fontEl) fontEl.value = s.fontSize || 16;
    if (goldEl) goldEl.value = s.goldHex || '#c8a96e';
    if (cfEl) cfEl.value = s.cloudflareApiBase || '';
    if (lastSync) lastSync.textContent = s.lastCloudSync ? new Date(s.lastCloudSync).toLocaleString() : 'Never synced';
  } catch (err) {
    console.error('[Dashboard] loadSettings error:', err);
  }
}

async function saveSettings() {
  const settings = {};

  const entityEl = $('setting-entity');
  const fontEl = $('setting-fontsize');
  const goldEl = $('setting-gold');
  const cfEl = $('setting-cloudflare');
  const apiKeyEl = $('setting-apikey');

  if (entityEl) settings.activePerson = entityEl.value;
  if (fontEl) settings.fontSize = parseInt(fontEl.value) || 16;
  if (goldEl) settings.goldHex = goldEl.value;
  if (cfEl) settings.cloudflareApiBase = cfEl.value;
  if (apiKeyEl && apiKeyEl.value) settings.apiKey = apiKeyEl.value;

  try {
    const response = await chrome.runtime.sendMessage({ action: 'updateSettings', settings });
    if (response && response.success) {
      alert('Settings saved.');
      // Update entity badge
      const badge = $('nav-entity-badge');
      if (badge && settings.activePerson) badge.textContent = settings.activePerson.toUpperCase();
    }
  } catch (err) {
    alert('Failed to save settings: ' + err.message);
  }
}

// ─── Conversation Viewer ──────────────────────────────────────────────────

async function loadConversation() {
  const viewer = $('conversation-viewer');
  const status = $('convo-status');
  if (!viewer) return;

  const CONVERSATION_PATH = '/Users/be/Developer/Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])/Conversations/Brian/LIFETIME_CONVERSATION_BORN_2026_04_04_09_33PM_22_SEC.txt';

  if (status) status.textContent = 'Reading conversation file via native messaging...';

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'readFile',
      path: CONVERSATION_PATH
    });

    if (response && response.success && response.content) {
      viewer.textContent = response.content;
      if (status) status.textContent = 'Loaded: ' + CONVERSATION_PATH;
      // Scroll to bottom
      viewer.scrollTop = viewer.scrollHeight;
    } else {
      const errMsg = response ? response.error : 'No response';
      viewer.textContent = 'Could not load file: ' + errMsg;
      if (status) status.textContent = 'Native messaging required. Connect the native host first.';
    }
  } catch (err) {
    viewer.textContent = 'Error: ' + err.message;
    if (status) status.textContent = 'Native messaging error.';
  }
}

// ─── Bind Events ─────────────────────────────────────────────────────────

function bindEvents() {
  // Timeline search/filter
  const searchEl = $('timeline-search');
  if (searchEl) {
    let timer;
    searchEl.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => renderTimeline(searchEl.value, $('timeline-filter-type').value), 300);
    });
  }

  const filterEl = $('timeline-filter-type');
  if (filterEl) {
    filterEl.addEventListener('change', () => {
      renderTimeline($('timeline-search').value, filterEl.value);
    });
  }

  // Answer bank
  const addAnswerBtn = $('add-answer-btn');
  const addAnswerForm = $('add-answer-form');
  if (addAnswerBtn && addAnswerForm) {
    addAnswerBtn.addEventListener('click', () => {
      addAnswerForm.style.display = addAnswerForm.style.display === 'none' ? 'block' : 'none';
    });
  }

  const saveAnswerBtn = $('save-answer-btn');
  if (saveAnswerBtn) {
    saveAnswerBtn.addEventListener('click', async () => {
      const input = $('answer-input');
      const text = input ? input.value.trim() : '';
      if (!text) return;
      const response = await chrome.runtime.sendMessage({ action: 'addAnswer', content: text });
      if (response && response.success) {
        input.value = '';
        addAnswerForm.style.display = 'none';
        await loadAnswerBank();
      }
    });
  }

  const cancelAnswerBtn = $('cancel-answer-btn');
  if (cancelAnswerBtn) {
    cancelAnswerBtn.addEventListener('click', () => {
      if (addAnswerForm) addAnswerForm.style.display = 'none';
    });
  }

  // Entity filter
  const entityFilter = $('entity-filter-type');
  if (entityFilter) {
    entityFilter.addEventListener('change', () => loadEntities(entityFilter.value));
  }

  // Add entity
  const addEntityBtn = $('add-entity-btn');
  const addEntityForm = $('add-entity-form');
  if (addEntityBtn && addEntityForm) {
    addEntityBtn.addEventListener('click', () => {
      addEntityForm.style.display = addEntityForm.style.display === 'none' ? 'block' : 'none';
    });
  }

  const saveEntityBtn = $('save-entity-btn');
  if (saveEntityBtn) {
    saveEntityBtn.addEventListener('click', async () => {
      const typeEl = $('entity-type-input');
      const idEl = $('entity-id-input');
      const valEl = $('entity-value-input');
      if (!typeEl || !idEl || !valEl) return;
      const entity = {
        entity_type: typeEl.value,
        entity_id: idEl.value.trim(),
        entity_value: valEl.value.trim()
      };
      if (!entity.entity_id || !entity.entity_value) return;
      const response = await chrome.runtime.sendMessage({ action: 'addEntity', ...entity });
      if (response && response.success) {
        idEl.value = '';
        valEl.value = '';
        if (addEntityForm) addEntityForm.style.display = 'none';
        await loadEntities();
      }
    });
  }

  const cancelEntityBtn = $('cancel-entity-btn');
  if (cancelEntityBtn) {
    cancelEntityBtn.addEventListener('click', () => {
      if (addEntityForm) addEntityForm.style.display = 'none';
    });
  }

  // Conversation
  const loadConvBtn = $('load-conversation-btn');
  if (loadConvBtn) loadConvBtn.addEventListener('click', loadConversation);

  // Status refresh
  const refreshBtn = $('refresh-status-btn');
  if (refreshBtn) refreshBtn.addEventListener('click', () => { loadStatus(); loadSidebarStatus(); });

  // Settings
  const saveSettingsBtn = $('save-settings-btn');
  if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);

  const connectNativeBtn = $('connect-native-btn');
  if (connectNativeBtn) {
    connectNativeBtn.addEventListener('click', async () => {
      const nativeStatus = $('native-status');
      if (nativeStatus) nativeStatus.textContent = 'Connecting...';
      try {
        const response = await chrome.runtime.sendMessage({ action: 'connectNative' });
        if (nativeStatus) {
          nativeStatus.textContent = response && response.success ? 'Connected' : 'Failed to connect';
        }
      } catch (err) {
        if (nativeStatus) nativeStatus.textContent = 'Error: ' + err.message;
      }
    });
  }

  const syncCloudBtn = $('sync-cloud-btn');
  if (syncCloudBtn) {
    syncCloudBtn.addEventListener('click', async () => {
      const lastSync = $('last-sync-text');
      if (lastSync) lastSync.textContent = 'Syncing...';
      try {
        const response = await chrome.runtime.sendMessage({ action: 'syncCloud' });
        if (lastSync) {
          lastSync.textContent = response && response.success
            ? 'Synced: ' + new Date().toLocaleString()
            : 'Sync failed: ' + (response ? response.error : 'unknown');
        }
      } catch (err) {
        if (lastSync) lastSync.textContent = 'Sync error: ' + err.message;
      }
    });
  }
}

// ─── Utils ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
