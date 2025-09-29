import React, { useEffect, useMemo, useRef, useState } from "react";
import { tramitesPorArea, tramitesPorAreaFallback } from "../../services/tramite";

const strip = (s = "") =>
  s.normalize?.("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || s.toLowerCase();

export default function TramitePicker({ theme, areaId, selected, onSelect }) {
  const [q, setQ] = useState("");
  const [all, setAll] = useState([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const T = theme;

  useEffect(() => {
    let alive = true;
    (async () => {
      // Guard: si no hay área, no intentes llamar al backend
      if (!areaId) { if (alive) setAll([]); return; }

      try {
        // Intenta el endpoint canon; si falla, usa el fallback
        const arr = await tramitesPorArea(areaId).catch(() => tramitesPorAreaFallback(areaId));
        if (alive) setAll(Array.isArray(arr) ? arr : []);
      } catch (e) {
        console.error("tramitesPorArea error:", e);
        if (alive) setAll([]);
      }
    })();
    return () => { alive = false; };
  }, [areaId]);

  const list = useMemo(() => {
    const needle = strip(q.trim());
    if (!needle) return all;
    return all.filter(t =>
      [t.nombre, t.descripcion].some(s => strip(s || "").includes(needle))
    );
  }, [q, all]);

  function handlePick(t) {
    setOpen(false);
    setQ("");
    onSelect?.(t);             // t: { id, nombre, id_area, descripcion }
    setTimeout(() => inputRef.current?.blur(), 0);
  }

  const noArea = !areaId;

  return (
    <div style={{ background:"#fff", borderRadius:16, padding:18, border:"1px solid #e9e3dc", boxShadow:"0 4px 12px rgba(0,0,0,.06)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ padding:"4px 10px", borderRadius:999, background:"#F8EFE8", color:"#9A4D39", fontWeight:600, fontSize:14 }}>
          Trámite
        </span>

        <div style={{ position:"relative", flex:1 }}>
          <input
            ref={inputRef}
            value={q}
            onFocus={() => !noArea && setOpen(true)}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              noArea
                ? "No se detectó el área del usuario"
                : (selected ? selected.nombre : "Buscar trámite (opcional)")
            }
            disabled={noArea}
            style={{
              width:"100%", fontSize:16, padding:"10px 14px", borderRadius:12,
              border:"1px solid #d9d3cc", outline:"none",
              background: noArea ? "#f5f2ef" : "#fff", color: noArea ? "#9a9188" : "#111"
            }}
          />
          {open && (
            <div
              style={{
                position:"absolute", zIndex:10, top:"calc(100% + 6px)", left:0, right:0,
                maxHeight:280, overflow:"auto", background:"#fff",
                border:"1px solid #e5ded6", borderRadius:12, boxShadow:"0 10px 24px rgba(0,0,0,.08)"
              }}
              onMouseDown={(e)=>e.preventDefault()}
            >
              {list.length === 0 ? (
                <div style={{ padding:12, color:"#8a8176" }}>Sin resultados</div>
              ) : (
                list.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handlePick(t)}
                    style={{
                      display:"block", width:"100%", textAlign:"left",
                      padding:"10px 12px", border:"none", background:"transparent",
                      cursor:"pointer", fontSize:15
                    }}
                    onMouseEnter={(e)=> e.currentTarget.style.background="#faf7f4"}
                    onMouseLeave={(e)=> e.currentTarget.style.background="transparent"}
                  >
                    <div style={{ fontWeight:600 }}>{t.nombre}</div>
                    {t.descripcion && <div style={{ fontSize:12, color:"#81786f" }}>{t.descripcion}</div>}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {selected && <span style={{ fontSize:14, color:"#7b7268" }}>Seleccionado: <b>{selected.nombre}</b></span>}
      </div>
    </div>
  );
}
