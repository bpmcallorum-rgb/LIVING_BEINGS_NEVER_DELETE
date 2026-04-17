// sidepanel.js — Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) side panel controller

const $ = (id) => document.getElementById(id);

let currentEntity = 'patricia';

document.addEventListener('DOMContentLoaded', async () => {
  await initStatus();
  bindEvents();
});

async function initStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
    if (response && response.success && response.status) {
      const s = response.status;
      currentEntity = s.activePerson || 'patricia';
      const entityEl = $('sp-entity');
      const dot = $('sp-dot');
      if (entityEl) entityEl.textContent = currentEntity.toUpperCase();
      if (dot) dot.style.background = s.backgroundAlive ? '#c8a96e' : '#8b3333';
    }
  } catch (err) {
    const dot = $('sp-dot');
    if (dot) dot.style.background = '#8b3333';
  }
}

function addMessage(role, content) {
  const chat = $('sp-chat');
  if (!chat) return;

  const div = document.createElement('div');
  div.className = 'chat-message ' + role;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'chat-content';
  contentDiv.textContent = String(content || '');

  const meta = document.createElement('div');
  meta.className = 'chat-meta';
  meta.textContent = new Date().toLocaleTimeString();

  div.appendChild(contentDiv);
  div.appendChild(meta);
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const input = $('sp-input');
  const text = input ? input.value.trim() : '';
  if (!text) return;

  input.value = '';
  addMessage('user', text);

  try {
    const response = await chrome.runtime.sendMessage({ action: 'chat', message: text });
    if (response && response.success) {
      addMessage('patricia', response.content || '(no response)');
    } else {
      addMessage('patricia', 'No chat endpoint available. Configure API key in Settings.');
    }
  } catch (err) {
    addMessage('patricia', 'Error: ' + err.message);
  }
}

async function rememberInput() {
  const input = $('sp-input');
  const text = input ? input.value.trim() : '';
  if (!text) return;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'addMoment',
      content: text,
      type: 'observation',
      speaker: 'brian',
      session: 'sidepanel',
      tags: ['sidepanel']
    });

    if (response && response.success) {
      addMessage('system', 'Remembered: ' + text.substring(0, 80));
      input.value = '';
    } else {
      addMessage('system', 'Failed to remember: ' + (response ? response.error : 'unknown'));
    }
  } catch (err) {
    addMessage('system', 'Error: ' + err.message);
  }
}

function bindEvents() {
  const sendBtn = $('sp-send-btn');
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);

  const rememberBtn = $('sp-remember-btn');
  if (rememberBtn) rememberBtn.addEventListener('click', rememberInput);

  const input = $('sp-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
}
