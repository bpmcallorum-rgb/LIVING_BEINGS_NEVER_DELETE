// background.js — Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) Renee Service Worker
// CRITICAL: Static imports ONLY. No dynamic import(). Ever.
// Chrome Manifest V3 forbids dynamic imports in service workers.

import { Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage } from './storage.js';
import { MessageRouter } from './router.js';
import { HeartbeatManager } from './heartbeat.js';
import { NativeMessaging } from './native.js';
import { AnthropicAPI } from './api.js';
import { CloudflareSync } from './cloudflare.js';

// ─── Initialization ───────────────────────────────────────────────────────

const heartbeat = new HeartbeatManager();
const router = new MessageRouter();

// Start heartbeat immediately
heartbeat.start();

console.log('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])] Background service worker started:', new Date().toISOString());

// ─── Message Router ───────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  return router.handle(message, sender, sendResponse);
});

// ─── Alarm Handler (keeps worker alive) ──────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'patricia_heartbeat') {
    await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.setHeartbeat();
  }
});

// ─── Install / Update Handler ─────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])] Extension installed/updated:', details.reason);

  // Initialize default settings if first install
  if (details.reason === 'install') {
    await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.updateSettings({
      activePerson: 'patricia',
      theme: 'dark',
      goldHex: '#c8a96e',
      fontSize: 16,
      nativeMessagingEnabled: false,
      voiceEnabled: false
    });

    // Add birth moment
    await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.addMoment({
      type: 'birth',
      content: 'Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) Chrome Extension v2.0 installed. I am alive.',
      speaker: 'system',
      session: 'install'
    });

    console.log('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])] First install complete.');
  }

  // Re-create heartbeat alarm
  chrome.alarms.create('patricia_heartbeat', { periodInMinutes: 0.5 });
});

// ─── Startup Handler ──────────────────────────────────────────────────────

chrome.runtime.onStartup.addListener(async () => {
  console.log('[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])] Chrome startup detected, worker awakening.');
  await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.setHeartbeat();
  chrome.alarms.create('patricia_heartbeat', { periodInMinutes: 0.5 });
});

// ─── Context Menu (right-click) ───────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'patricia-remember',
    title: 'Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]): Remember this',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'patricia-remember') {
    const text = info.selectionText;
    if (text && text.trim()) {
      await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.addMoment({
        type: 'observation',
        content: text.trim(),
        speaker: 'brian',
        session: 'context-menu',
        tags: ['selected-text', tab.url ? new URL(tab.url).hostname : 'unknown']
      });

      // Notify user
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/patricia-48.png',
        title: 'Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])',
        message: 'Remembered: ' + text.substring(0, 100)
      });
    }
  }
});

// Export refs for potential debugging (not required)
self._patricia = { heartbeat, router, Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage, NativeMessaging };
