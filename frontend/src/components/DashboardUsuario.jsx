import React, { useMemo, useState } from 'react';
import useAuthUser from '../Hooks/useAuthUser';
import { theme as T } from './usuario/ui';
import HeaderUsuario from './usuario/HeaderUsuario';
import MaestroCard from './usuario/MaestroCard';
import EscuelaCard from './usuario/EscuelaCard';
import FechaPicker from './usuario/FechaPicker';
import TramitePicker from './usuario/TramitePicker';
import RequisitosForm from './usuario/RequisitosForm';
import { crearInstancia } from '../services/instancias';

const todayStr = () => {
  const d = new Date(); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};

export default function DashboardUsuario() {
  const { areaId, name } = useAuthUser();
  const [fecha, setFecha] = useState(todayStr());

  const [maestroForm, setMaestroForm] = useState({ nombre:'', ap_paterno:'', ap_materno:'', rfc:'' });
  const [maestroSel,  setMaestroSel]  = useState(null);

  const [escuelaForm, setEscuelaForm] = useState({ nombre:'', clave:'' });
  const [escuelaSel,  setEscuelaSel]  = useState(null);

  const [tramiteSel,  setTramiteSel]  = useState(null);

  const [reqValues, setReqValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [okMsg, setOkMsg] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  function logout() {
    localStorage.clear();
    window.location.assign('/login');
  }

  async function handleGuardarInstancia() {
    setOkMsg(null); setErrMsg(null);
    if (!tramiteSel) { setErrMsg('Selecciona un trámite'); return; }

    const payload = {
      id_tramite: tramiteSel.id,
      id_area: areaId,
      id_maestro: maestroSel?.id_maestro || null,
      id_escuela: escuelaSel?.id_escuela || null,
      maestro: {
        nombre: maestroForm.nombre.trim(),
        ap_paterno: maestroForm.ap_paterno.trim(),
        ap_materno: maestroForm.ap_materno.trim(),
        rfc: (maestroForm.rfc || '').toUpperCase().trim() || null,
      },
      escuela_actual: {
        nombre: escuelaForm.nombre.trim(),
        clave: (escuelaForm.clave || '').toUpperCase().trim() || null,
      },
      fecha,
      datos_requisitos: reqValues,
    };

    try {
      setSaving(true);
      await crearInstancia(payload);
      setOkMsg('Instancia guardada correctamente.');
      setReqValues({});
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 28, background: T.beige, color: T.black, fontSize: 18, lineHeight: 1.5 }}>
      <HeaderUsuario areaId={areaId} userName={name} onLogout={logout} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateRows: 'auto auto', gap: 20 }}>
          <MaestroCard
            theme={T}
            form={maestroForm}
            onFormChange={setMaestroForm}
            selected={maestroSel}
            onSelect={setMaestroSel}
          />
          <EscuelaCard
            theme={T}
            form={escuelaForm}
            onFormChange={setEscuelaForm}
            selected={escuelaSel}
            onSelect={setEscuelaSel}
          />
        </div>

        <div style={{ display: 'grid', gridAutoRows: 'auto', gap: 20 }}>
          <FechaPicker theme={T} value={fecha} onChange={setFecha} />
          <TramitePicker theme={T} areaId={areaId} selected={tramiteSel} onSelect={setTramiteSel} />
          <RequisitosForm
            theme={T}
            tramite={tramiteSel}
            values={reqValues}
            onChange={setReqValues}
            onSubmit={handleGuardarInstancia}
            saving={saving}
            okMsg={okMsg}
            errMsg={errMsg}
          />
        </div>
      </div>
    </div>
  );
}
