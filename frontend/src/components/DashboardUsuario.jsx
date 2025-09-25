import React, { useState, useEffect } from 'react';
import useAuthUser from '../Hooks/useAuthUser'; // Importar el hook correctamente
import { theme as T } from './usuario/ui';
import HeaderUsuario from './usuario/HeaderUsuario';
import MaestroCard from './usuario/MaestroCard';
import EscuelaCard from './usuario/EscuelaCard';
import FechaPicker from './usuario/FechaPicker';
import TramitePicker from './usuario/TramitePicker';
import RequisitosForm from './usuario/RequisitosForm';
import { crearInstancia } from '../services/instancias';
import { obtenerRequisitosPorTramite } from '../services/requisito'; // Asegúrate de que esta función exista y esté centralizada

const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function DashboardUsuario() {
  const { areaId, name } = useAuthUser(); // Usar el hook aquí para obtener los datos del usuario
  const [fecha, setFecha] = useState(todayStr());
  const [maestroForm, setMaestroForm] = useState({ nombre: '', ap_paterno: '', ap_materno: '', rfc: '' });
  const [maestroSel, setMaestroSel] = useState(null);
  const [escuelaForm, setEscuelaForm] = useState({ nombre: '', clave: '' });
  const [escuelaSel, setEscuelaSel] = useState(null);
  const [tramiteSel, setTramiteSel] = useState(null);
  const [reqValues, setReqValues] = useState({}); // Los valores para cada requisito
  const [requisitos, setRequisitos] = useState([]); // Estado para los requisitos
  const [saving, setSaving] = useState(false);
  const [okMsg, setOkMsg] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  // Función para cargar los requisitos del trámite seleccionado
  async function cargarRequisitos(id_tramite) {
    try {
      if (!id_tramite) {
        setErrMsg('El trámite seleccionado no es válido');
        return;
      }

      const requisitos = await obtenerRequisitosPorTramite(id_tramite); // Usamos la función consolidada
      if (requisitos?.length === 0) {
        setErrMsg('Este trámite no tiene requisitos configurados.');
      } else {
        setRequisitos(requisitos); // Actualiza el estado con los requisitos obtenidos
      }
    } catch (e) {
      console.error('Error al cargar los requisitos:', e);
      setRequisitos([]);
      setErrMsg('Hubo un error al cargar los requisitos.');
    }
  }

  // Cargar los requisitos cuando el trámite seleccionado cambie
  useEffect(() => {
    if (tramiteSel?.id) {
      cargarRequisitos(tramiteSel.id); // Llama a la función para cargar los requisitos
    }
  }, [tramiteSel]);

  // Función para guardar la instancia
  async function handleGuardarInstancia() {
    setOkMsg(null);
    setErrMsg(null);
    if (!tramiteSel) {
      setErrMsg('Selecciona un trámite');
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
      datos_requisitos: reqValues, // Enviar los valores de los requisitos
    };

    try {
      setSaving(true);
      await crearInstancia(payload);
      setOkMsg('Instancia guardada correctamente.');
      setReqValues({});  // Limpiar los valores de los requisitos al guardar
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  // Función de logout
  function logout() {
    localStorage.clear(); // Elimina la información del usuario y token
    window.location.assign('/login'); // Redirige al login
  }

  return (
    <div style={{ padding: 28, background: T.beige, color: T.black, fontSize: 18, lineHeight: 1.5 }}>
      <HeaderUsuario areaId={areaId} userName={name} onLogout={logout} /> {/* Pasa la función logout al HeaderUsuario */}

      {/* FILA SUPERIOR: Maestro (izq) / Escuela + Fecha (der) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        <div>
          <MaestroCard
            theme={T}
            form={maestroForm}
            onFormChange={setMaestroForm}
            selected={maestroSel}
            onSelect={setMaestroSel}
          />
        </div>

        <div style={{ display: 'grid', gridAutoRows: 'auto', gap: 20 }}>
          <EscuelaCard
            theme={T}
            form={escuelaForm}
            onFormChange={setEscuelaForm}
            selected={escuelaSel}
            onSelect={setEscuelaSel}
          />
          <FechaPicker theme={T} value={fecha} onChange={setFecha} />
        </div>
      </div>

      {/* TRÁMITE — ancho completo */}
      <div style={{ marginTop: 20 }}>
        <TramitePicker theme={T} areaId={areaId} selected={tramiteSel} onSelect={setTramiteSel} />
      </div>

      {/* REQUISITOS — ancho completo */}
      <div style={{ marginTop: 20 }}>
        <RequisitosForm
          theme={T}
          tramite={tramiteSel}
          requisitos={requisitos} // Pasa los requisitos al formulario
          values={reqValues}
          onChange={setReqValues}
          onSubmit={handleGuardarInstancia}
          saving={saving}
          okMsg={okMsg}
          errMsg={errMsg}  // Mostrar mensajes de error si ocurren
        />
      </div>
    </div>
  );
}
