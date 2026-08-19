import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/Common/PrivateRoute';

import EtudiantDashboard from './pages/etudiant/Dashboard';
import EnseignantDashboard from './pages/enseignant/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import EncadreurDashboard from './pages/encadreur/Dashboard';
import Profil from './pages/Profil';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Routes protégées */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            {/* ===== DASHBOARD PAR RÔLE ===== */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/etudiant/dashboard" element={<EtudiantDashboard />} />
            <Route path="/enseignant/dashboard" element={<EnseignantDashboard />} />
            <Route path="/encadreur/dashboard" element={<EncadreurDashboard />} />
            
            {/* Profil */}
            <Route path="/profil" element={<Profil />} />

            {/* Redirection par défaut */}
            <Route path="/dashboard" element={<Navigate to="/etudiant/dashboard" />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div className="container mt-5">
            <h1>404 - Page non trouvée</h1>
            <a href="/login" className="btn btn-primary">Retourner à la connexion</a>
          </div>
        } />
      </Routes>
    </>
  );
}

export default App;