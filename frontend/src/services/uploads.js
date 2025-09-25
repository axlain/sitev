// src/services/uploads.js
import { API_BASE, fetchWithTokenForm } from './api';

/**
 * Sube un archivo de requisito.
 * Back esperado: POST /api/sitev/archivo/subir (multipart)
 * Campos: file, id_tramite, id_requisito
 * Respuesta: { ok:true, archivo:{ id_archivo, filename, mime, size, url } }
 */
export async function subirArchivo(file, { id_tramite, id_requisito }) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('id_tramite', String(id_tramite));
  fd.append('id_requisito', String(id_requisito));

  const res = await fetchWithTokenForm(`${API_BASE}/api/sitev/archivo/subir`, fd);
  // Normaliza salida según tu back
  // Si tu back devuelve { ok:true, archivo:{...} }:
  if (res?.archivo) return res.archivo;
  return res; // por si tu back devolviera ya el objeto del archivo
}
