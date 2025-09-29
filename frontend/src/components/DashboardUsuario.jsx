import React, { useState, useEffect } from 'react';
import useAuthUser from '../Hooks/useAuthUser';
import { theme as T } from './usuario/ui';
import HeaderUsuario from './usuario/HeaderUsuario';
import MaestroCard from './usuario/MaestroCard';
import EscuelaCard from './usuario/EscuelaCard';
import FechaPicker from './usuario/FechaPicker';
import TramitePicker from './usuario/TramitePicker';
import RequisitosForm from './usuario/RequisitosForm';
import HistorialTramites from './usuario/HistorialTramites';
import { crearInstancia } from '../services/instancias';
import { obtenerRequisitosPorTramite } from '../services/requisito';

const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function DashboardUsuario() {
  const { areaId, name } = useAuthUser();
  const [fecha, setFecha] = useState(todayStr());
  const [maestroForm, setMaestroForm] = useState({ nombre: '', ap_paterno: '', ap_materno: '', rfc: '' });
  const [maestroSel, setMaestroSel] = useState(null);
  const [escuelaForm, setEscuelaForm] = useState({ nombre: '', clave: '' });
  const [escuelaSel, setEscuelaSel] = useState(null);
  const [tramiteSel, setTramiteSel] = useState(null);
  const [reqValues, setReqValues] = useState({});
  const [requisitos, setRequisitos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [okMsg, setOkMsg] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  async function cargarRequisitos(id_tramite) {
    try {
      if (!id_tramite) { setErrMsg('El trámite seleccionado no es válido'); return; }
      const list = await obtenerRequisitosPorTramite(id_tramite);
      setRequisitos(Array.isArray(list) ? list : []);
      if (!list?.length) setErrMsg('Este trámite no tiene requisitos configurados.');
      else setErrMsg(null);
    } catch (e) {
      console.error('Error al cargar los requisitos:', e);
      setRequisitos([]);
      setErrMsg('Hubo un error al cargar los requisitos.');
    }
  }

  useEffect(() => {
    if (tramiteSel?.id) {
      cargarRequisitos(tramiteSel.id);
      setReqValues({});
    }
  }, [tramiteSel]);

  async function handleGuardarInstancia() {
    setOkMsg(null);
    setErrMsg(null);

    if (!tramiteSel) { setErrMsg('Selecciona un trámite'); return; }

    // Validaciones mínimas (recomendadas)
    if (!maestroSel && !maestroForm?.nombre?.trim()) {
      setErrMsg('Debes seleccionar o capturar al menos el nombre del maestro.');
      return;
    }
    if (!escuelaSel && !escuelaForm?.nombre?.trim()) {
      setErrMsg('Debes seleccionar o capturar el nombre de la escuela.');
      return;
    }
    const faltantes = (requisitos || [])
      .filter(r => r.obligatorio)
      .filter(r => !reqValues?.[r.id_requisito]);
    if (faltantes.length) {
      setErrMsg(`Faltan ${faltantes.length} requisito(s) obligatorio(s).`);
      return;
    }

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

  function logout() {
    localStorage.clear();
    window.location.assign('/login');
  }

  return (
    <div style={{ padding: 28, background: T.beige, color: T.black, fontSize: 18, lineHeight: 1.5 }}>
      <HeaderUsuario areaId={areaId} userName={name} onLogout={logout} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        <div>
          <MaestroCard theme={T} form={maestroForm} onFormChange={setMaestroForm} selected={maestroSel} onSelect={setMaestroSel} />
        </div>
        <div style={{ display: 'grid', gridAutoRows: 'auto', gap: 20 }}>
          <EscuelaCard theme={T} form={escuelaForm} onFormChange={setEscuelaForm} selected={escuelaSel} onSelect={setEscuelaSel} />
          <FechaPicker theme={T} value={fecha} onChange={setFecha} />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <TramitePicker theme={T} areaId={areaId} selected={tramiteSel} onSelect={setTramiteSel} />
      </div>

      <div style={{ marginTop: 20 }}>
        <RequisitosForm
          theme={T}
          tramite={tramiteSel}
          requisitos={requisitos}
          values={reqValues}
          onChange={setReqValues}
          onSubmit={handleGuardarInstancia}
          saving={saving}
          okMsg={okMsg}
          errMsg={errMsg}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <HistorialTramites theme={T} areaId={areaId} />
      </div>
    </div>
  );
}
