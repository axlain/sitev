import { API_BASE, fetchWithTokenForm } from './api';

export async function subirArchivo(file, meta = {}) {
  const fd = new FormData();
  fd.append('file', file);
  Object.entries(meta || {}).forEach(([k, v]) => fd.append(k, String(v)));
  return fetchWithTokenForm(`${API_BASE}/api/sitev/archivo/subir`, fd);
}