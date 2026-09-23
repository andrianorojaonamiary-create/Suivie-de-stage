import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaBell, FaUpload, FaUserPlus } from 'react-icons/fa';

import { useEffect } from 'react';
import notificationsApi from '../api/notificationsApi';

function Notifications() {
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await notificationsApi.getAll();
        const dataList = Array.isArray(res) ? res : res?.data || res?.items || [];
        
        const mapped = dataList.map(n => ({
          id: n.id,
          type: n.type || 'Info',
          text: n.titre ? `${n.titre} : ${n.message || ''}` : (n.message || 'Notification'),
          time: n.dateCreation || n.createdAt
            ? new Date(n.dateCreation || n.createdAt).toLocaleDateString('fr-FR')
            : 'Récemment',
          read: Boolean(n.lu),
          icon: n.type === 'NOUVEL_INSCRIT' ? <FaUserPlus /> : <FaBell />,
          color: n.type === 'NOUVEL_INSCRIT' ? '#27AE60' : n.type === 'alerte' ? '#E74C3C' : '#6BA9E6',
          bg: n.type === 'NOUVEL_INSCRIT' ? '#E8F8F0' : n.type === 'alerte' ? '#FEE2E2' : '#E1ECFE'
        }));
        setItems(mapped);
      } catch (err) {
        console.error('Erreur chargement notifications:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const toggleRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const markAllRead = async () => {
    try {
      await Promise.all(items.filter(n => !n.read).map(n => notificationsApi.markAsRead(n.id)));
      setItems(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      setItems(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const unreadCount = items.filter(n => !n.read).length;
  const displayed = filter === 'unread' ? items.filter(n => !n.read) : items;

  // ===== AFFICHAGE =====
  if (loading) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <h2>Notifications</h2>
        </div>
        <p style={{ padding: '20px', color: '#6c7a8a' }}>Chargement des notifications...</p>
      </div>
    );
  }

  if (items.length === 0) {
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