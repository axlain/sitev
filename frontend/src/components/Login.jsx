import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8080';

function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  // NUEVO: áreas
  const [areas, setAreas] = useState([]);
  const [idArea, setIdArea] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const navigate = useNavigate();

  const resetErrors = () => setError(null);

  // Cargar áreas al entrar en modo "register"
  useEffect(() => {
    const load = async () => {
      if (mode !== 'register') return;

      setLoadingAreas(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`${API_BASE}/api/sitev/area/obtenerTodas`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!resp.ok) {
          throw new Error('No se pudieron cargar las áreas. Contacta al admin.');
        }

        const json = await resp.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        list.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

        setAreas(list);
        if (list.length && !idArea) setIdArea(String(list[0].id));
      } catch (e) {
        setAreas([]);
        setIdArea('');
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingAreas(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetErrors();

    if (mode === 'register') {
      if (password !== password2) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (!idArea) {
        setError('Selecciona un área');
        return;
      }
    }

    try {
      setLoading(true);

      const url =
        mode === 'login'
          ? `${API_BASE}/api/sitev/usuario/login`
          : `${API_BASE}/api/sitev/usuario/registrar`;

      const body =
        mode === 'login'
          ? { email, password }
          : {
              nombre,
              email,
              password,
              id_area: Number(idArea),
            };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await resp.json();

      if (!resp.ok || !data.ok) {
        throw new Error((data && data.error) || 'Ocurrió un error');
      }

      if (data.token) localStorage.setItem('token', data.token);
      if (data.data) localStorage.setItem('usuario', JSON.stringify(data.data));

      alert(mode === 'login' ? 'Login exitoso' : 'Registro exitoso');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    resetErrors();
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1 style={{ marginBottom: 8 }}>
        {mode === 'login' ? 'Login' : 'Crear cuenta'}
      </h1>
      <p style={{ marginTop: 0, color: '#666' }}>
        {mode === 'login'
          ? 'Ingresa con tu email y contraseña.'
          : 'Crea tu cuenta para empezar.'}
      </p>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label>Nombre:</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Tu nombre"
                style={{ width: '100%', padding: 8 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Área:</label>
              <select
                value={idArea}
                onChange={(e) => setIdArea(e.target.value)}
                required
                disabled={loadingAreas || areas.length === 0}
                style={{ width: '100%', padding: 8 }}
              >
                {areas.length === 0 ? (
                  <option value="">(No hay áreas disponibles)</option>
                ) : (
                  areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))
                )}
              </select>
              {loadingAreas && (
                <small style={{ color: '#666' }}>Cargando áreas…</small>
              )}
            </div>
          </>
        )}

        <div style={{ marginBottom: 12 }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tucorreo@dominio.com"
            autoComplete="email"
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        {mode === 'register' && (
          <div style={{ marginBottom: 12 }}>
            <label>Confirmar password:</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              autoComplete="new-password"
              style={{ width: '100%', padding: 8 }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (mode === 'register' && (!idArea || areas.length === 0))}
          style={{ width: '100%', padding: 10 }}
        >
          {loading ? 'Procesando...' : mode === 'login' ? 'Login' : 'Registrarme'}
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        <button
          onClick={switchMode}
          style={{
            width: '100%',
            padding: 10,
            background: '#f0f0f0',
            border: '1px solid #ddd',
          }}
        >
          {mode === 'login'
            ? '¿No tienes cuenta? Crear una'
            : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
    </div>
  );
}

export default Auth;
