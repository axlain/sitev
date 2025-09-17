import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearTramite } from '../services/tramite';

export default function TramiteNuevo() {
  const navigate = useNavigate();

  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario') || '{}'); } catch { return {}; }
  }, []);
  const userAreaId = Number(usuario?.id_area || 0);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) { setErr('El nombre es requerido'); return; }
    if (!userAreaId) { setErr('No se detectó tu área. Vuelve a iniciar sesión.'); return; }

    try {
      setLoading(true); setErr(null);
      await crearTramite({ nombre: nombre.trim(), descripcion: descripcion || null, id_area: userAreaId });
      alert('Trámite creado correctamente');
      // Vuelve al dashboard y selecciona el área del usuario
      localStorage.setItem('selectedAreaId', String(userAreaId));
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

      <h2 className="section-title">Nuevo trámite</h2>

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
            {loading ? 'Creando…' : 'Crear'}
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
