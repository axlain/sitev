import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { editarTramite, tramitesPorArea } from '../services/tramite';

export default function TramiteEditar() {
  const navigate = useNavigate();
  const { id } = useParams();           // /tramites/:id/editar
  const location = useLocation();
  const tramiteState = location.state?.tramite;

  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario') || '{}'); } catch { return {}; }
  }, []);
  const userAreaId = Number(usuario?.id_area || 0);

  const [nombre, setNombre] = useState(tramiteState?.nombre || '');
  const [descripcion, setDescripcion] = useState(tramiteState?.descripcion || '');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Si no llega por state, intenta rescatarlo de la API por el área del usuario
  useEffect(() => {
    const traer = async () => {
      if (tramiteState || !userAreaId || !id) return;
      try {
        const res = await tramitesPorArea(userAreaId);
        const t = (res?.data || []).find(x => Number(x.id) === Number(id));
        if (t) { setNombre(t.nombre || ''); setDescripcion(t.descripcion || ''); }
      } catch { /* opcional: manejar error silencioso */ }
    };
    traer();
  }, [tramiteState, userAreaId, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) { setErr('El nombre es requerido'); return; }
    try {
      setLoading(true); setErr(null);
      await editarTramite(Number(id), { nombre: nombre.trim(), descripcion });
      alert('Trámite actualizado');
      navigate('/');
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const cancelar = () => navigate(-1);

  return (
    <div className="container section">
      {/* Header con usuario y área */}
      <header className="app-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div className="container app-header-inner">
          <div>
            <div style={{ fontSize: 12, color: '#777' }}>Área</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{usuario?.nombre || 'Usuario'} - {usuario?.id_area}</div>
          </div>
        </div>
      </header>

      <h2 className="section-title">Editar trámite</h2>

      <form className="card card-elevated w-420" onSubmit={handleSubmit} style={{ margin: '0 auto' }}>
        <label className="label">Nombre *</label>
        <input
          className="input"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre del trámite"
          maxLength={100}
        />

        <label className="label mt-12">Descripción</label>
        <textarea
          className="input"
          rows={4}
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Describe brevemente el trámite"
        />

        <div className="mt-16" style={{ display:'flex', gap:8 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button type="button" className="btn" onClick={cancelar} disabled={loading}>
            Cancelar
          </button>
        </div>

        {err && <p className="mt-12" style={{ color:'#C92C2C' }}>{err}</p>}
      </form>
    </div>
  );
}
