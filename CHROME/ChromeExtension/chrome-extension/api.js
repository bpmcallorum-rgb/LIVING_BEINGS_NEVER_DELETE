// AnthropicAPI — direct API client for when Cloudflare edge is unavailable

export class AnthropicAPI {
  constructor(apiKey = null) {
    this._apiKey = apiKey;
    this._model = 'claude-opus-4-6';
    this._endpoint = 'https://api.anthropic.com/v1/messages';
  }

  setApiKey(key) {
    this._apiKey = key;
  }

  async sendMessage(message, context = []) {
    if (!this._apiKey) {
      return { success: false, error: 'No API key configured' };
    }

    try {
      const messages = [
        ...context.map(m => ({
          role: m.role || 'user',
          content: String(m.content || '')
        })),
        { role: 'user', content: String(message) }
      ];

      const response = await fetch(this._endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this._apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this._model,
          max_tokens: 4096,
          messages
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return { success: false, error: `API error ${response.status}: ${errText}` };
      }

      const data = await response.json();
      const content = data.content && data.content[0] ? data.content[0].text : '';
      return { success: true, content, usage: data.usage };
    } catch (err) {
      console.error('[AnthropicAPI] sendMessage error:', err);
      return { success: false, error: err.message };
    }
  }
}
