import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AuthLayout from './pages/auth/AuthLayout';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/Common/PrivateRoute';
import { useAuth } from './hooks/useAuth';

// Pages Dashboard par rôle
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const EtudiantDashboard = lazy(() => import('./pages/etudiant/Dashboard'));
const EnseignantDashboard = lazy(() => import('./pages/enseignant/Dashboard'));
const EncadreurDashboard = lazy(() => import('./pages/encadreur/Dashboard'));

// ===== PAGES ÉTUDIANT =====
const MesStages = lazy(() => import('./pages/etudiant/MesStages'));
const AjouterStage = lazy(() => import('./pages/etudiant/AjouterStage'));
const StageDetail = lazy(() => import('./pages/etudiant/StageDetail'));
const MesRapports = lazy(() => import('./pages/etudiant/MesRapports'));
const MonEntreprise = lazy(() => import('./pages/etudiant/MonEntreprise'));
const AjouterEntreprise = lazy(() => import('./pages/etudiant/AjouterEntreprise'));
const MonEncadreur = lazy(() => import('./pages/etudiant/MonEncadreur'));
const AjouterEncadreur = lazy(() => import('./pages/etudiant/AjouterEncadreur'));
const SuiviStage = lazy(() => import('./pages/etudiant/SuiviStage'));
const MonAvenir = lazy(() => import('./pages/etudiant/MonAvenir'));

// ===== PAGES ENSEIGNANT =====
const EnseignantStages = lazy(() => import('./pages/enseignant/Stages'));
const EnseignantEtudiants = lazy(() => import('./pages/enseignant/Etudiants'));
const EnseignantEvaluations = lazy(() => import('./pages/enseignant/Evaluations'));
const EnseignantRapports = lazy(() => import('./pages/enseignant/Rapports'));
const EnseignantStudentDetail = lazy(() => import('./pages/enseignant/StudentDetail'));
const EnseignantObservations = lazy(() => import('./pages/enseignant/Observations'));

// ===== PAGES ENCADREUR =====
const EncadreurEtudiants = lazy(() => import('./pages/encadreur/Etudiants'));
const EncadreurStages = lazy(() => import('./pages/encadreur/Stages'));
const EncadreurEvaluations = lazy(() => import('./pages/encadreur/Evaluations'));
const EncadreurObservations = lazy(() => import('./pages/encadreur/Observations'));
const EncadreurRapports = lazy(() => import('./pages/encadreur/Rapports'));
const EncadreurStudentDetail = lazy(() => import('./pages/encadreur/StudentDetail'));
const EncadreurStageDetail = lazy(() => import('./pages/encadreur/StageDetail'));
const EncadreurEntreprise = lazy(() => import('./pages/encadreur/Entreprise'));

// Pages communes
const Profil = lazy(() => import('./pages/Profil'));
const Notifications = lazy(() => import('./pages/Notifications'));
const CarteStages = lazy(() => import('./pages/CarteStages'));

// Pages Admin
const Statistiques = lazy(() => import('./pages/admin/Statistiques'));
const AdminEvaluations = lazy(() => import('./pages/admin/Evaluations'));
const AdminEncadreurs = lazy(() => import('./pages/admin/Encadreurs'));
const Diplomes = lazy(() => import('./pages/admin/Diplomes'));
const Stages = lazy(() => import('./pages/admin/Stages'));
const AdminEtudiants = lazy(() => import('./pages/admin/Etudiants'));
const AdminEntreprise = lazy(() => import('./pages/admin/Entreprises'));

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#6BA9E6', fontWeight: 600 }}>
      Chargement...
    </div>
  );
}

