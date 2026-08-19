import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaHome, FaList, FaUsers, FaBuilding, /*FaFileAlt, */
  FaMapMarkedAlt, /*FaStar, FaBell,*/ FaUserCog, 
  FaChevronLeft, FaChevronRight, FaPlus, FaClipboardCheck, FaChartBar
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

    // ===== MENU DE BASE AVEC LE BON DASHBOARD =====
    const baseMenu = [
      { path: dashboardPath, icon: <FaHome />, label: 'Dashboard' },
    ];

    const roleMenus = {
      'ROLE_ADMIN': [
        { path: '/admin/users', icon: <FaUsers />, label: 'Utilisateurs' },
        { path: '/admin/entreprises', icon: <FaBuilding />, label: 'Entreprises' },
        { path: '/admin/stages', icon: <FaList />, label: 'Tous les stages' },
        { path: '/admin/statistiques', icon: <FaChartBar />, label: 'Statistiques' },
      ],
      'ROLE_ETUDIANT': [
        { path: '/etudiant/ajouter-stage', icon: <FaPlus />, label: 'Ajouter un stage' },
        { path: '/etudiant/mes-stages', icon: <FaList />, label: 'Mes stages' },
        { path: '/etudiant/carte', icon: <FaMapMarkedAlt />, label: 'Voir la carte' },
      ],
      'ROLE_ENSEIGNANT': [
        { path: '/enseignant/stages', icon: <FaList />, label: 'Stages à valider' },
        { path: '/enseignant/etudiants', icon: <FaUsers />, label: 'Mes étudiants' },
        { path: '/enseignant/carte', icon: <FaMapMarkedAlt />, label: 'Carte des stages' },
      ],
      'ROLE_ENCADREUR': [
        { path: '/encadreur/stages', icon: <FaClipboardCheck />, label: 'Stages suivis' },
        { path: '/encadreur/etudiants', icon: <FaUsers />, label: 'Étudiants' },
        { path: '/encadreur/carte', icon: <FaMapMarkedAlt />, label: 'Carte des stages' },
      ],
    };

    const profilMenu = [
      { path: '/profil', icon: <FaUserCog />, label: 'Mon profil' },
    ];

    let menu = [...baseMenu];
    if (role && roleMenus[role]) {
      menu = [...menu, ...roleMenus[role]];
    }
    menu = [...menu, ...profilMenu];

    return menu;
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar-emit ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <img src={logo} alt="EMIT" className="sidebar-logo-img" />
        {!isCollapsed && <span className="sidebar-logo-text">Suivi de Stage</span>}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
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