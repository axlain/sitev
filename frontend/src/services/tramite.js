// src/services/tramite.js
import { API_BASE, fetchWithToken } from './api';

// Crear
export async function crearTramite({ nombre, descripcion, id_area }) {
  return fetchWithToken(`${API_BASE}/api/sitev/tramite/crear`, {
    method: 'POST',
    body: JSON.stringify({ nombre, descripcion, id_area }),
  });
}

// Editar
export async function editarTramite(id, payload) {
  const qs = new URLSearchParams({ id: String(id) }).toString();
  return fetchWithToken(`${API_BASE}/api/sitev/tramite/editar?${qs}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// Eliminar
export async function eliminarTramite(id) {
  const qs = new URLSearchParams({ id: String(id) }).toString();
  return fetchWithToken(`${API_BASE}/api/sitev/tramite/eliminar?${qs}`, {
    method: 'DELETE',
  });
}

/**
 * Listar trámites por área (normalizado)
 * Devuelve: [{ id, nombre, id_area }]
 * Tolera varios endpoints del back:
 *  - /tramite/porArea?id_area=...
 *  - /tramite/porArea?id=...
 *  - /tramite/porArea/{id}
 *  - /tramite/todos (filtra por id_area)
 */
export async function tramitesPorArea(id_area) {
  const id = Number(id_area);
  const urls = [
    `${API_BASE}/api/sitev/tramite/porArea?id_area=${id}`,
    `${API_BASE}/api/sitev/tramite/porArea?id=${id}`,
    `${API_BASE}/api/sitev/tramite/porArea/${id}`,
    `${API_BASE}/api/sitev/tramite/todos`,
  ];

  for (const u of urls) {
    try {
      const r = await fetchWithToken(u, { method: 'GET' });
      const list = Array.isArray(r?.data) ? r.data : [];
      const mapped = list.map(t => ({
        id: Number(t.id ?? t.id_tramite),
        nombre: t.nombre,
        id_area: Number(t.id_area ?? t.area_id),
      }));
      if (u.endsWith('/todos')) {
        return mapped.filter(x => !id || x.id_area === id);
      }
      return mapped;
    } catch {
      // probar siguiente url
    }
  }
  return [];
}
