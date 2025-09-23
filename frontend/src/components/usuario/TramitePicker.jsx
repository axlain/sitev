import React, { useEffect, useRef, useState } from 'react';
import { card, pill, title, input, combo, comboEmpty, comboItem } from './ui';
import { tramitesPorArea } from '../../services/tramite';

export default function TramitePicker({ theme, areaId, selected, onSelect }) {
  const [todos, setTodos] = useState([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const boxRef = useRef(null);

  useEffect(() => {
    (async () => setTodos(await tramitesPorArea(areaId)))();
  }, [areaId]);

  useEffect(() => {
    const h = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', h); return () => document.removeEventListener('click', h);
  }, []);

  function filtrar(s) {
    const x = (s || '').toLowerCase();
    setFiltered(todos.filter(t => t.nombre?.toLowerCase().includes(x)));
  }

  return (
    <section style={card(theme)}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={pill(theme)}>Trámite</span>
          <h2 style={title}>Selecciona un trámite</h2>
        </div>
        <div ref={boxRef} style={{ position:'relative', minWidth:320 }}>
          <input
            placeholder={selected ? selected.nombre : 'Buscar trámite'}
            value={q}
            onFocus={()=>setOpen(true)}
            onChange={(e)=>{ setQ(e.target.value); setOpen(true); filtrar(e.target.value); }}
            style={input(theme)}
          />
          {open && (
            <div style={combo(theme)}>
              {(filtered.length===0) && <div style={comboEmpty}>Sin resultados</div>}
              {filtered.map(t => (
                <button key={t.id} type="button" style={comboItem} onClick={()=>{ onSelect(t); setOpen(false); setQ(''); }}>
                  {t.nombre}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {selected && <div style={{ marginTop: 10, fontSize: 16, color: '#555' }}>Seleccionado: <strong>{selected.nombre}</strong></div>}
    </section>
  );
}
