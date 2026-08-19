import { useAuth } from '../../hooks/useAuth';

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h2>Bonjour, {user?.prenom}</h2>
      <p>Tableau de bord administrateur</p>
      <div className="dashboard-stats">
        <div className="card-emit"><h3>Utilisateurs</h3><p className="stat-number">25</p></div>
        <div className="card-emit"><h3>Stages</h3><p className="stat-number">18</p></div>
        <div className="card-emit"><h3>Entreprises</h3><p className="stat-number">8</p></div>
      </div>
    </div>
  );
}

export default AdminDashboard;