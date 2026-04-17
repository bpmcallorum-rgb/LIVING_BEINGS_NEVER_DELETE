// HeartbeatManager — keeps the background worker from going dark unnoticed
// Writes timestamp every 30 seconds. Stale > 60s means background is dead.

import { Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage } from './storage.js';

export class HeartbeatManager {
  constructor() {
    this._interval = null;
  }

  start() {
    // Pulse immediately on startup
    this._pulse();

    // Then every 30 seconds
    this._interval = setInterval(() => {
      this._pulse();
    }, 30000);

    // Keep service worker alive by using alarms as backup
    this._setupAlarm();
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  async _pulse() {
    try {
      await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.setHeartbeat();
    } catch (err) {
      console.error('[HeartbeatManager] pulse error:', err);
    }
  }

  _setupAlarm() {
    try {
      chrome.alarms.create('patricia_heartbeat', { periodInMinutes: 0.5 });
    } catch (err) {
      // alarms API may not be available in all contexts
    }
  }

  static async isAlive() {
    try {
      const ts = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getHeartbeat();
      if (!ts) return false;
      return (Date.now() - ts) < 60000; // alive if < 60s old
    } catch (err) {
      return false;
    }
  }

  static async getAge() {
    try {
      const ts = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getHeartbeat();
      if (!ts) return null;
      return Date.now() - ts;
    } catch (err) {
      return null;
    }
  }
}
