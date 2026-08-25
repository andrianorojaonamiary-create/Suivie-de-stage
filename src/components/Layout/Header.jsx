import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaBell } from 'react-icons/fa';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const unreadNotifications = 3;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profil');
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Administrateur';
      case 'ROLE_ETUDIANT': return 'Étudiant';
      case 'ROLE_ENSEIGNANT': return 'Enseignant';
      case 'ROLE_ENCADREUR': return 'Encadreur';
      default: return role;
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/dashboard': 'Tableau de bord',
      '/admin/dashboard': 'Tableau de bord',
      '/etudiant/dashboard': 'Tableau de bord',
      '/enseignant/dashboard': 'Tableau de bord',
      '/encadreur/dashboard': 'Tableau de bord',
      '/admin/stages': 'Gestion des stages',
      '/admin/etudiants': 'Étudiants',
      '/admin/entreprises': 'Entreprises',
      '/admin/rapports': 'Rapports',
      '/admin/carte': 'Carte des stages',
      '/admin/evaluations': 'Évaluations',
      '/admin/statistiques': 'Statistiques',
      '/etudiant/mes-stages': 'Mes stages',
      '/etudiant/ajouter-stage': 'Ajouter un stage',
      '/etudiant/carte': 'Voir la carte',
      '/etudiant/rapports': 'Mes rapports',
      '/enseignant/stages': 'Stages à valider',
      '/enseignant/etudiants': 'Mes étudiants',
      '/enseignant/carte': 'Carte des stages',
      '/enseignant/evaluations': 'Évaluations',
      '/encadreur/stages': 'Stages suivis',
      '/encadreur/etudiants': 'Étudiants',
      '/encadreur/carte': 'Carte des stages',
      '/encadreur/rapports': 'Rapports',
      '/notifications': 'Notifications',
      '/profil': 'Mon profil',
    };
    return titles[path] || 'Suivi de Stage';
  };

  return (
    <header className="header-emit">
      <div className="header-left">
        <div className="header-title-group">
          <h1 className="header-title">Suivi de Stage</h1>
          <span className="header-breadcrumb">&gt; {getPageTitle()}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Bouton Notifications */}
        <button 
          className="header-notif-btn" 
          onClick={handleNotificationsClick}
          title="Notifications"
        >
          <FaBell />
          {unreadNotifications > 0 && (
            <span className="header-notif-badge">{unreadNotifications}</span>
          )}
        </button>

        {/* Séparateur */}
        <div className="header-separator"></div>

        {/* Utilisateur */}
        <div className="header-user" onClick={handleProfileClick}>
          <FaUserCircle className="header-user-icon" />
          <div className="header-user-info">
            <span className="header-user-name">
              {user?.prenom} {user?.nom}
            </span>
            <span className="header-user-role">
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>

        {/* Déconnexion */}
        <button 
          className="header-logout-btn" 
          onClick={handleLogout}
          title="Déconnexion"
        >
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
}

export default Header;