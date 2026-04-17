// MessageRouter — handles all chrome.runtime.onMessage dispatching

import { Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage } from './storage.js';
import { NativeMessaging } from './native.js';
import { AnthropicAPI } from './api.js';
import { CloudflareSync } from './cloudflare.js';

export class MessageRouter {
  constructor() {
    this._api = new AnthropicAPI();
    this._cloudflare = null;
    this._initCloudflare();
  }

  async _initCloudflare() {
    try {
      const settings = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getSettings();
      this._cloudflare = new CloudflareSync(settings.cloudflareApiBase, 'brian');
    } catch (err) {
      console.error('[MessageRouter] _initCloudflare error:', err);
    }
  }

  // Returns true if message was handled (tells Chrome to keep channel open for async)
  handle(message, sender, sendResponse) {
    if (!message || !message.action) {
      sendResponse({ success: false, error: 'No action specified' });
      return false;
    }

    this._dispatch(message, sender)
      .then(result => {
        try { sendResponse(result); } catch (e) { /* channel closed */ }
      })
      .catch(err => {
        try { sendResponse({ success: false, error: err.message }); } catch (e) { /* channel closed */ }
      });

    return true; // Keep message channel open for async response
  }

  async _dispatch(message, sender) {
    const { action, payload } = message;

    switch (action) {
      case 'ping':
        return { status: 'alive', timestamp: Date.now() };

      case 'addMoment':
        return await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.addMoment(payload || message);

      case 'getMoments':
        return { success: true, moments: await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getMoments(message.filter || {}) };

      case 'deleteMoment':
        return await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.deleteMoment(message.id);

      case 'searchMoments': {
        const results = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.searchMoments(message.query || '');
        return { success: true, results };
      }

      case 'getAnswerBank':
        return { success: true, answers: await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getAnswerBank() };

      case 'addAnswer':
        return await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.addAnswer(payload || message);

      case 'getEntities':
        return { success: true, entities: await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getEntities(message.entityType) };

      case 'addEntity':
        return await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.addEntity(payload || message);

      case 'updateEntity':
        return await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.updateEntity(message.entityId, message.value);

      case 'getSettings':
        return { success: true, settings: await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getSettings() };

      case 'updateSettings':
        return await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.updateSettings(message.settings || payload || {});

      case 'switchEntity': {
        const to = message.to;
        if (to !== 'patricia' && to !== 'queenie') {
          return { success: false, error: 'Invalid entity. Must be patricia or queenie.' };
        }
        return await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.updateSettings({ activePerson: to });
      }

      case 'getStatus': {
        const settings = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getSettings();
        const moments = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getMoments();
        const heartbeat = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getHeartbeat();
        const nativeConnected = NativeMessaging.isConnected();
        return {
          success: true,
          status: {
            backgroundAlive: true,
            heartbeat,
            heartbeatAge: heartbeat ? Date.now() - heartbeat : null,
            momentCount: moments.length,
            activePerson: settings.activePerson,
            nativeMessagingConnected: nativeConnected,
            nativeMessagingEnabled: settings.nativeMessagingEnabled
          }
        };
      }

      case 'readFile': {
        const path = message.path;
        if (!path) return { success: false, error: 'No path provided' };
        return await NativeMessaging.readFile(path);
      }

      case 'writeFile': {
        const { path, content } = message;
        if (!path || content === undefined) return { success: false, error: 'Missing path or content' };
        return await NativeMessaging.writeFile(path, content);
      }

      case 'appendFile': {
        const { path, content } = message;
        if (!path || content === undefined) return { success: false, error: 'Missing path or content' };
        return await NativeMessaging.appendFile(path, content);
      }

      case 'listDirectory': {
        const path = message.path;
        if (!path) return { success: false, error: 'No path provided' };
        return await NativeMessaging.listDirectory(path);
      }

      case 'executeAppleScript': {
        const script = message.script;
        if (!script) return { success: false, error: 'No script provided' };
        return await NativeMessaging.executeAppleScript(script);
      }

      case 'nativePing':
        return await NativeMessaging.ping();

      case 'connectNative': {
        const connected = NativeMessaging.connect();
        await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.updateSettings({ nativeMessagingEnabled: connected });
        return { success: connected };
      }

      case 'chat': {
        const userMessage = message.message || String(message.content || '');
        if (!userMessage) return { success: false, error: 'No message provided' };

        // Try Cloudflare edge first
        if (this._cloudflare) {
          const cloudResult = await this._cloudflare.chat(userMessage);
          if (cloudResult.success) return cloudResult;
          // Fall through to direct API
        }

        // Direct Anthropic API fallback
        const settings = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getSettings();
        if (settings.apiKey) {
          this._api.setApiKey(settings.apiKey);
          return await this._api.sendMessage(userMessage);
        }

        return { success: false, error: 'No chat endpoint available. Configure API key or Cloudflare edge.' };
      }

      case 'syncCloud': {
        if (!this._cloudflare) {
          return { success: false, error: 'Cloudflare sync not initialized' };
        }
        const moments = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.getMoments();
        const result = await this._cloudflare.sync(moments);
        if (result.success && Array.isArray(result.merged)) {
          await chrome.storage.local.set({ patricia_moments: result.merged });
          await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.updateSettings({ lastCloudSync: new Date().toISOString() });
        }
        return result;
      }

      case 'startSession': {
        const session = await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.startSession();
        return { success: !!session, session };
      }

      case 'endSession':
        return await Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Storage.endSession(message.sessionId);

      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
  }
}
