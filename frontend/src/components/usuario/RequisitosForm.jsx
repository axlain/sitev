import React, { useEffect, useState } from 'react';
import { card, pill, title, input, primaryBtn, ghostBtn, feedback } from './ui';
import { requisitosPorTramite } from '../../services/requisito';

export default function RequisitosForm({ theme, tramite, values, onChange, onSubmit, saving, okMsg, errMsg }) {
  const [requisitos, setRequisitos] = useState([]);

  useEffect(() => {
    (async () => {
      if (!tramite) { setRequisitos([]); onChange({}); return; }
      const list = await requisitosPorTramite(tramite.id);
      setRequisitos(list);
      const init = {}; list.forEach(r => { init[r.id_requisito] = ''; });
      onChange(init);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tramite?.id]);

  return (
    <section style={card(theme)}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={pill(theme)}>Requisitos</span>
        <h2 style={title}>Completa los datos</h2>
      </div>

      {requisitos.length === 0 ? (
        <div style={{ marginTop: 8, color: '#777' }}>Este trámite no tiene requisitos configurados.</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:10 }}>
          {requisitos.map(r => (
            <Field key={r.id_requisito} req={r} value={values?.[r.id_requisito] || ''} onChange={(v)=>onChange({ ...(values||{}), [r.id_requisito]: v })} theme={theme} />
          ))}
        </div>
      )}

      {errMsg && <div style={feedback(theme,'err')}>{errMsg}</div>}
      {okMsg && <div style={feedback(theme,'ok')}>{okMsg}</div>}

      <div style={{ display:'flex', gap:10, marginTop:14, flexWrap:'wrap' }}>
        <button onClick={onSubmit} disabled={saving || !tramite} style={primaryBtn(theme)}>{saving?'Guardando…':'Guardar instancia'}</button>
        <button onClick={()=>onChange({})} style={ghostBtn(theme)}>Limpiar</button>
      </div>
    </section>
  );
}

function Field({ req, value, onChange, theme }) {
  const Label = (
    <label style={{ color:'#111', fontWeight:700, fontSize:18 }}>
      {req.titulo} {req.obligatorio ? <span style={{ color: theme.red }}>*</span> : null}
    </label>
  );
  if (req.tipo === 'number' || req.tipo === 'numero')
    return <div>{Label}<input type="number" value={value} onChange={e=>onChange(e.target.value)} style={input(theme)} /></div>;
  if (req.tipo === 'fecha')
    return <div>{Label}<input type="date" value={value} onChange={e=>onChange(e.target.value)} style={input(theme)} /></div>;
  if (req.tipo === 'file' || req.tipo === 'archivo')
    return <div>{Label}<input type="file" onChange={e=>onChange(e.target.files?.[0] || null)} style={input(theme)} /></div>;
  if (req.tipo === 'textarea' || req.tipo === 'texto_largo')
    return <div>{Label}<textarea rows={3} value={value} onChange={e=>onChange(e.target.value)} style={input(theme)} /></div>;
  return <div>{Label}<input type="text" value={value} onChange={e=>onChange(e.target.value)} style={input(theme)} /></div>;
}
