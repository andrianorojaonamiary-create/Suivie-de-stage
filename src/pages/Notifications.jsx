import { useEffect, useMemo, useState } from 'react';
import { FaBell, FaCalendarAlt, FaCheck, FaCheckCircle, FaClock, FaInfoCircle, FaStar, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import apiClient, { getApiErrorMessage } from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';

const notificationStyle = {
  STAGE_AFFECTE: { label: 'Affectation', icon: FaUserPlus, color: '#4A90D9', bg: '#DBEBF9' },
  STAGE_MODIFIE: { label: 'Stage modifié', icon: FaInfoCircle, color: '#7C3AED', bg: '#EDE9FE' },
  STAGE_TERMINE: { label: 'Fin de stage', icon: FaCheckCircle, color: '#27AE60', bg: '#D1FAE5' },
  FIN_STAGE_PROCHE: { label: 'Échéance', icon: FaCalendarAlt, color: '#E67E22', bg: '#FEF3C7' },
  EVALUATION: { label: 'Évaluation', icon: FaStar, color: '#8E44AD', bg: '#F3E8FF' },
  INFORMATION: { label: 'Information', icon: FaInfoCircle, color: '#1A3A6B', bg: '#EEF5FC' },
};

const formatDate = (value) => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Date inconnue';

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingIds, setUpdatingIds] = useState(new Set());

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsResponse, unreadResponse] = await Promise.all([
        apiClient.get('/notifications', { params: { limit: 100 } }),
        apiClient.get('/notifications', { params: { lu: false, limit: 1 } }),
      ]);
      const rawNotifications = notificationsResponse.data.data || [];
      // Filtrer explicitement les offres et candidatures comme demandé
      const filteredNotifications = rawNotifications.filter(
        (n) => !['OFFRE', 'CANDIDATURE'].includes(n.type)
      );
      setNotifications(filteredNotifications);
      setUnreadCount(unreadResponse.data.meta?.total || 0);
      setError('');
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Impossible de charger les notifications.'));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (user) void Promise.resolve().then(loadNotifications);
  }, [user]);
  const displayedNotifications = useMemo(() => notifications.filter((notification) => filter === 'all' || (filter === 'unread' ? !notification.lu : notification.lu)), [filter, notifications]);

  const markAsRead = async (id) => {
    if (updatingIds.has(id)) return;
    try {
      setUpdatingIds((ids) => new Set(ids).add(id));
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, lu: true } : item));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (updateError) { toast.error(getApiErrorMessage(updateError, 'Impossible de marquer la notification comme lue.')); }
    finally { setUpdatingIds((ids) => { const next = new Set(ids); next.delete(id); return next; }); }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((notification) => !notification.lu).map((notification) => notification.id);
    try {
      await Promise.all(unreadIds.map((id) => apiClient.patch(`/notifications/${id}/read`)));
      setNotifications((items) => items.map((item) => ({ ...item, lu: true })));
      setUnreadCount((count) => Math.max(0, count - unreadIds.length));
    } catch (updateError) { toast.error(getApiErrorMessage(updateError, 'Impossible de marquer toutes les notifications comme lues.')); }
  };

  return <div className="notifications-container">
    <div className="notifications-header"><div><h2><FaBell /> Notifications {unreadCount > 0 && <span className="notif-badge">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>}</h2><p className="text-muted">Suivi de vos étudiants et de leurs stages.</p></div>{unreadCount > 0 && <button type="button" className="btn-mark-read" onClick={markAllAsRead}><FaCheck /> Tout marquer comme lu</button>}</div>
    {error && <div className="alert alert-danger">{error}</div>}
    <div className="notifications-tabs"><button type="button" className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Toutes</button><button type="button" className={`tab-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>Non lues {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}</button><button type="button" className={`tab-btn ${filter === 'history' ? 'active' : ''}`} onClick={() => setFilter('history')}>Historique</button></div>
    <div className="notifications-divider" />
    {loading ? <div className="empty-state"><p>Chargement des notifications…</p></div> : displayedNotifications.length === 0 ? <div className="empty-state"><FaBell className="empty-icon" /><p>{filter === 'history' ? 'Aucune notification lue dans l’historique.' : 'Aucune notification pour le moment.'}</p></div> : <div className="notifications-list">{displayedNotifications.map((notification) => { const style = notificationStyle[notification.type] || notificationStyle.INFORMATION; const Icon = style.icon; return <article key={notification.id} className={`notification-item ${!notification.lu ? 'unread' : ''}`}><div className="notification-icon" style={{ backgroundColor: style.bg, color: style.color }}><Icon /></div><div className="notification-content"><div className="notification-top"><span className="notification-type" style={{ color: style.color, backgroundColor: style.bg }}>{style.label}</span></div><p className="notification-text">{notification.message}</p><span className="notification-time"><FaClock /> {formatDate(notification.dateCreation)}</span>{!notification.lu && <button type="button" className="btn-read-notification" disabled={updatingIds.has(notification.id)} onClick={() => markAsRead(notification.id)}><FaCheck /> Marquer comme lue</button>}</div>{!notification.lu && <span className="unread-dot" />}</article>; })}</div>}
  </div>;
}
export default Notifications;
