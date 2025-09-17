// src/services/api.js
export const API_BASE = 'http://localhost:8080';

export async function fetchWithToken(url, opts = {}) {
  const token = localStorage.getItem('token');
  const resp = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok || json?.ok === false) {
    const msg = json?.error || json?.message || `${resp.status} ${resp.statusText}`;
    throw new Error(msg);
  }
  return json;
}
