import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import logo from '../../assets/logo_emit.jpg';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profil');
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
      '/admin/dashboard': 'Tableau de bord - Administrateur',
      '/etudiant/dashboard': 'Tableau de bord - Étudiant',
      '/enseignant/dashboard': 'Tableau de bord - Enseignant',
      '/encadreur/dashboard': 'Tableau de bord - Encadreur',
      '/stages': 'Gestion des stages',
      '/etudiants': 'Étudiants',
      '/entreprises': 'Entreprises',
      '/rapports': 'Rapports',
      '/carte': 'Carte des stages',
      '/evaluations': 'Évaluations',
      '/notifications': 'Notifications',
      '/profil': 'Mon profil',
    };
    return titles[path] || 'Suivi de Stage';
  };

  return (
    <header className="header-emit">
      <div className="header-left">
        <img 
          src={logo}
          alt="EMIT" 
          className="header-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="header-title-group">
          <h1 className="header-title">Suivi de Stage</h1>
          <span className="header-breadcrumb">EMIT Stage Manager &gt; {getPageTitle()}</span>
        </div>
      </div>

      <div className="header-right">
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