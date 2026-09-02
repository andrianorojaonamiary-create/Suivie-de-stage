import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AuthLayout from './pages/auth/AuthLayout';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/Common/PrivateRoute';

// Pages Dashboard par rôle
import AdminDashboard from './pages/admin/Dashboard';
import EtudiantDashboard from './pages/etudiant/Dashboard';
import EnseignantDashboard from './pages/enseignant/Dashboard';
import EncadreurDashboard from './pages/encadreur/Dashboard';

// ===== PAGES ÉTUDIANT =====
// Stages
import MesStages from './pages/etudiant/MesStages';
import AjouterStage from './pages/etudiant/AjouterStage';
import StageDetail from './pages/etudiant/StageDetail';

// Rapports
import MesRapports from './pages/etudiant/MesRapports';

// Entreprise
import MonEntreprise from './pages/etudiant/MonEntreprise';
import AjouterEntreprise from './pages/etudiant/AjouterEntreprise';

// Encadreur (étudiant)
import MonEncadreur from './pages/etudiant/MonEncadreur';
import AjouterEncadreur from './pages/etudiant/AjouterEncadreur';

// Suivi, Évaluations, Avenir
import SuiviStage from './pages/etudiant/SuiviStage';
import Evaluations from './pages/etudiant/Evaluations';
import MonAvenir from './pages/etudiant/MonAvenir';

// ===== PAGES ENSEIGNANT =====
import EnseignantStages from './pages/enseignant/Stages';
import EnseignantEtudiants from './pages/enseignant/Etudiants';
import EnseignantEvaluations from './pages/enseignant/Evaluations';
import EnseignantRapports from './pages/enseignant/Rapports';
import EnseignantStudentDetail from './pages/enseignant/StudentDetail';
import EnseignantObservations from './pages/enseignant/Observations';


// ===== PAGES ENCADREUR =====
import EncadreurEtudiants from './pages/encadreur/Etudiants';
import EncadreurStages from './pages/encadreur/Stages';
import EncadreurEvaluations from './pages/encadreur/Evaluations';
import EncadreurObservations from './pages/encadreur/Observations';
import EncadreurRapports from './pages/encadreur/Rapports';
import EncadreurStudentDetail from './pages/encadreur/StudentDetail';
import EncadreurStageDetail from './pages/encadreur/StageDetail';
import EncadreurEntreprise from './pages/encadreur/Entreprise';


// Pages communes
import Profil from './pages/Profil';
import Notifications from './pages/Notifications';
import CarteStages from './pages/CarteStages';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={true}/>
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

            {/* ===== ÉTUDIANT ===== */}
            {/* Dashboard */}
            <Route path="/etudiant/dashboard" element={<EtudiantDashboard />} />
            
            {/* Stages */}
            <Route path="/etudiant/mes-stages" element={<MesStages />} />
            <Route path="/etudiant/ajouter-stage" element={<AjouterStage />} />
            <Route path="/etudiant/stage/:id" element={<StageDetail />} />
            
            {/* Rapports */}
            <Route path="/etudiant/rapports" element={<MesRapports />} />
            
            {/* Entreprise */}
            <Route path="/etudiant/entreprise" element={<MonEntreprise />} />
            <Route path="/etudiant/entreprise/ajouter" element={<AjouterEntreprise />} />
            <Route path="/etudiant/entreprise/modifier" element={<AjouterEntreprise />} />
            <Route path="/etudiant/entreprise/voir/:id" element={<AjouterEntreprise />} />
            
            {/* Encadreur (étudiant) */}
            <Route path="/etudiant/encadreur" element={<MonEncadreur />} />
            <Route path="/etudiant/encadreur/ajouter" element={<AjouterEncadreur />} />
            <Route path="/etudiant/encadreur/modifier" element={<AjouterEncadreur />} />
            <Route path="/etudiant/encadreur/voir/:id" element={<AjouterEncadreur />} />
            
            {/* Suivi, Évaluations, Avenir */}
            <Route path="/etudiant/suivi-stage" element={<SuiviStage />} />
            <Route path="/etudiant/evaluations" element={<Evaluations />} />
            <Route path="/etudiant/mon-avenir" element={<MonAvenir />} />
            
            {/* Carte */}
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

            {/* Redirection par défaut */}
            <Route path="/dashboard" element={<Navigate to="/etudiant/dashboard" />} />
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
    </>
  );
}

export default App;