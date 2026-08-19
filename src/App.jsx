import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

// Pages d'authentification
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Protection des routes
import PrivateRoute from './components/Common/PrivateRoute'

// Pages protégées (exemples - à créer plus tard)
// import EtudiantDashboard from './pages/etudiant/Dashboard'
// import EnseignantDashboard from './pages/enseignant/Dashboard'
// import AdminDashboard from './pages/admin/Dashboard'

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
          {/* À décommenter quand les pages seront créées */}
          {/*
          <Route path="/etudiant/dashboard" element={<EtudiantDashboard />} />
          <Route path="/enseignant/dashboard" element={<EnseignantDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          */}
          
          {/* Page temporaire pour les tests */}
          <Route path="/dashboard" element={
            <div className="container mt-5">
              <h1>✅ Tableau de bord</h1>
              <p>Vous êtes connecté !</p>
              <button className="btn btn-danger" onClick={() => window.location.href = '/login'}>
                Déconnexion
              </button>
            </div>
          } />
        </Route>

        {/* Route 404 */}
        <Route path="*" element={
          <div className="container mt-5">
            <h1>404 - Page non trouvée</h1>
          </div>
        } />
      </Routes>
    </>
  )
}

export default App