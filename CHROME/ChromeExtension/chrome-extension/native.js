// NativeMessaging — bridge between extension and Mac filesystem via native host

export class NativeMessaging {
  static HOST_NAME = 'com.mcallorum.patricia';
  static _port = null;
  static _pendingRequests = new Map();
  static _requestId = 0;

  static connect() {
    try {
      NativeMessaging._port = chrome.runtime.connectNative(NativeMessaging.HOST_NAME);

      NativeMessaging._port.onMessage.addListener((response) => {
        const id = response._requestId;
        if (id !== undefined && NativeMessaging._pendingRequests.has(id)) {
          const { resolve } = NativeMessaging._pendingRequests.get(id);
          NativeMessaging._pendingRequests.delete(id);
          resolve(response);
        }
      });

      NativeMessaging._port.onDisconnect.addListener(() => {
        const err = chrome.runtime.lastError;
        console.warn('[NativeMessaging] disconnected:', err ? err.message : 'unknown reason');
        NativeMessaging._port = null;
        // Reject all pending requests
        for (const [id, { reject }] of NativeMessaging._pendingRequests) {
          reject(new Error('Native host disconnected'));
        }
        NativeMessaging._pendingRequests.clear();
      });

      return true;
    } catch (err) {
      console.error('[NativeMessaging] connect error:', err);
      return false;
    }
  }

  static isConnected() {
    return NativeMessaging._port !== null;
  }

  static async send(message) {
    if (!NativeMessaging._port) {
      NativeMessaging.connect();
    }
    if (!NativeMessaging._port) {
      return { success: false, error: 'Native host not connected' };
    }

    const id = ++NativeMessaging._requestId;
    const msgWithId = { ...message, _requestId: id };

    return new Promise((resolve, reject) => {
      NativeMessaging._pendingRequests.set(id, { resolve, reject });

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        if (NativeMessaging._pendingRequests.has(id)) {
          NativeMessaging._pendingRequests.delete(id);
          reject(new Error('Native messaging timeout'));
        }
      }, 10000);

      try {
        NativeMessaging._port.postMessage(msgWithId);
      } catch (err) {
        clearTimeout(timeout);
        NativeMessaging._pendingRequests.delete(id);
        NativeMessaging._port = null;
        reject(err);
      }
    });
  }

  static async readFile(path) {
    try {
      const response = await NativeMessaging.send({ action: 'readFile', path });
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  static async writeFile(path, content) {
    try {
      const response = await NativeMessaging.send({ action: 'writeFile', path, content });
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  static async appendFile(path, content) {
    try {
      const response = await NativeMessaging.send({ action: 'appendFile', path, content });
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  static async listDirectory(path) {
    try {
      const response = await NativeMessaging.send({ action: 'listDirectory', path });
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  static async executeAppleScript(script) {
    try {
      const response = await NativeMessaging.send({ action: 'executeAppleScript', script });
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  static async getSystemInfo() {
    try {
      const response = await NativeMessaging.send({ action: 'getSystemInfo' });
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  static async ping() {
    try {
      const response = await NativeMessaging.send({ action: 'ping' });
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  static async readPatricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Brain() {
    try {
      const response = await NativeMessaging.send({ action: 'readPatricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Brain' });
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}
