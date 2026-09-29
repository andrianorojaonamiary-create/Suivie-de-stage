import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaHome, FaList, FaUsers, FaFileAlt, 
  FaUserCog, FaCalendarAlt, FaClipboardCheck, FaBell 
} from 'react-icons/fa';

function BottomNav() {
  const { user } = useAuth();

  const getDashboardPath = () => {
    const role = user?.role;
    if (role === 'ROLE_ADMIN') return '/admin/dashboard';
    if (role === 'ROLE_ETUDIANT') return '/etudiant/dashboard';
    if (role === 'ROLE_ENSEIGNANT') return '/enseignant/dashboard';
    if (role === 'ROLE_ENCADREUR') return '/encadreur/dashboard';
    return '/dashboard';
  };

  const getBottomNavItems = () => {
    const role = user?.role;
    const dashboardPath = getDashboardPath();

    if (role === 'ROLE_ADMIN') {
      return [
        { path: dashboardPath, icon: <FaHome />, label: 'Accueil' },
        { path: '/admin/stages', icon: <FaList />, label: 'Stages' },
        { path: '/admin/etudiants', icon: <FaUsers />, label: 'Étudiants' },
        { path: '/admin/rapports', icon: <FaFileAlt />, label: 'Rapports' },
        { path: '/profil', icon: <FaUserCog />, label: 'Profil' },
      ];
    }

    if (role === 'ROLE_ETUDIANT') {
      return [
        { path: dashboardPath, icon: <FaHome />, label: 'Accueil' },
        { path: '/etudiant/mes-stages', icon: <FaList />, label: 'Stages' },
        { path: '/etudiant/suivi-stage', icon: <FaCalendarAlt />, label: 'Suivi' },
        { path: '/etudiant/rapports', icon: <FaFileAlt />, label: 'Rapports' },
        { path: '/profil', icon: <FaUserCog />, label: 'Profil' },
      ];
    }

    if (role === 'ROLE_ENSEIGNANT') {
      return [
        { path: dashboardPath, icon: <FaHome />, label: 'Accueil' },
        { path: '/enseignant/stages', icon: <FaList />, label: 'À valider' },
        { path: '/enseignant/etudiants', icon: <FaUsers />, label: 'Étudiants' },
        { path: '/enseignant/rapports', icon: <FaFileAlt />, label: 'Rapports' },
        { path: '/profil', icon: <FaUserCog />, label: 'Profil' },
      ];
    }

    if (role === 'ROLE_ENCADREUR') {
      return [
        { path: dashboardPath, icon: <FaHome />, label: 'Accueil' },
        { path: '/encadreur/etudiants', icon: <FaUsers />, label: 'Étudiants' },
        { path: '/encadreur/stages', icon: <FaClipboardCheck />, label: 'Suivis' },
        { path: '/encadreur/rapports', icon: <FaFileAlt />, label: 'Rapports' },
        { path: '/profil', icon: <FaUserCog />, label: 'Profil' },
      ];
    }

    return [
      { path: dashboardPath, icon: <FaHome />, label: 'Accueil' },
      { path: '/notifications', icon: <FaBell />, label: 'Notifs' },
      { path: '/profil', icon: <FaUserCog />, label: 'Profil' },
    ];
  };

  const navItems = getBottomNavItems();

  return (
    <nav className="bottom-nav-emit">
      {navItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          className={({ isActive }) => (isActive ? 'bottom-nav-item active' : 'bottom-nav-item')}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
