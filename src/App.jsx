import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/Common/PrivateRoute';
import AdminDashboard from './pages/admin/Dashboard';
import EtudiantDashboard from './pages/etudiant/Dashboard';
import EnseignantDashboard from './pages/enseignant/Dashboard';
import EncadreurDashboard from './pages/encadreur/Dashboard';
import MesStages from './pages/etudiant/MesStages';
import AjouterStage from './pages/etudiant/AjouterStage';
import StageDetail from './pages/etudiant/StageDetail';
import MesRapports from './pages/etudiant/MesRapports';
import MonEntreprise from './pages/etudiant/MonEntreprise';
import AjouterEntreprise from './pages/etudiant/AjouterEntreprise';
import MonEncadreur from './pages/etudiant/MonEncadreur';
import AjouterEncadreur from './pages/etudiant/AjouterEncadreur';
import SuiviStage from './pages/etudiant/SuiviStage';
import Evaluations from './pages/etudiant/Evaluations';
import MonAvenir from './pages/etudiant/MonAvenir';
import EnseignantStages from './pages/enseignant/Stages';
import EnseignantEtudiants from './pages/enseignant/Etudiants';
import EnseignantEvaluations from './pages/enseignant/Evaluations';
import EnseignantRapports from './pages/enseignant/Rapports';
import EnseignantStudentDetail from './pages/enseignant/StudentDetail';
import EnseignantObservations from './pages/enseignant/Observations';
import EncadreurEtudiants from './pages/encadreur/Etudiants';
import EncadreurStages from './pages/encadreur/Stages';
import EncadreurEvaluations from './pages/encadreur/Evaluations';
import EncadreurObservations from './pages/encadreur/Observations';
import EncadreurEntreprise from './pages/encadreur/Entreprise';
import EncadreurStudentDetail from './pages/encadreur/StudentDetail';
import EncadreurProfil from './pages/encadreur/Profil';
import Profil from './pages/Profil';
import Notifications from './pages/Notifications';
import CarteStages from './pages/CarteStages';

const roles = {
  admin: ['ROLE_ADMIN', 'ROLE_ADMINISTRATEUR'],
  student: ['ROLE_ETUDIANT'],
  teacher: ['ROLE_ENSEIGNANT'],
  supervisor: ['ROLE_ENCADREUR'],
  authenticated: ['ROLE_ADMIN', 'ROLE_ADMINISTRATEUR', 'ROLE_ETUDIANT', 'ROLE_ENSEIGNANT', 'ROLE_ENCADREUR'],
};

function App() {
  return <><ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    <Routes>
      <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/" element={<Navigate to="/login" />} />
      <Route element={<PrivateRoute />}><Route element={<Layout />}>
        <Route element={<PrivateRoute allowedRoles={roles.admin} />}><Route path="/admin/dashboard" element={<AdminDashboard />} /><Route path="/admin/carte" element={<CarteStages />} /></Route>
        <Route element={<PrivateRoute allowedRoles={roles.student} />}>
          <Route path="/etudiant/dashboard" element={<EtudiantDashboard />} /><Route path="/etudiant/mes-stages" element={<MesStages />} /><Route path="/etudiant/ajouter-stage" element={<AjouterStage />} /><Route path="/etudiant/stage/:id" element={<StageDetail />} /><Route path="/etudiant/rapports" element={<MesRapports />} /><Route path="/etudiant/entreprise" element={<MonEntreprise />} /><Route path="/etudiant/entreprise/ajouter" element={<AjouterEntreprise />} /><Route path="/etudiant/entreprise/modifier" element={<AjouterEntreprise />} /><Route path="/etudiant/entreprise/voir/:id" element={<AjouterEntreprise />} /><Route path="/etudiant/encadreur" element={<MonEncadreur />} /><Route path="/etudiant/encadreur/ajouter" element={<AjouterEncadreur />} /><Route path="/etudiant/encadreur/modifier" element={<AjouterEncadreur />} /><Route path="/etudiant/encadreur/voir/:id" element={<AjouterEncadreur />} /><Route path="/etudiant/suivi-stage" element={<SuiviStage />} /><Route path="/etudiant/evaluations" element={<Evaluations />} /><Route path="/etudiant/mon-avenir" element={<MonAvenir />} /><Route path="/etudiant/carte" element={<CarteStages />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={roles.teacher} />}>
          <Route path="/enseignant/dashboard" element={<EnseignantDashboard />} /><Route path="/enseignant/stages" element={<EnseignantStages />} /><Route path="/enseignant/etudiants" element={<EnseignantEtudiants />} /><Route path="/enseignant/evaluations" element={<EnseignantEvaluations />} /><Route path="/enseignant/evaluations/:studentId" element={<EnseignantEvaluations />} /><Route path="/enseignant/rapports" element={<EnseignantRapports />} /><Route path="/enseignant/rapports/:studentId" element={<EnseignantRapports />} /><Route path="/enseignant/carte" element={<CarteStages />} /><Route path="/enseignant/etudiant/:studentId" element={<EnseignantStudentDetail />} /><Route path="/enseignant/observations" element={<EnseignantObservations />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={roles.supervisor} />}>
          <Route path="/encadreur/dashboard" element={<EncadreurDashboard />} /><Route path="/encadreur/etudiants" element={<EncadreurEtudiants />} /><Route path="/encadreur/etudiant/:studentId" element={<EncadreurStudentDetail />} /><Route path="/encadreur/stages" element={<EncadreurStages />} /><Route path="/encadreur/entreprise/:companyId" element={<EncadreurEntreprise />} /><Route path="/encadreur/evaluations" element={<EncadreurEvaluations />} /><Route path="/encadreur/evaluations/:studentId" element={<EncadreurEvaluations />} /><Route path="/encadreur/observations" element={<EncadreurObservations />} /><Route path="/encadreur/observations/:studentId" element={<EncadreurObservations />} /><Route path="/encadreur/carte" element={<CarteStages />} /><Route path="/encadreur/profil" element={<EncadreurProfil />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={roles.authenticated} />}><Route path="/profil" element={<Profil />} /><Route path="/notifications" element={<Notifications />} /></Route>
        <Route path="/dashboard" element={<Navigate to="/etudiant/dashboard" />} />
      </Route></Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </>;
}
export default App;
