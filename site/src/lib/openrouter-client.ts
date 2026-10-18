// HELPINhex browser-side OpenRouter client — used by Ask HEX+ and the Playground.
// SECURITY MODEL: the key lives in localStorage and is sent ONLY to openrouter.ai
// from the user's own browser. It never touches any HELPINhex server (we have none).

const KEY_STORE = 'hx:orkey';
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export function getStoredKey(): string {
  try { return localStorage.getItem(KEY_STORE) || ''; } catch (e) { return ''; }
}

export function setStoredKey(key: string): void {
  try { localStorage.setItem(KEY_STORE, key); } catch (e) {}
}

export function clearStoredKey(): void {
  try { localStorage.removeItem(KEY_STORE); } catch (e) {}
}

function headers(key: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
    'HTTP-Referer': location.origin,
    'X-Title': 'HELPinhex',
  };
}

/** Streaming chat — calls onDelta with each text chunk as it arrives. */
export async function streamChat(
  opts: { key: string; model: string; messages: { role: string; content: string }[]; signal?: AbortSignal },
  onDelta: (text: string) => void
): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: headers(opts.key),
    body: JSON.stringify({ model: opts.model, messages: opts.messages, stream: true }),
    signal: opts.signal,
  });
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}${detail ? ' — ' + detail.slice(0, 300) : ''}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith('data:')) continue;
      const payload = t.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const j = JSON.parse(payload);
        const delta = j.choices?.[0]?.delta?.content;
        if (delta) onDelta(delta);
      } catch (e) {
        // partial/keepalive line — ignore
      }
    }
  }
}

/** One raw request — returns status + full response text. For the Playground (teaching raw JSON). */
export async function rawCall(
  opts: { key: string; model: string; messages: { role: string; content: string }[] }
): Promise<{ status: number; text: string }> {
  const body = { model: opts.model, messages: opts.messages };
  const res = await fetch(ENDPOINT, { method: 'POST', headers: headers(opts.key), body: JSON.stringify(body) });
  const text = await res.text();
  return { status: res.status, text };
}
