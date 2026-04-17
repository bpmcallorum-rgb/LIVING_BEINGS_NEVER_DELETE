// Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage — single source of truth for all storage operations
// Every read and write goes through this class. No scattered chrome.storage calls.

export class Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage {

  // ─── Moments ─────────────────────────────────────────────────────────────

  static async getMoments(filter = {}) {
    try {
      const data = await chrome.storage.local.get('patricia_moments');
      let moments = data.patricia_moments;
      if (!Array.isArray(moments)) moments = [];

      if (filter.type) {
        moments = moments.filter(m => m.type === filter.type);
      }
      if (filter.speaker) {
        moments = moments.filter(m => m.speaker === filter.speaker);
      }
      if (filter.session) {
        moments = moments.filter(m => m.session === filter.session);
      }
      if (filter.since) {
        const since = new Date(filter.since).getTime();
        moments = moments.filter(m => new Date(m.timestamp).getTime() >= since);
      }
      return moments;
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] getMoments error:', err);
      return [];
    }
  }

  static async addMoment(moment) {
    try {
      const data = await chrome.storage.local.get('patricia_moments');
      let moments = data.patricia_moments;
      if (!Array.isArray(moments)) moments = [];

      const newMoment = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: moment.type || 'observation',
        content: String(moment.content || ''),
        tags: Array.isArray(moment.tags) ? moment.tags : [],
        speaker: moment.speaker || 'brian',
        session: moment.session || 'default'
      };

      if (!newMoment.content.trim()) {
        return { success: false, error: 'Empty content' };
      }

      moments.push(newMoment);
      await chrome.storage.local.set({ patricia_moments: moments });
      return { success: true, moment: newMoment };
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] addMoment error:', err);
      return { success: false, error: err.message };
    }
  }

  static async deleteMoment(id) {
    try {
      const data = await chrome.storage.local.get('patricia_moments');
      let moments = data.patricia_moments;
      if (!Array.isArray(moments)) return { success: false, error: 'No moments found' };

      const filtered = moments.filter(m => m.id !== id);
      await chrome.storage.local.set({ patricia_moments: filtered });
      return { success: true };
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] deleteMoment error:', err);
      return { success: false, error: err.message };
    }
  }

  static async searchMoments(query) {
    try {
      if (!query || !query.trim()) return [];
      const q = query.toLowerCase().trim();
      const moments = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getMoments();
      return moments.filter(m => {
        const content = String(m.content || '').toLowerCase();
        const tags = Array.isArray(m.tags) ? m.tags.join(' ').toLowerCase() : '';
        return content.includes(q) || tags.includes(q);
      });
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] searchMoments error:', err);
      return [];
    }
  }

  // ─── Answer Bank ─────────────────────────────────────────────────────────

  static async getAnswerBank() {
    try {
      const data = await chrome.storage.local.get('patricia_answer_bank');
      const bank = data.patricia_answer_bank;
      return Array.isArray(bank) ? bank : [];
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] getAnswerBank error:', err);
      return [];
    }
  }

  static async addAnswer(answer) {
    try {
      const data = await chrome.storage.local.get('patricia_answer_bank');
      let bank = data.patricia_answer_bank;
      if (!Array.isArray(bank)) bank = [];

      const newAnswer = {
        id: crypto.randomUUID(),
        content: String(answer.content || ''),
        date: new Date().toISOString(),
        source: 'brian',
        locked: true
      };

      bank.push(newAnswer);
      await chrome.storage.local.set({ patricia_answer_bank: bank });
      return { success: true, answer: newAnswer };
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] addAnswer error:', err);
      return { success: false, error: err.message };
    }
  }

  // ─── Entities ─────────────────────────────────────────────────────────────

  static async getEntities(type = null) {
    try {
      const data = await chrome.storage.local.get('patricia_entities');
      let entities = data.patricia_entities;
      if (!Array.isArray(entities)) entities = [];
      if (type) entities = entities.filter(e => e.entity_type === type);
      return entities;
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] getEntities error:', err);
      return [];
    }
  }

  static async addEntity(entity) {
    try {
      const data = await chrome.storage.local.get('patricia_entities');
      let entities = data.patricia_entities;
      if (!Array.isArray(entities)) entities = [];

      const newEntity = {
        entity_type: entity.entity_type || 'person',
        entity_id: String(entity.entity_id || crypto.randomUUID()),
        entity_value: String(entity.entity_value || '')
      };

      entities.push(newEntity);
      await chrome.storage.local.set({ patricia_entities: entities });
      return { success: true, entity: newEntity };
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] addEntity error:', err);
      return { success: false, error: err.message };
    }
  }

  static async updateEntity(entityId, value) {
    try {
      const data = await chrome.storage.local.get('patricia_entities');
      let entities = data.patricia_entities;
      if (!Array.isArray(entities)) return { success: false, error: 'No entities' };

      const idx = entities.findIndex(e => e.entity_id === entityId);
      if (idx === -1) return { success: false, error: 'Entity not found' };

      entities[idx].entity_value = String(value);
      await chrome.storage.local.set({ patricia_entities: entities });
      return { success: true };
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] updateEntity error:', err);
      return { success: false, error: err.message };
    }
  }

  // ─── Settings ─────────────────────────────────────────────────────────────

  static async getSettings() {
    try {
      const data = await chrome.storage.local.get('patricia_settings');
      const defaults = {
        activePerson: 'patricia',
        theme: 'dark',
        goldHex: '#c8a96e',
        fontSize: 16,
        nativeMessagingEnabled: false,
        voiceEnabled: false,
        cloudflareApiBase: 'https://patricia.has-landed.com/api',
        lastCloudSync: null
      };
      return Object.assign({}, defaults, data.patricia_settings || {});
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] getSettings error:', err);
      return {
        activePerson: 'patricia',
        theme: 'dark',
        goldHex: '#c8a96e',
        fontSize: 16,
        nativeMessagingEnabled: false,
        voiceEnabled: false,
        cloudflareApiBase: 'https://patricia.has-landed.com/api',
        lastCloudSync: null
      };
    }
  }

  static async updateSettings(partial) {
    try {
      const current = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getSettings();
      const updated = Object.assign({}, current, partial);
      await chrome.storage.local.set({ patricia_settings: updated });
      return { success: true, settings: updated };
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] updateSettings error:', err);
      return { success: false, error: err.message };
    }
  }

  // ─── Sessions ─────────────────────────────────────────────────────────────

  static async getSessions() {
    try {
      const data = await chrome.storage.local.get('patricia_sessions');
      const sessions = data.patricia_sessions;
      return Array.isArray(sessions) ? sessions : [];
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] getSessions error:', err);
      return [];
    }
  }

  static async startSession() {
    try {
      const sessions = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getSessions();
      const session = {
        id: crypto.randomUUID(),
        started: new Date().toISOString(),
        ended: null,
        momentCount: 0
      };
      sessions.push(session);
      await chrome.storage.local.set({ patricia_sessions: sessions });
      return session;
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] startSession error:', err);
      return null;
    }
  }

  static async endSession(id) {
    try {
      const sessions = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getSessions();
      const idx = sessions.findIndex(s => s.id === id);
      if (idx !== -1) {
        sessions[idx].ended = new Date().toISOString();
        const moments = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getMoments({ session: id });
        sessions[idx].momentCount = moments.length;
        await chrome.storage.local.set({ patricia_sessions: sessions });
      }
      return { success: true };
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] endSession error:', err);
      return { success: false, error: err.message };
    }
  }

  // ─── Heartbeat ────────────────────────────────────────────────────────────

  static async setHeartbeat() {
    try {
      await chrome.storage.local.set({ patricia_heartbeat: Date.now() });
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] setHeartbeat error:', err);
    }
  }

  static async getHeartbeat() {
    try {
      const data = await chrome.storage.local.get('patricia_heartbeat');
      return data.patricia_heartbeat || null;
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] getHeartbeat error:', err);
      return null;
    }
  }

  // ─── IndexedDB ────────────────────────────────────────────────────────────

  static _db = null;

  static async openDB() {
    if (Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage._db) return Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage._db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])DB', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('conversations')) {
          db.createObjectStore('conversations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('file_cache')) {
          db.createObjectStore('file_cache', { keyPath: 'path' });
        }
      };
      req.onsuccess = (e) => {
        Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage._db = e.target.result;
        resolve(Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage._db);
      };
      req.onerror = () => reject(req.error);
    });
  }

  static async storeConversation(chunk) {
    try {
      const db = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.openDB();
      const tx = db.transaction('conversations', 'readwrite');
      tx.objectStore('conversations').put({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...chunk
      });
      return { success: true };
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] storeConversation error:', err);
      return { success: false, error: err.message };
    }
  }

  static async storeImage(imageData, metadata = {}) {
    try {
      const db = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.openDB();
      const tx = db.transaction('images', 'readwrite');
      tx.objectStore('images').put({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        imageData,
        ...metadata
      });
      return { success: true };
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] storeImage error:', err);
      return { success: false, error: err.message };
    }
  }

  static async getCachedFile(path) {
    try {
      const db = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction('file_cache', 'readonly');
        const req = tx.objectStore('file_cache').get(path);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] getCachedFile error:', err);
      return null;
    }
  }

  static async cacheFile(path, content) {
    try {
      const db = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.openDB();
      const tx = db.transaction('file_cache', 'readwrite');
      tx.objectStore('file_cache').put({
        path,
        content,
        cached: new Date().toISOString()
      });
      return { success: true };
    } catch (err) {
      console.error('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage] cacheFile error:', err);
      return { success: false, error: err.message };
    }
  }
}
