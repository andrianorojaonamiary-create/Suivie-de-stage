import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaBell, FaSearch, FaTimes, FaBars } from 'react-icons/fa';
import apiClient from '../../api/apiClient';

function Header({ mobileOpen, onToggleMobileMenu, onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const handleToggle = onToggleMobileMenu || onMobileMenuToggle;

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user) return;
      try {
        const { data } = await apiClient.get('/notifications', { params: { lu: false, limit: 1 } });
        setUnreadNotifications(data.meta?.total || 0);
      } catch {
        setUnreadNotifications(0);
      }
    };
    loadUnreadCount();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate(user?.role === 'ROLE_ENCADREUR' ? '/encadreur/profil' : '/profil');
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
      '/encadreur/observations': 'Suivi des stages',
      '/encadreur/evaluations': 'Évaluations',
      '/encadreur/profil': 'Mon profil',
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
          <h1 className="header-title">{getPageTitle()}</h1>
          <span className="header-breadcrumb">EMIT Stage Manager &gt; {getPageTitle()}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Barre de recherche */}
        <div className="header-search">
          <FaSearch className="header-search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="header-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              type="button"
              className="header-search-clear"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                color: '#6BA9E6',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
            >
              <FaTimes />
            </button>
          )}
        </div>

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
          <div className="header-user-avatar">
            {getInitials()}
          </div>
          <div className="header-user-info">
            <span className="header-user-name">
              {[user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Utilisateur connecté'}
            </span>
            <span className="header-user-role">
              {getRoleLabel(user?.role) || 'Utilisateur'}
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
