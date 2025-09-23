// src/services/instancias.js
import { API_BASE, fetchWithToken } from './api';

// --- helpers ---
function buildMaestroNombre(maestro) {
  if (!maestro) return '';
  return [maestro.nombre, maestro.ap_paterno, maestro.ap_materno].filter(Boolean).join(' ').trim();
}

/**
 * NUEVO: crearInstancia(payloadGrande)
 * El Dashboard manda algo así:
 * {
 *   id_tramite, id_area, id_maestro?, id_escuela?,
 *   maestro: { nombre, ap_paterno, ap_materno, rfc? },
 *   escuela_actual: { nombre?, clave? },
 *   fecha, datos_requisitos: {...}  // (aún no lo usa tu back)
 * }
 * Hoy tu endpoint acepta: { id_tramite, maestro_nombre }
 * Este wrapper traduce el payload grande al body mínimo.
 */
export async function crearInstancia(payload) {
  const id_tramite = Number(payload?.id_tramite);
  const maestro_nombre =
    payload?.maestro_nombre ||
    buildMaestroNombre(payload?.maestro) ||
    'SIN NOMBRE';

  return fetchWithToken(`${API_BASE}/api/sitev/instancia/crear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_tramite, maestro_nombre })
  });
}

// === lo que ya tenías ===
export async function iniciarTramite({ id_tramite, maestro_nombre }) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/crear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_tramite, maestro_nombre })
  });
}

export async function obtenerInstanciaDetalle(id_instancia) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/detalle?id=${id_instancia}`);
}

export async function guardarValor({ id_instancia, id_requisito, valor }) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/llenar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_instancia, id_requisito, valor })
  });
}

export async function buscarInstanciasPorMaestro(q) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/buscar?q=${encodeURIComponent(q)}`);
}

/** listar instancias por tipo de trámite */
export async function listarInstanciasPorTramite(id_tramite) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/porTramite?id_tramite=${id_tramite}`);
}

// OJO: esto edita requisitos de instancia si lo usas en otro flujo
export async function editarRequisito({ id_requisito, titulo, tipo, obligatorio }) {
  return fetchWithToken(`${API_BASE}/api/sitev/requisito/editar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_requisito, titulo, tipo, obligatorio: !!obligatorio })
  });
}
