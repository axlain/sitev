import React from 'react';
import useAreaName from '../../Hooks/useAreaName';
import { theme as T } from './ui';

export default function HeaderUsuario({ areaId, userName, onLogout }) {
  const areaNombre = useAreaName(areaId);
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 16, padding: '12px 16px', border: `1px solid ${T.border}`,
      borderRadius: 18, background: T.white, boxShadow: '0 10px 20px rgba(0,0,0,.06)'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 14, fontWeight: 900, background: T.redSoft, color: T.red, border: `1px solid ${T.red}` }}>Área</span>
          <strong style={{ fontSize: 26 }}>{areaNombre || '—'}</strong>
        </div>
        <div style={{ color: '#6b6b6b', fontSize: 14 }}>Portal de usuario</div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        style={{ border: `1.5px solid ${T.red}`, background: T.red, borderRadius: 12, padding: '10px 12px', color: T.white, fontWeight: 800 }}
      >
        👤 {userName} — Cerrar sesión
      </button>
    </header>
  );
}
