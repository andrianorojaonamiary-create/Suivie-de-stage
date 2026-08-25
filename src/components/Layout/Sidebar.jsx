import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaHome, FaList, FaUsers, FaBuilding, FaFileAlt,
  FaMapMarkedAlt, FaStar, FaBell, FaUserCog, 
  FaChevronLeft, FaChevronRight, FaPlus, FaClipboardCheck, 
  FaChartBar, FaUserTie,  FaCalendarAlt,
  FaGraduationCap, FaComment,
  
} from 'react-icons/fa';
import logo from '../../assets/logo_emit.jpg';

function Sidebar() {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // ===== DÉTERMINER LE BON DASHBOARD SELON LE RÔLE =====
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

    // ===== MENU ADMIN =====
    if (role === 'ROLE_ADMIN') {
      return [
        { path: dashboardPath, icon: <FaHome />, label: 'Dashboard' },
        { divider: true },
        { path: '/admin/stages', icon: <FaList />, label: 'Gestion des stages' },
        { path: '/admin/etudiants', icon: <FaUsers />, label: 'Étudiants' },
        { path: '/admin/entreprises', icon: <FaBuilding />, label: 'Entreprises' },
        { path: '/admin/rapports', icon: <FaFileAlt />, label: 'Rapports' },
        { path: '/admin/evaluations', icon: <FaStar />, label: 'Évaluations' },
        { divider: true },
        { path: '/admin/carte', icon: <FaMapMarkedAlt />, label: 'Carte des stages' },
        { path: '/admin/statistiques', icon: <FaChartBar />, label: 'Statistiques' },
        { divider: true },
        { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
        { path: '/profil', icon: <FaUserCog />, label: 'Mon profil' },
      ];
    }

    // ===== MENU ÉTUDIANT =====
    if (role === 'ROLE_ETUDIANT') {
      return [
        { path: dashboardPath, icon: <FaHome />, label: 'Dashboard' },
        { divider: true },
        { path: '/etudiant/mes-stages', icon: <FaList />, label: 'Mes stages' },
        { path: '/etudiant/ajouter-stage', icon: <FaPlus />, label: 'Ajouter un stage' },
        { path: '/etudiant/entreprise', icon: <FaBuilding />, label: 'Mon entreprise' },
        { path: '/etudiant/encadreur', icon: <FaUserTie />, label: 'Mon encadreur' },
        { divider: true },
        { path: '/etudiant/suivi-stage', icon: <FaCalendarAlt />, label: 'Suivi du stage' },
        { path: '/etudiant/rapports', icon: <FaFileAlt />, label: 'Mes rapports' },
        { path: '/etudiant/evaluations', icon: <FaStar />, label: 'Évaluations' },
        { divider: true },
        { path: '/etudiant/carte', icon: <FaMapMarkedAlt />, label: 'Voir la carte' },
        { path: '/etudiant/mon-avenir', icon: <FaGraduationCap />, label: 'Mon avenir' },
        { divider: true },
        { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
        { path: '/profil', icon: <FaUserCog />, label: 'Mon profil' },
      ];
    }

    // ===== MENU ENSEIGNANT =====
    if (role === 'ROLE_ENSEIGNANT') {
      return [
        { path: dashboardPath, icon: <FaHome />, label: 'Dashboard' },
        { divider: true },
        { path: '/enseignant/stages', icon: <FaList />, label: 'Stages à valider' },
        { path: '/enseignant/etudiants', icon: <FaUsers />, label: 'Mes étudiants' },
        { path: '/enseignant/evaluations', icon: <FaStar />, label: 'Évaluations' },
        { path: '/enseignant/rapports', icon: <FaFileAlt />, label: 'Rapports' },
        { divider: true },
        { path: '/enseignant/carte', icon: <FaMapMarkedAlt />, label: 'Carte des stages' },
        { divider: true },
        { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
        { path: '/profil', icon: <FaUserCog />, label: 'Mon profil' },
      ];
    }

    // ===== MENU ENCADREUR =====
    if (role === 'ROLE_ENCADREUR') {
      return [
        { path: dashboardPath, icon: <FaHome />, label: 'Dashboard' },
        { divider: true },
        { path: '/encadreur/etudiants', icon: <FaUsers />, label: 'Mes étudiants' },
        { path: '/encadreur/stages', icon: <FaClipboardCheck />, label: 'Stages suivis' },
        { path: '/encadreur/evaluations', icon: <FaStar />, label: 'Évaluations' },
        { path: '/encadreur/observations', icon: <FaComment />, label: 'Observations' },
        { path: '/encadreur/rapports', icon: <FaFileAlt />, label: 'Rapports' },
        { divider: true },
        { path: '/encadreur/carte', icon: <FaMapMarkedAlt />, label: 'Carte des stages' },
        { divider: true },
        { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
        { path: '/profil', icon: <FaUserCog />, label: 'Mon profil' },
      ];
    }

    // ===== MENU PAR DÉFAUT =====
    return [
      { path: dashboardPath, icon: <FaHome />, label: 'Dashboard' },
      { divider: true },
      { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
      { path: '/profil', icon: <FaUserCog />, label: 'Mon profil' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar-emit ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <img src={logo} alt="EMIT" className="sidebar-logo-img" />
        {!isCollapsed && (
          <div className="sidebar-logo-text-group">
            <span className="sidebar-logo-text">EMIT</span>
            <span className="sidebar-logo-subtitle">Stage Manager</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          // ===== AFFICHER UN SÉPARATEUR =====
          if (item.divider) {
            return <div key={index} className="sidebar-divider"></div>;
          }

          // ===== AFFICHER UN LIEN =====
          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button className="sidebar-toggle-bottom" onClick={toggleSidebar}>
        <span className="sidebar-toggle-icon">
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </span>
        {!isCollapsed && <span className="sidebar-toggle-label">Réduire</span>}
      </button>
    </aside>
  );
}

export default Sidebar;