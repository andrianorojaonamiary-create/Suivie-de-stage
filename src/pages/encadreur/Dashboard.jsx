import { useAuth } from '../../hooks/useAuth';

function EncadreurDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Bonjour, {user?.prenom}</h2>
        <p className="text-muted">Tableau de bord Encadreur</p>
      </div>

      <div className="dashboard-stats">
        <div className="card-emit">
          <h3>Stages suivis</h3>
          <p className="stat-number">4</p>
        </div>
        <div className="card-emit">
          <h3>Étudiants</h3>
          <p className="stat-number">6</p>
        </div>
      </div>
    </div>
  );
}

export default EncadreurDashboard;