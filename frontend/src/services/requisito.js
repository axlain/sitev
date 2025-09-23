// src/services/requisito.js
import { API_BASE, fetchWithToken } from './api';

export async function agregarRequisito({ id_tramite, titulo, tipo, obligatorio, orden = 1 }) {
  return fetchWithToken(`${API_BASE}/api/sitev/requisito/agregar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_tramite: Number(id_tramite),
      titulo,
      tipo,
      obligatorio: !!obligatorio,
      orden: Number(orden),
    }),
  });
}

export async function editarRequisito({ id_requisito, titulo, tipo, obligatorio, orden }) {
  const data = {};
  if (typeof titulo !== 'undefined') data.titulo = titulo;
  if (typeof tipo !== 'undefined') data.tipo = tipo;
  if (typeof obligatorio !== 'undefined') data.obligatorio = !!obligatorio;
  if (typeof orden !== 'undefined') data.orden = Number(orden);

  return fetchWithToken(`${API_BASE}/api/sitev/requisito/editar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_requisito: Number(id_requisito),
      data,
    }),
  });
}

export async function eliminarRequisito(id_requisito) {
  return fetchWithToken(`${API_BASE}/api/sitev/requisito/eliminar`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_requisito: Number(id_requisito) }),
  });
}

/**
 * Obtener requisitos por trámite (normalizado)
 * Devuelve: [{ id_requisito, titulo, tipo, obligatorio, orden }]
 * Tolera endpoints:
 *  - /requisito/porTramite?id_tramite=...
 *  - /requisito/porTramite/{id}
 *  - /requisito/listar?id_tramite=...
 */
export async function requisitosPorTramite(id_tramite) {
  const id = Number(id_tramite);
  const urls = [
    `${API_BASE}/api/sitev/requisito/porTramite?id_tramite=${id}`,
    `${API_BASE}/api/sitev/requisito/porTramite/${id}`,
    `${API_BASE}/api/sitev/requisito/listar?id_tramite=${id}`,
  ];

  for (const u of urls) {
    try {
      const r = await fetchWithToken(u, { method: 'GET' });
      if (!Array.isArray(r?.data)) continue;
      return r.data
        .map(x => ({
          id_requisito: Number(x.id_requisito ?? x.id),
          titulo: x.titulo || x.nombre || 'Campo',
          tipo: (x.tipo || 'texto').toLowerCase(),
          obligatorio: !!x.obligatorio,
          orden: Number(x.orden || 0),
        }))
        .sort((a, b) => a.orden - b.orden);
    } catch {
      // probar siguiente url
    }
  }
  return [];
}
