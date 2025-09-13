import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Logout from './components/Logout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para el login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta protegida */}
        <Route
          path="/dashboard"
          element={<PrivateRoute element={<Dashboard />} />}
        />

        {/* Ruta para logout */}
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
}

export default App;
