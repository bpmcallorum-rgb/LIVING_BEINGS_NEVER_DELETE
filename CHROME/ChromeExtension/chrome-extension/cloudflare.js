// CloudflareSync — bidirectional sync between local storage and Cloudflare D1/edge

export class CloudflareSync {
  constructor(apiBase, userId = 'brian') {
    this._apiBase = apiBase || 'https://patricia.has-landed.com/api';
    this._userId = userId;
    this._reachable = null;
    this._lastCheck = 0;
  }

  async isReachable() {
    // Cache reachability check for 30 seconds
    if (Date.now() - this._lastCheck < 30000) {
      return this._reachable;
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${this._apiBase}/ping`, {
        signal: controller.signal
      });
      clearTimeout(timeout);
      this._reachable = response.ok;
      this._lastCheck = Date.now();
      return this._reachable;
    } catch (err) {
      this._reachable = false;
      this._lastCheck = Date.now();
      return false;
    }
  }

  async syncMomentsUp(moments) {
    if (!Array.isArray(moments) || moments.length === 0) return { success: true, synced: 0 };
    try {
      const response = await fetch(`${this._apiBase}/moments/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this._userId, moments })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, synced: data.synced || moments.length };
    } catch (err) {
      console.error('[CloudflareSync] syncMomentsUp error:', err);
      return { success: false, error: err.message };
    }
  }

  async syncMomentsDown() {
    try {
      const response = await fetch(`${this._apiBase}/moments?userId=${this._userId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, moments: Array.isArray(data.moments) ? data.moments : [] };
    } catch (err) {
      console.error('[CloudflareSync] syncMomentsDown error:', err);
      return { success: false, moments: [], error: err.message };
    }
  }

  async sync(localMoments) {
    const reachable = await this.isReachable();
    if (!reachable) {
      return { success: false, error: 'Cloudflare edge not reachable' };
    }

    try {
      // Push local moments up
      const upResult = await this.syncMomentsUp(localMoments);

      // Pull cloud moments down
      const downResult = await this.syncMomentsDown();

      // Merge and deduplicate by id
      const cloudMoments = Array.isArray(downResult.moments) ? downResult.moments : [];
      const merged = this._mergeMoments(localMoments, cloudMoments);

      return {
        success: true,
        merged,
        pushed: upResult.synced || 0,
        pulled: cloudMoments.length
      };
    } catch (err) {
      console.error('[CloudflareSync] sync error:', err);
      return { success: false, error: err.message };
    }
  }

  _mergeMoments(local, cloud) {
    const map = new Map();
    for (const m of local) {
      if (m && m.id) map.set(m.id, m);
    }
    for (const m of cloud) {
      if (m && m.id && !map.has(m.id)) map.set(m.id, m);
    }
    return Array.from(map.values()).sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  async chat(message, context = []) {
    const reachable = await this.isReachable();
    if (!reachable) {
      return { success: false, error: 'Cloudflare edge not reachable', fallback: true };
    }

    try {
      const response = await fetch(`${this._apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this._userId,
          message: String(message),
          context: Array.isArray(context) ? context : []
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, content: data.content || data.response || '' };
    } catch (err) {
      console.error('[CloudflareSync] chat error:', err);
      return { success: false, error: err.message, fallback: true };
    }
  }
}
