import React, { useEffect, useState } from "react";
import { listarInstancias } from "../../services/instancias";

export default function HistorialTramites({ theme, areaId }) {
  const T = theme;
  const [q, setQ] = useState("");        // texto (trámite/maestro)
  const [tipo, setTipo] = useState("");  // id_tramite
  const [maestro, setMaestro] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  function normalizeRows(data) {
    // El backend puede devolver [] o {data:[...]} o cualquier cosa
    const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    // Normaliza campos mínimos usados por la tabla
    return list.map(r => ({
      id: r.id ?? r.id_instancia ?? r.folio ?? Math.random().toString(36).slice(2),
      fecha: r.fecha ?? r.created_at ?? r.fecha_creacion ?? null,
      tramite: r.tramite ?? { nombre: r.tramite_nombre ?? "" },
      maestro: r.maestro ?? { nombre_completo: r.maestro_nombre ?? "" },
      escuela: r.escuela ?? { nombre: r.escuela_nombre ?? "" },
      estado: r.estado ?? r.status ?? "Registrado",
    }));
  }

  async function load() {
    if (!areaId) return; // evita llamada inválida
    setLoading(true);
    try {
      const data = await listarInstancias({ id_area: areaId, q, tipo, maestro });
      setRows(normalizeRows(data));
    } catch (e) {
      console.error("historial instancias:", e);
      setRows([]); // evita .map sobre undefined
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* carga inicial y cuando cambia el área */ }, [areaId]);

  const fmtFecha = (f) => {
    if (!f) return "-";
    const d = new Date(f);
    return isNaN(d.getTime()) ? String(f) : d.toLocaleDateString();
    // Si el back manda 'YYYY-MM-DD' o ISO, esto lo renderiza bien.
  };

  return (
    <div style={{
      marginTop: 20,
      background: "#fff",
      borderRadius: 16,
      padding: 18,
      border: "1px solid #e9e3dc",
      boxShadow: "0 4px 12px rgba(0,0,0,.06)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{
          padding: "4px 10px",
          borderRadius: 999, background: T?.pillBg || "#F8EFE8",
          color: T?.pillFg || "#9A4D39", fontWeight: 600, fontSize: 14
        }}>
          Trámites realizados
        </span>

        <input
          placeholder="Buscar… (trámite/maestro)"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid #d9d3cc" }}
        />
        <input
          placeholder="Filtrar por ID de trámite"
          value={tipo}
          onChange={(e)=>setTipo(e.target.value)}
          style={{ width: 180, padding: "8px 12px", borderRadius: 10, border: "1px solid #d9d3cc" }}
        />
        <input
          placeholder="Filtrar por maestro"
          value={maestro}
          onChange={(e)=>setMaestro(e.target.value)}
          style={{ width: 200, padding: "8px 12px", borderRadius: 10, border: "1px solid #d9d3cc" }}
        />
        <button onClick={load} style={{
          padding: "8px 14px",
          borderRadius: 10, border: "1px solid #b26b5a", background: "#c25742",
          color: "#fff", fontWeight: 600, cursor: "pointer"
        }}>
          Aplicar
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#faf7f4" }}>
              {["Folio","Fecha","Trámite","Maestro","Escuela","Estado"].map(h=>(
                <th key={h} style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #eee" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 14 }}>Cargando…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 14, color: "#7b7268" }}>Sin registros</td></tr>
            ) : (
              rows.map(r=>(
                <tr key={r.id} style={{ borderBottom: "1px solid #f0ebe6" }}>
                  <td style={{ padding: "8px" }}>{r.id}</td>
                  <td style={{ padding: "8px" }}>{fmtFecha(r.fecha)}</td>
                  <td style={{ padding: "8px" }}>{r.tramite?.nombre || "-"}</td>
                  <td style={{ padding: "8px" }}>{r.maestro?.nombre_completo || "-"}</td>
                  <td style={{ padding: "8px" }}>{r.escuela?.nombre || "-"}</td>
                  <td style={{ padding: "8px" }}>{r.estado || "Registrado"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
