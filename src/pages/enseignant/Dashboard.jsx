
import { useAuth } from '../../hooks/useAuth';

function EnseignantDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h2>Bonjour, {user?.prenom}</h2>
      <p>Tableau de bord enseignant</p>
      <div className="dashboard-stats">
        <div className="card-emit"><h3>Stages à valider</h3><p className="stat-number">5</p></div>
        <div className="card-emit"><h3>Étudiants suivis</h3><p className="stat-number">12</p></div>
      </div>
    </div>
  );
}

export default EnseignantDashboard;