function DynamicDashboardRedirect() {
  const { user } = useAuth();
  const role = user?.role;

  if (role === 'ROLE_ADMIN' || role === 'ROLE_ADMINISTRATEUR') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (role === 'ROLE_ENSEIGNANT') {
    return <Navigate to="/enseignant/dashboard" replace />;
  }
  if (role === 'ROLE_ENCADREUR') {
    return <Navigate to="/encadreur/dashboard" replace />;
  }
  return <Navigate to="/etudiant/dashboard" replace />;
}

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={true}/>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<AuthLayout initialMode="login" />} />
          <Route path="/register" element={<AuthLayout initialMode="register" />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Routes protégées */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              {/* Admin */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/statistiques" element={<Statistiques />} />
              <Route path="/admin/evaluations" element={<AdminEvaluations />} /> 
              <Route path="/admin/encadreurs" element={<AdminEncadreurs />} />
              <Route path="/admin/diplomes" element={<Diplomes />} />
              <Route path="/admin/stages" element={<Stages />} />
              <Route path="/admin/etudiants" element={<AdminEtudiants />} />
              <Route path="/admin/entreprises" element={<AdminEntreprise />} />

              {/* ===== ÉTUDIANT ===== */}
              <Route path="/etudiant/dashboard" element={<EtudiantDashboard />} />
              <Route path="/etudiant/mes-stages" element={<MesStages />} />
              <Route path="/etudiant/ajouter-stage" element={<AjouterStage />} />
              <Route path="/etudiant/stage/:id" element={<StageDetail />} />
              <Route path="/etudiant/rapports" element={<MesRapports />} />
              <Route path="/etudiant/entreprise" element={<MonEntreprise />} />
              <Route path="/etudiant/entreprise/ajouter" element={<AjouterEntreprise />} />
              <Route path="/etudiant/entreprise/modifier" element={<AjouterEntreprise />} />
              <Route path="/etudiant/entreprise/voir/:id" element={<AjouterEntreprise />} />
              <Route path="/etudiant/encadreur" element={<MonEncadreur />} />
              <Route path="/etudiant/encadreur/ajouter" element={<AjouterEncadreur />} />
              <Route path="/etudiant/encadreur/modifier" element={<AjouterEncadreur />} />
              <Route path="/etudiant/encadreur/voir/:id" element={<AjouterEncadreur />} />
              <Route path="/etudiant/suivi-stage" element={<SuiviStage />} />
              <Route path="/etudiant/mon-avenir" element={<MonAvenir />} />
              <Route path="/etudiant/carte" element={<CarteStages />} />

              {/* ===== ENSEIGNANT ===== */}
              <Route path="/enseignant/dashboard" element={<EnseignantDashboard />} />
              <Route path="/enseignant/stages" element={<EnseignantStages />} />
              <Route path="/enseignant/etudiants" element={<EnseignantEtudiants />} />
              <Route path="/enseignant/evaluations" element={<EnseignantEvaluations />} />
              <Route path="/enseignant/evaluations/:studentId" element={<EnseignantEvaluations />} />
              <Route path="/enseignant/rapports" element={<EnseignantRapports />} />
              <Route path="/enseignant/rapports/:studentId" element={<EnseignantRapports />} />
              <Route path="/enseignant/carte" element={<CarteStages />} />
              <Route path="/enseignant/etudiant/:studentId" element={<EnseignantStudentDetail />} />
              <Route path="/enseignant/observations" element={<EnseignantObservations />} />

              {/* ===== ENCADREUR ===== */}
              <Route path="/encadreur/dashboard" element={<EncadreurDashboard />} />
              <Route path="/encadreur/etudiants" element={<EncadreurEtudiants />} />
              <Route path="/encadreur/etudiant/:studentId" element={<EncadreurStudentDetail />} />
              <Route path="/encadreur/stages" element={<EncadreurStages />} />
              <Route path="/encadreur/stage/:id" element={<EncadreurStageDetail />} />
              <Route path="/encadreur/evaluations" element={<EncadreurEvaluations />} />
              <Route path="/encadreur/evaluations/:studentId" element={<EncadreurEvaluations />} />
              <Route path="/encadreur/observations" element={<EncadreurObservations />} />
              <Route path="/encadreur/observations/:studentId" element={<EncadreurObservations />} />
              <Route path="/encadreur/rapports" element={<EncadreurRapports />} />
              <Route path="/encadreur/rapports/:studentId" element={<EncadreurRapports />} />
              <Route path="/encadreur/carte" element={<CarteStages />} />
              <Route path="/encadreur/entreprise" element={<EncadreurEntreprise />} />

              {/* Communes */}
              <Route path="/profil" element={<Profil />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/admin/carte" element={<CarteStages />} />

              {/* Redirection dynamique par rôle */}
              <Route path="/dashboard" element={<DynamicDashboardRedirect />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="container mt-5">
              <h1>404 - Page non trouvée</h1>
              <p>La page que vous cherchez n'existe pas.</p>
              <a href="/login" className="btn btn-primary">Retourner à la connexion</a>
            </div>
          } />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;