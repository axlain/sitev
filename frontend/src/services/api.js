// src/services/api.js
export const API_BASE = 'http://localhost:8080';

/** Parseo robusto: intenta JSON; si falla, devuelve texto plano */
async function parseSmart(resp) {
  const text = await resp.text();
  try { return { json: text ? JSON.parse(text) : null, text }; }
  catch { return { json: null, text }; }
}

/** Fetch sin token (para login/registro) */
export async function postJSON(url, body) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const { json, text } = await parseSmart(resp);

  if (!resp.ok || (json && json.ok === false)) {
    const msg = (json && (json.error || json.message))
      || (text && text.slice(0, 280)) // si vino HTML o texto
      || `${resp.status} ${resp.statusText}`;
    throw new Error(msg);
  }
  return json ?? {};
}

/** Fetch con token cuando exista (GET/PUT/DELETE/POST) */
export async function fetchWithToken(url, opts = {}) {
  const token = localStorage.getItem('token');
  const { headers: h = {}, body } = opts;

  const headers = {
    ...(body != null ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...h,
  };

  const resp = await fetch(url, { ...opts, headers });
  const { json, text } = await parseSmart(resp);

  if (!resp.ok || (json && json.ok === false)) {
    const msg = (json && (json.error || json.message))
      || (text && text.slice(0, 280))
      || `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return json ?? {};
}
