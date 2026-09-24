import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaBell, FaBars } from 'react-icons/fa';
import { notificationsApi } from '../../api';

function Header({ onToggleMobileMenu, onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleToggle = onToggleMobileMenu || onMobileMenuToggle;

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchUnread = async () => {
      try {
        const res = await notificationsApi.getAll({ lu: false });
        const total = res?.meta?.total ?? res?.data?.length ?? 0;
        if (!cancelled) setUnreadCount(Number(total) || 0);
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    };
    fetchUnread();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

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

  // Helper pour afficher les initiales
  const getInitials = () => {
    const p = user?.prenom?.[0] || '';
    const n = user?.nom?.[0] || '';
    return (p + n).toUpperCase() || 'EM';
  };

  return (
    <header className="header-emit">
      <div className="header-left">
        {/* Bouton Toggle Menu sur écran mobile */}
        <button 
          type="button" 
          className="header-mobile-toggle"
          onClick={handleToggle}
          title="Menu principal"
        >
          <FaBars />
        </button>

        <div className="header-title-group">
          <h1 className="header-title">EMIT Stage Manager</h1>
          <span className="header-breadcrumb"><span className="header-breadcrumb-arrow">&gt; </span>{getPageTitle()}</span>
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
          {unreadCount > 0 && (
            <span className="header-notif-badge">{unreadCount}</span>
          )}
        </button>

        {/* Séparateur */}
        <div className="header-separator"></div>

        {/* Utilisateur */}
        <div className="header-user" onClick={handleProfileClick}>
          <div className="header-user-avatar">
            {getInitials()}
          </div>
          <div className="header-user-info">
            <span className="header-user-name">
              {user?.prenom || 'Jean'} {user?.nom || 'Randriamaro'}
            </span>
            <span className="header-user-role">
              {getRoleLabel(user?.role) || 'Administrateur'}
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