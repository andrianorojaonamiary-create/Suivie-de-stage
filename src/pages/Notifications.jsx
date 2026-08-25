import { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  FaCheckCircle, FaFileAlt, FaExclamationTriangle, 
  FaCalendarAlt, FaComment, FaBuilding, FaCheck,
  FaUserPlus, FaClock, FaStar, FaUsers, FaBell,
  FaUpload, FaFilePdf
} from 'react-icons/fa';

function Notifications() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [readStatus, setReadStatus] = useState({});

  // ===== NOTIFICATIONS PAR RÔLE =====
  const notifications = useMemo(() => {
    const role = user?.role;

    // ===== ADMIN =====
    if (role === 'ROLE_ADMIN') {
      return [
        { id: 1, type: 'Système', text: 'Nouvel utilisateur inscrit : Miora Rakoto', time: 'Il y a 12 min', read: false, icon: <FaUserPlus />, color: '#4A90D9', bg: '#DBEBF9' },
        { id: 2, type: 'Validation', text: 'Stage validé pour TechMada SARL par l\'enseignant', time: 'Il y a 45 min', read: false, icon: <FaCheckCircle />, color: '#27AE60', bg: '#D1FAE5' },
        { id: 3, type: 'Alerte', text: '5 stages en attente de validation', time: 'Il y a 2 h', read: false, icon: <FaExclamationTriangle />, color: '#E74C3C', bg: '#FEE2E2' },
        { id: 4, type: 'Statistique', text: 'Rapport mensuel des stages disponible', time: 'Il y a 3 h', read: true, icon: <FaFileAlt />, color: '#F39C12', bg: '#FEF3C7' },
        { id: 5, type: 'Entreprise', text: 'Nouvelle entreprise partenaire : Orange Madagascar', time: 'Hier à 14:30', read: true, icon: <FaBuilding />, color: '#1A3A6B', bg: '#EEF5FC' },
      ];
    }

    // ===== ÉTUDIANT =====
    if (role === 'ROLE_ETUDIANT') {
      return [
        { 
          id: 1, 
          type: 'Rapport à déposer', 
          text: 'Vous devez déposer votre rapport intermédiaire pour TechMada SARL', 
          time: 'Échéance : 15 Mai 2024', 
          read: false, 
          icon: <FaFilePdf />, 
          color: '#92400E', 
          bg: '#FDE68A',
          isReportPending: true,
          actionLink: '/etudiant/rapports',
          actionLabel: 'Déposer maintenant'
        },
        { 
          id: 2, 
          type: 'Rapport à déposer', 
          text: 'Rapport de prise en main à déposer pour Airtel Madagascar', 
          time: 'Échéance : 01 Avr 2024', 
          read: false, 
          icon: <FaFilePdf />, 
          color: '#92400E', 
          bg: '#FDE68A',
          isReportPending: true,
          actionLink: '/etudiant/rapports',
          actionLabel: 'Déposer maintenant'
        },
        { id: 3, type: 'Validation', text: 'Votre stage chez TechMada SARL a été validé', time: 'Il y a 12 min', read: false, icon: <FaCheckCircle />, color: '#27AE60', bg: '#D1FAE5' },
        { id: 4, type: 'Commentaire', text: 'Prof. Andrianivo a commenté votre stage', time: 'Il y a 2 h', read: false, icon: <FaComment />, color: '#7C3AED', bg: '#EDE9FE' },
        { id: 5, type: 'Échéance', text: 'Prochaine échéance : 15 Mai 2024', time: 'Il y a 3 h', read: true, icon: <FaCalendarAlt />, color: '#4A90D9', bg: '#DBEBF9' },
        { id: 6, type: 'Rapport', text: 'Votre rapport de prise en main a été accepté', time: 'Hier à 14:30', read: true, icon: <FaFileAlt />, color: '#27AE60', bg: '#D1FAE5' },
      ];
    }

    // ===== ENSEIGNANT =====
    if (role === 'ROLE_ENSEIGNANT') {
      return [
        { id: 1, type: 'Stage', text: 'Nouveau stage en attente de validation (Miora Rakoto)', time: 'Il y a 12 min', read: false, icon: <FaFileAlt />, color: '#4A90D9', bg: '#DBEBF9' },
        { id: 2, type: 'Rapport', text: 'Rapport déposé par Miora Rakoto à vérifier', time: 'Il y a 45 min', read: false, icon: <FaFileAlt />, color: '#F39C12', bg: '#FEF3C7' },
        { id: 3, type: 'Évaluation', text: 'Évaluation à réaliser pour Hery Rakotondrabe', time: 'Il y a 2 h', read: false, icon: <FaStar />, color: '#7C3AED', bg: '#EDE9FE' },
        { id: 4, type: 'Info', text: '12 étudiants suivis ce semestre', time: 'Il y a 3 h', read: true, icon: <FaUsers />, color: '#1A3A6B', bg: '#EEF5FC' },
        { id: 5, type: 'Rappel', text: 'Rappel : Validation des rapports avant le 20 Mai', time: 'Hier à 14:30', read: true, icon: <FaBell />, color: '#F39C12', bg: '#FEF3C7' },
      ];
    }

    // ===== ENCADREUR =====
    if (role === 'ROLE_ENCADREUR') {
      return [
        { id: 1, type: 'Stage', text: 'Nouveau stage à suivre chez TechMada SARL', time: 'Il y a 12 min', read: false, icon: <FaBuilding />, color: '#4A90D9', bg: '#DBEBF9' },
        { id: 2, type: 'Rapport', text: 'Rapport de Miora Rakoto à commenter', time: 'Il y a 45 min', read: false, icon: <FaFileAlt />, color: '#F39C12', bg: '#FEF3C7' },
        { id: 3, type: 'Évaluation', text: 'Évaluation du stagiaire Hery Rakotondrabe', time: 'Il y a 2 h', read: false, icon: <FaStar />, color: '#27AE60', bg: '#D1FAE5' },
        { id: 4, type: 'Info', text: '6 étudiants encadrés cette année', time: 'Il y a 3 h', read: true, icon: <FaUsers />, color: '#6c7a8a', bg: '#EEF5FC' },
        { id: 5, type: 'Rappel', text: 'Rappel : Fin de stage de Tojo Ramanantsoa', time: 'Hier à 14:30', read: true, icon: <FaClock />, color: '#E74C3C', bg: '#FEE2E2' },
      ];
    }

    // ===== NOTIFICATIONS PAR DÉFAUT =====
    return [
      { id: 1, type: 'Bienvenue', text: 'Bienvenue sur la plateforme de suivi des stages', time: 'Maintenant', read: false, icon: <FaBell />, color: '#4A90D9', bg: '#DBEBF9' },
    ];
  }, [user?.role]);

  // ===== FONCTIONS =====
  const toggleRead = (id) => {
    setReadStatus(prev => ({ ...prev, [id]: true }));
  };

  const markAllRead = () => {
    const allIds = notifications.reduce((acc, n) => ({ ...acc, [n.id]: true }), {});
    setReadStatus(allIds);
  };

  const notificationsWithRead = notifications.map(n => ({
    ...n,
    read: readStatus[n.id] || n.read
  }));

  const unreadCount = notificationsWithRead.filter(n => !n.read).length;
  /*onst reportPendingCount = notificationsWithRead.filter(n => n.isReportPending && !n.read).length;*/

  const displayed = filter === 'unread' 
    ? notificationsWithRead.filter(n => !n.read) 
    : notificationsWithRead;

  // ===== AFFICHAGE =====
  if (notifications.length === 0) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <h2>Notifications</h2>
        </div>
        <div className="empty-state">
          <div className="empty-icon"></div>
          <p>Aucune notification pour le moment</p>
          <p className="empty-sub">Revenez plus tard pour voir vos notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div>
          <h2>Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <button className="btn-mark-read" onClick={markAllRead}>
            <FaCheck /> Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="notifications-tabs">
        <button 
          className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Toutes
        </button>
        <button 
          className={`tab-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Non lues
          {unreadCount > 0 && (
            <span className="tab-badge">{unreadCount}</span>
          )}
        </button>
      </div>

      {/* ===== SÉPARATEUR ===== */}
      <div className="notifications-divider"></div>

      <div className="notifications-list">
        {displayed.map((notif) => (
          <div 
            key={notif.id}
            className={`notification-item ${!notif.read ? 'unread' : ''} ${notif.isReportPending ? 'report-pending' : ''}`}
            onClick={() => toggleRead(notif.id)}
          >
            <div className="notification-icon" style={{ backgroundColor: notif.bg, color: notif.color }}>
              {notif.icon}
            </div>
            <div className="notification-content">
              <div className="notification-top">
                <span className="notification-type" style={{ color: notif.color, backgroundColor: notif.bg }}>
                  {notif.type}
                </span>
              </div>
              <p className="notification-text">{notif.text}</p>
              <span className="notification-time">{notif.time}</span>
              {notif.isReportPending && (
                <Link to={notif.actionLink} className="btn-deposer-notif" onClick={(e) => e.stopPropagation()}>
                  <FaUpload /> {notif.actionLabel}
                </Link>
              )}
            </div>
            {/* ===== POINT POUR NON LU ===== */}
            {!notif.read && <span className="unread-dot"></span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;