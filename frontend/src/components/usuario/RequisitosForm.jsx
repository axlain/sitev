import React, { useState } from 'react';
import { card, pill, title, input, primaryBtn, ghostBtn, feedback } from './ui';
import { subirArchivo } from '../../services/uploads';

export default function RequisitosForm({
  theme,
  tramite,
  requisitos,
  values,
  onChange,
  onSubmit,
  saving,
  okMsg,
  errMsg,
}) {
  const requisitosList = Array.isArray(requisitos) ? requisitos : [];

  return (
    <section style={card(theme)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={pill(theme)}>Requisitos</span>
        <h2 style={title}>Completa los datos</h2>
      </div>

      {requisitosList.length === 0 ? (
        <div style={{ marginTop: 8, color: '#777' }}>
          Este trámite no tiene requisitos configurados.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 10 }}>
          {requisitosList.map((r) => (
            <Field
              key={r.id_requisito}
              req={r}
              value={values?.[r.id_requisito] || (r.tipo === 'archivo' ? null : '')}
              onChange={(v) => onChange({ ...(values || {}), [r.id_requisito]: v })}
              tramiteId={tramite?.id}
              theme={theme}
            />
          ))}
        </div>
      )}

      {errMsg && <div style={feedback(theme, 'err')}>{errMsg}</div>}
      {okMsg && <div style={feedback(theme, 'ok')}>{okMsg}</div>}

      <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <button onClick={onSubmit} disabled={saving} style={primaryBtn(theme)}>
          {saving ? 'Guardando…' : 'Guardar instancia'}
        </button>
        <button onClick={() => onChange({})} style={ghostBtn(theme)}>Limpiar</button>
      </div>
    </section>
  );
}

function Field({ req, value, onChange, theme, tramiteId }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const Label = (
    <label style={{ color: '#111', fontWeight: 700, fontSize: 18 }}>
      {req.titulo} {req.obligatorio ? <span style={{ color: theme.red }}>*</span> : null}
    </label>
  );

  if (req.tipo === 'file' || req.tipo === 'archivo') {
    return (
      <div>
        {Label}
        <input
          id={`file-${req.id_requisito}`}
          type="file"
          accept={req.accept || '.pdf,image/*'}
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const localUrl = URL.createObjectURL(file);
            setPreview({ url: localUrl, filename: file.name, mime: file.type });

            setUploading(true);
            try {
              const up = await subirArchivo(file, { id_tramite: tramiteId, id_requisito: req.id_requisito });
              onChange({
                archivo_id: up.id_archivo,
                filename: up.filename,
                mime: up.mime,
                size: up.size,
                url: up.url,
              });
              setPreview({ url: up.url, filename: up.filename, mime: up.mime });
              setUploadSuccess(true);
              setTimeout(() => setUploadSuccess(false), 4000);
            } catch (err) {
              alert(err.message || 'Error al subir archivo');
            } finally {
              setUploading(false);
            }
          }}
          style={input(theme)}
        />
        {uploadSuccess && <div style={{ color: 'green', marginTop: 10 }}>¡Archivo subido correctamente!</div>}
        <FilePreview file={value?.url ? value : preview} />
      </div>
    );
  }

  return (
    <div>
      {Label}
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={input(theme)}
      />
    </div>
  );
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
