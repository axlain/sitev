import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Si no hay token, redirige a login
      window.location.href = '/login';
    } else {
      fetch('http://localhost:8080/api/sitev/usuario/obtenerTodos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre> // Mostrar los datos obtenidos
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
}

export default Dashboard;
