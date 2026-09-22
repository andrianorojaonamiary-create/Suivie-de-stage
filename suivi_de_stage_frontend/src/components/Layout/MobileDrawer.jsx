import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaHome, FaList, FaUsers, FaBuilding, FaFileAlt,
  FaMapMarkedAlt, FaStar, FaBell, FaUserCog, 
  FaTimes, FaClipboardCheck, FaChartBar, FaUserTie,  
  FaCalendarAlt, FaGraduationCap, FaComment, FaSignOutAlt
} from 'react-icons/fa';
import logo from '../../assets/logo_emit.jpg';

function MobileDrawer({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Fermer le drawer lors d'une navigation
  // (isOpen/onClose délibérément exclus : inclure isOpen refermerait le drawer dès son ouverture)
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const getDashboardPath = () => {
    const role = user?.role;
    if (role === 'ROLE_ADMIN') return '/admin/dashboard';
    if (role === 'ROLE_ETUDIANT') return '/etudiant/dashboard';
    if (role === 'ROLE_ENSEIGNANT') return '/enseignant/dashboard';
    if (role === 'ROLE_ENCADREUR') return '/encadreur/dashboard';
    return '/dashboard';
  };

  const getMenuItems = () => {
    const role = user?.role;
    const dashboardPath = getDashboardPath();

    if (role === 'ROLE_ADMIN') {
      return [
        { path: dashboardPath, icon: <FaHome />, label: 'Dashboard' },
        { divider: true, label: 'GESTION' },
        { path: '/admin/stages', icon: <FaList />, label: 'Gestion des stages' },
        { path: '/admin/etudiants', icon: <FaUsers />, label: 'Étudiants' },
        { path: '/admin/entreprises', icon: <FaBuilding />, label: 'Entreprises' },
        { path: '/admin/rapports', icon: <FaFileAlt />, label: 'Rapports' },
        { path: '/admin/evaluations', icon: <FaStar />, label: 'Évaluations' },
        { divider: true, label: 'ANALYSE' },
        { path: '/admin/carte', icon: <FaMapMarkedAlt />, label: 'Carte des stages' },
        { path: '/admin/statistiques', icon: <FaChartBar />, label: 'Statistiques' },
        { divider: true, label: 'COMPTE' },
        { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
        { path: '/profil', icon: <FaUserCog />, label: 'Mon profil' },
      ];
    }

    if (role === 'ROLE_ETUDIANT') {
      return [
        { path: dashboardPath, icon: <FaHome />, label: 'Dashboard' },
        { divider: true, label: 'MON STAGE' },
        { path: '/etudiant/mes-stages', icon: <FaList />, label: 'Mes stages' },
        { path: '/etudiant/entreprise', icon: <FaBuilding />, label: 'Mon entreprise' },
        { path: '/etudiant/encadreur', icon: <FaUserTie />, label: 'Mon encadreur' },
        { divider: true, label: 'SUIVI & RAPPORTS' },
        { path: '/etudiant/suivi-stage', icon: <FaCalendarAlt />, label: 'Suivi du stage' },
        { path: '/etudiant/rapports', icon: <FaFileAlt />, label: 'Mes rapports' },
        { divider: true, label: 'DÉCOUVRIR' },
        { path: '/etudiant/mon-avenir', icon: <FaGraduationCap />, label: 'Mon avenir' },
        { divider: true, label: 'COMPTE' },
        { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
        { path: '/profil', icon: <FaUserCog />, label: 'Mon profil' },
      ];
    }

    if (role === 'ROLE_ENSEIGNANT') {
      return [
        { path: dashboardPath, icon: <FaHome />, label: 'Dashboard' },
        { divider: true, label: 'SUIVI PÉDAGOGIQUE' },
        { path: '/enseignant/stages', icon: <FaList />, label: 'Stages à valider' },
        { path: '/enseignant/etudiants', icon: <FaUsers />, label: 'Mes étudiants' },
        { path: '/enseignant/evaluations', icon: <FaStar />, label: 'Évaluations' },
        { path: '/enseignant/observations', icon: <FaComment />, label: 'Observations' },
        { path: '/enseignant/rapports', icon: <FaFileAlt />, label: 'Rapports' },
        { divider: true, label: 'OUTILS' },
        { path: '/enseignant/carte', icon: <FaMapMarkedAlt />, label: 'Carte des stages' },
        { divider: true, label: 'COMPTE' },
        { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
        { path: '/profil', icon: <FaUserCog />, label: 'Mon profil' },
      ];
    }

    if (role === 'ROLE_ENCADREUR') {
      return [
        { path: dashboardPath, icon: <FaHome />, label: 'Dashboard' },
        { divider: true, label: 'SUIVI PROFESSIONNEL' },
        { path: '/encadreur/etudiants', icon: <FaUsers />, label: 'Mes étudiants' },
        { path: '/encadreur/stages', icon: <FaClipboardCheck />, label: 'Stages suivis' },
        { path: '/encadreur/evaluations', icon: <FaStar />, label: 'Évaluations' },
        { path: '/encadreur/observations', icon: <FaComment />, label: 'Observations' },
        { path: '/encadreur/rapports', icon: <FaFileAlt />, label: 'Rapports' },
        { path: '/encadreur/entreprise', icon: <FaBuilding />, label: 'Mon entreprise' },
        { divider: true, label: 'OUTILS' },
        { path: '/encadreur/carte', icon: <FaMapMarkedAlt />, label: 'Carte des stages' },
        { divider: true, label: 'COMPTE' },
        { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
        { path: '/profil', icon: <FaUserCog />, label: 'Mon profil' },
      ];
    }

    return [
      { path: dashboardPath, icon: <FaHome />, label: 'Dashboard' },
      { divider: true, label: 'COMPTE' },
      { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
      { path: '/profil', icon: <FaUserCog />, label: 'Mon profil' },
    ];
  };

  const menuItems = getMenuItems();

  const getInitials = () => {
    const p = user?.prenom?.[0] || '';
    const n = user?.nom?.[0] || '';
    return (p + n).toUpperCase() || 'EM';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay sombre */}
      <div className="mobile-drawer-overlay open" onClick={onClose} />

      {/* Drawer latéral */}
      <aside className="mobile-drawer-emit open">
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <img src={logo} alt="EMIT" className="mobile-drawer-logo" />
            <div className="mobile-drawer-title-group">
              <span className="mobile-drawer-title">EMIT</span>
              <span className="mobile-drawer-subtitle">Stage Manager</span>
            </div>
          </div>
          <button className="mobile-drawer-close" onClick={onClose} aria-label="Fermer">
            <FaTimes />
          </button>
        </div>

        <div className="mobile-drawer-user">
          <div className="mobile-drawer-avatar">{getInitials()}</div>
          <div className="mobile-drawer-user-info">
            <span className="mobile-drawer-user-name">{user?.prenom} {user?.nom}</span>
            <span className="mobile-drawer-user-role">{user?.role?.replace('ROLE_', '')}</span>
          </div>
        </div>

        <nav className="mobile-drawer-nav">
          {menuItems.map((item, index) => {
            if (item.divider) {
              return (
                <div key={index} className="mobile-drawer-section-title">
                  {item.label}
                </div>
              );
            }

            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => (isActive ? 'mobile-drawer-link active' : 'mobile-drawer-link')}
                onClick={onClose}
              >
                <span className="mobile-drawer-icon">{item.icon}</span>
                <span className="mobile-drawer-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mobile-drawer-footer">
          <button className="mobile-drawer-logout-btn" onClick={logout}>
            <FaSignOutAlt />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default MobileDrawer;
