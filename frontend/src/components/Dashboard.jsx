// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8080';

async function fetchWithToken(url, opts = {}) {
  const token = localStorage.getItem('token');
  const resp = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok || json?.ok === false) {
    const msg = json?.error || json?.message || `${resp.status} ${resp.statusText}`;
    throw new Error(msg);
  }
  return json;
}

export default function Dashboard() {
  const [areaNombre, setAreaNombre] = useState('');
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    const user = JSON.parse(localStorage.getItem('usuario') || '{}');
    const areaId = Number(user?.id_area || localStorage.getItem('areaId'));

    const load = async () => {
      try {
        setErr(null); setLoading(true);
        const a = await fetchWithToken(`${API_BASE}/api/sitev/area/mostrarNombre?id=${areaId}`);
        setAreaNombre(a?.nombre || '');
        const t = await fetchWithToken(`${API_BASE}/api/sitev/area/tramites?id=${areaId}`);
        const lista = Array.isArray(t?.data) ? t.data : [];
        lista.sort((x, y) => (x?.nombre || '').localeCompare(y?.nombre || ''));
        setTramites(lista);
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
        setTramites([]);
      } finally {
        setLoading(false);
      }
    };

    if (areaId > 0) load(); else { setErr('ID de área inválido'); setLoading(false); }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('userId');
    localStorage.removeItem('areaId');
    navigate('/login');
  };

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const nombreUsuario = usuario?.nombre || usuario?.email || 'Usuario';

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="container app-header-inner">
          <div>
            <div style={{ fontSize: 12, color: '#777' }}>Área</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{areaNombre || '—'}</div>
          </div>

          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize: 12, color: '#777' }}>Usuario</div>
            <div style={{ fontWeight: 700 }}>{nombreUsuario}</div>
            <button className="btn btn-danger" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="app-main">
        <div className="container section">
          {loading ? (
            <p>Cargando…</p>
          ) : err ? (
            <p style={{ color: '#C92C2C' }}>{err}</p>
          ) : (
            <>
              <h2 className="section-title">Trámites disponibles</h2>

              <div className="cards">
                {tramites.map(t => (
                  <div key={t.id} className="card">
                    <h3 className="card-title">{t.nombre || `Trámite #${t.id}`}</h3>
                    <p className="card-sub">{t.descripcion || 'Sin descripción.'}</p>
                    <button className="btn btn-primary mt-12" onClick={() => alert(`Iniciar trámite ${t.id}`)}>
                      Iniciar
                    </button>
                  </div>
                ))}

                {/* Opcional: card para crear */}
                <div className="card" style={{ borderStyle:'dashed' }}>
                  <h3 className="card-title">Nuevo trámite</h3>
                  <p className="card-sub">Crear una solicitud desde cero.</p>
                  <button className="btn btn-primary mt-12" onClick={() => alert('Abrir formulario de creación')}>
                    +
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
