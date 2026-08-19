
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';

function EtudiantDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Bonjour, {user?.prenom}</h2>
        <p>Tableau de bord étudiant</p>
      </div>

      <div className="dashboard-stats">
        <Card title="Total stages"><p className="stat-number">3</p></Card>
        <Card title="En attente"><p className="stat-number stat-warning">1</p></Card>
        <Card title="Validés"><p className="stat-number stat-success">2</p></Card>
      </div>

      <div className="dashboard-actions">
        <Button>Ajouter un stage</Button>
        <Button variant="outline">Mes stages</Button>
      </div>
    </div>
  );
}

export default EtudiantDashboard;