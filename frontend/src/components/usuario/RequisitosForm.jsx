import React, { useEffect, useState, useMemo } from 'react';
import { card, pill, title, input, primaryBtn, ghostBtn, feedback } from './ui';
import { requisitosPorTramite } from '../../services/requisito';
import { subirArchivo } from '../../services/uploads';

export default function RequisitosForm({ theme, tramite, values, onChange, onSubmit, saving, okMsg, errMsg }) {
  const [requisitos, setRequisitos] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [uploading, setUploading] = useState({});      // { [id_requisito]: true/false }
  const [previews, setPreviews]   = useState({});      // { [id_requisito]: {url, filename, mime} }

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!tramite?.id) { setRequisitos([]); onChange({}); return; }
      setLoadingReqs(true);
      try {
        const list = await requisitosPorTramite(tramite.id);
        if (!alive) return;
        setRequisitos(list || []);
        // Inicializa los valores por requisito
        const init = {};
        list.forEach(r => { init[r.id_requisito] = r.tipo === 'archivo' ? null : ''; });
        onChange(init);
        setPreviews({});
      } finally {
        if (alive) setLoadingReqs(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tramite?.id]);

  const setValue = (id_requisito, v) => onChange({ ...(values || {}), [id_requisito]: v });

  // Bloquea guardar si hay archivo obligatorio sin subir
  const canSubmit = useMemo(() => {
    if (!tramite?.id) return false;
    const falta = requisitos.some(r => r.tipo === 'archivo' && r.obligatorio && !values?.[r.id_requisito]);
    return !falta && !saving;
  }, [tramite?.id, requisitos, values, saving]);

  return (
    <section style={card(theme)}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={pill(theme)}>Requisitos</span>
        <h2 style={title}>Completa los datos</h2>
      </div>

      {loadingReqs && <div style={{ marginTop: 8 }}>Cargando requisitos…</div>}

      {!loadingReqs && (requisitos?.length ?? 0) === 0 ? (
        <div style={{ marginTop: 8, color: '#777' }}>Este trámite no tiene requisitos configurados.</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:10 }}>
          {requisitos.map(r => (
            <Field
              key={r.id_requisito}
              req={r}
              value={values?.[r.id_requisito] || (r.tipo === 'archivo' ? null : '')}
              onChange={v => setValue(r.id_requisito, v)}
              uploading={!!uploading[r.id_requisito]}
              setUploading={flag => setUploading(prev => ({ ...prev, [r.id_requisito]: flag }))}
              preview={previews[r.id_requisito]}
              setPreview={p => setPreviews(prev => ({ ...prev, [r.id_requisito]: p }))}
              tramiteId={tramite?.id}
              theme={theme}
            />
          ))}
        </div>
      )}

      {errMsg && <div style={feedback(theme,'err')}>{errMsg}</div>}
      {okMsg && <div style={feedback(theme,'ok')}>{okMsg}</div>}

      <div style={{ display:'flex', gap:10, marginTop:14, flexWrap:'wrap' }}>
        <button onClick={onSubmit} disabled={!canSubmit} style={primaryBtn(theme)}>
          {saving ? 'Guardando…' : 'Guardar instancia'}
        </button>
        <button onClick={()=>onChange({})} style={ghostBtn(theme)}>Limpiar</button>
      </div>
    </section>
  );
}

function Field({ req, value, onChange, theme, uploading, setUploading, preview, setPreview, tramiteId }) {
  const Label = (
    <label style={{ color:'#111', fontWeight:700, fontSize:18 }}>
      {req.titulo} {req.obligatorio ? <span style={{ color: theme.red }}>*</span> : null}
    </label>
  );

  if (req.tipo === 'number' || req.tipo === 'numero')
    return <div>{Label}<input type="number" value={value || ''} onChange={e=>onChange(e.target.value)} style={input(theme)} /></div>;

  if (req.tipo === 'fecha')
    return <div>{Label}<input type="date" value={value || ''} onChange={e=>onChange(e.target.value)} style={input(theme)} /></div>;

  if (req.tipo === 'textarea' || req.tipo === 'texto_largo')
    return <div>{Label}<textarea rows={3} value={value || ''} onChange={e=>onChange(e.target.value)} style={input(theme)} /></div>;

  if (req.tipo === 'file' || req.tipo === 'archivo')
    return (
      <div>
        {Label}
        <input
          id={`file-${req.id_requisito}`}
          type="file"
          accept=".pdf,image/*"
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            // Preview local inmediato
            const localUrl = URL.createObjectURL(file);
            setPreview({ url: localUrl, filename: file.name, mime: file.type });

            setUploading(true);
            try {
              const up = await subirArchivo(file, { id_tramite: tramiteId, id_requisito: req.id_requisito });
              // Guarda en el state del formulario lo que el back necesita
              onChange({
                archivo_id: up.id_archivo,
                filename: up.filename,
                mime: up.mime,
                size: up.size,
                url: up.url,
              });
              // Reemplaza preview local por la URL del servidor
              setPreview({ url: up.url, filename: up.filename, mime: up.mime });
            } catch (err) {
              alert(err.message || 'Error al subir archivo');
            } finally {
              setUploading(false);
            }
          }}
          style={input(theme)}
        />

        {/* Vista previa y enlaces */}
        <FilePreview file={value?.url ? value : preview} />
        {uploading && <div style={{ marginTop: 6 }}>Subiendo…</div>}
      </div>
    );

  // default: texto corto
  return <div>{Label}<input type="text" value={value || ''} onChange={e=>onChange(e.target.value)} style={input(theme)} /></div>;
}

function FilePreview({ file }) {
  if (!file?.url) return null;
  const { url, filename, mime } = file;
  const isPDF = (mime || '').includes('pdf') || /\.pdf$/i.test(filename || '');
  const isImg = (mime || '').startsWith('image');

  return (
    <div style={{ marginTop: 8 }}>
      {isPDF && (
        <object data={url} type="application/pdf" width="100%" height="420" aria-label="Vista previa PDF">
          <p>Tu navegador no puede mostrar el PDF. <a href={url} target="_blank" rel="noreferrer">Descargar</a></p>
        </object>
      )}
      {isImg && (
        <div style={{ margin: '8px 0' }}>
          <img src={url} alt={filename || 'archivo'} style={{ maxWidth: '100%', borderRadius: 8 }} />
        </div>
      )}
      {!isPDF && !isImg && (
        <p>Archivo: <strong>{filename || 'archivo'}</strong> — <a href={url} target="_blank" rel="noreferrer">Abrir/Descargar</a></p>
      )}
      {(isPDF || isImg) && (
        <div style={{ marginTop: 6 }}>
          <a href={url} target="_blank" rel="noreferrer">Abrir en pestaña nueva</a> ·{' '}
          <a href={url} download>Descargar</a>
        </div>
      )}
    </div>
  );
}
