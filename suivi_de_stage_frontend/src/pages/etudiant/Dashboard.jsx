import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, FaFileAlt, 
  FaArrowRight, FaClock, 
  FaChartLine,
  FaFilePdf, FaFileWord, FaFile, FaBell,
  FaEye, FaPlus, FaTimes
} from 'react-icons/fa';
import mapImage from '../../assets/map.jpg';
import { internshipsApi, notificationsApi, evaluationsApi } from '../../api';
import { mapInternship, getStatutBadge } from '../../utils/internshipMapping';
import {
  mapReportStatus,
  mapReportType,
  formatReportDate,
} from '../../utils/reportMapping';

function EtudiantDashboard() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);

  // ===== INFORMATIONS DU STAGE =====
  const [stageInfo, setStageInfo] = useState({
    id: null,
    titre: '',
    entreprise: '',
    ville: '',
    adresse: '',
    dateDebut: '',
    dateFin: '',
    statut: '',
    duree: '',
    joursEcoules: 0
  });

  // ===== RAPPORTS =====
  const [reports, setReports] = useState([]);

  // ===== NOTIFICATIONS =====
  const [recentNotifications, setRecentNotifications] = useState([]);

  // ===== ÉTAPES =====
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stagesRes = await internshipsApi.getAll();
        const stagesList = stagesRes?.data || (Array.isArray(stagesRes) ? stagesRes : []);
        if (stagesList.length === 0) {
          console.warn('Aucun stage retourné par l API pour cet utilisateur');
          setLoading(false);
          return;
        }
        const current = mapInternship(stagesList[0]);
        if (stagesList.length > 0) {
          setStageInfo({
            id: current.id,
            titre: current.titre,
            entreprise: current.entreprise,
            ville: current.ville,
            adresse: current.adresse,
            dateDebut: current.dateDebut
              ? new Date(current.dateDebut).toLocaleDateString('fr-FR')
              : 'Date début',
            dateFin: current.dateFin
              ? new Date(current.dateFin).toLocaleDateString('fr-FR')
              : 'Date fin',
            statut: current.statut,
            duree: current.duree || '3 mois',
            joursEcoules: current.joursEcoules || 0
          });

          const dateFin = current.dateFin ? new Date(current.dateFin) : null;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (dateFin) {
            const diffMs = dateFin.getTime() - today.getTime();
            setDaysRemaining(Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24))));
          }
        }

        const notifsRes = await notificationsApi.getAll();
        const notifsList = Array.isArray(notifsRes) ? notifsRes : notifsRes?.data || notifsRes?.items || [];
        if (notifsList.length > 0) {
          setRecentNotifications(notifsList.slice(0, 3).map(n => ({
            id: n.id,
            text: n.title || n.message,
            detail: n.content || n.message || '',
            date: n.createdAt ? new Date(n.createdAt).toLocaleDateString('fr-FR') : '',
            read: Boolean(n.lu),
            icon: <FaBell />,
            color: '#F59E0B',
            bg: '#FEF3C7'
          })));
        }

        if (stagesList.length > 0) {
          const currentReports = stagesList[0].reports || [];
          setReports(currentReports.map((r, i) => ({
            id: r.id || i,
            name: mapReportType(r.type),
            status: mapReportStatus(r.statut),
            date: formatReportDate(r.dateCreation),
            fileName: r.originalName || r.fileName || '',
          })));

          let hasEvaluation = false;
          try {
            const evals = await evaluationsApi.getByInternship(current.id);
            hasEvaluation = (Array.isArray(evals) ? evals : evals?.data || []).length > 0;
          } catch {
            hasEvaluation = false;
          }

          const stepsData = [
            { label: 'Validation du thème', done: true },
            {
              label: 'Début du stage',
              done: current.statut === 'En cours' || current.statut === 'Terminé',
            },
            {
              label: 'Mi-parcours',
              done: (current.statut === 'En cours' || current.statut === 'Terminé')
                && current.dateDebut && current.dateFin
                && new Date().getTime() >= (new Date(current.dateDebut).getTime() + new Date(current.dateFin).getTime()) / 2,
            },
            {
              label: 'Fin du stage',
              done: (current.statut === 'En cours' || current.statut === 'Terminé')
                && current.dateFin
                && new Date().getTime() >= new Date(current.dateFin).getTime(),
            },
            {
              label: 'Évaluation',
              done: hasEvaluation,
            },
            {
              label: 'Validation finale',
              done: current.statut === 'Terminé',
            },
          ];
          setSteps(stepsData);
          const doneCount = stepsData.filter((s) => s.done).length;
          setProgress(Math.round((doneCount / stepsData.length) * 100));
        }
      } catch (err) {
        console.error('Erreur dashboard etudiant:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const readNotification = async (notification) => {
    if (notification.read || !notification.id) return;
    try {
      await notificationsApi.markAsRead(notification.id);
    } finally {
      setRecentNotifications(prev => prev.map(item => item.id === notification.id ? { ...item, read: true } : item));
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsApi.delete(id);
      setRecentNotifications(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erreur suppression notification:', error);
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      'Validé': 'badge-valide',
      'À déposer': 'badge-en-attente',
      'À venir': 'badge-termine',
      'En révision': 'badge-en-cours',
    };
    return classes[status] || 'badge-en-attente';
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFile style={{ color: '#A0B8D0' }} />;
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return <FaFilePdf style={{ color: '#EF4444' }} />;
      case 'docx': case 'doc': return <FaFileWord style={{ color: '#4A90D9' }} />;
      default: return <FaFileAlt style={{ color: '#A0B8D0' }} />;
    }
  };

  return (
    <div className="etudiant-dashboard">
      {/* ===== HEADER ===== */}
      <div className="etudiant-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Bienvenue dans votre espace étudiant</p>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#DBEBF9', color: '#4A90D9' }}>
            <FaClock />
          </div>
          <div className="stat-content">
            <span className="stat-value">{daysRemaining}</span>
            <span className="stat-label">Jours restants</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#D1FAE5', color: '#22C55E' }}>
            <FaFileAlt />
          </div>
          <div className="stat-content">
            <span className="stat-value">{reports.length} / 3</span>
            <span className="stat-label">Rapports déposés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEF3C7', color: '#F59E0B' }}>
            <FaChartLine />
          </div>
          <div className="stat-content">
            <span className="stat-value">{progress}%</span>
            <span className="stat-label">Progression du stage</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#E0F2FE', color: '#0891B2' }}>
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stageInfo.joursEcoules}</span>
            <span className="stat-label">Jours de stage écoulés</span>
          </div>
        </div>
      </div>

      {/* ===== LIGNE 1 : STAGE + LOCALISATION ===== */}
      <div className="dashboard-row-top">
        {/* STAGE - SANS ICÔNE */}
        <div className="dashboard-stage">
          <div className="stage-header">
            <h3>Mon stage actuel</h3>
            {stageInfo.statut && <span className={getStatutBadge(stageInfo.statut)}>{stageInfo.statut}</span>}
          </div>
          <div className="stage-content">
            {stageInfo.id ? (
              <>
                <div className="stage-layout">
                  <div className="stage-info">
                    <h2>{stageInfo.titre}</h2>
                    <p className="stage-company">{stageInfo.entreprise}</p>
                    <div className="stage-dates">
                      <span><FaCalendarAlt /> {stageInfo.dateDebut}</span>
                      <span>→</span>
                      <span><FaCalendarAlt /> {stageInfo.dateFin}</span>
                    </div>
                    <div className="stage-info-row">
                      <span>Durée : {stageInfo.duree}</span>
                      <span>|</span>
                      <span>{stageInfo.joursEcoules} jours écoulés</span>
                    </div>
                  </div>
                </div>
                <div className="stage-progress">
                  <div className="progress-header">
                    <span className="progress-label">Progression du stage</span>
                    <span className="progress-value">{progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="stage-actions">
                  <Link to={`/etudiant/stage/${stageInfo.id}`} className="btn-voir-stage">
                    <FaEye /> Voir mon stage
                  </Link>
                </div>
              </>
            ) : (
              <div className="stage-empty">
                <div className="empty-icon"><FaFileAlt /></div>
                <p>Aucun stage en cours</p>
                <span className="empty-sub">Ajoutez votre stage pour démarrer le suivi.</span>
                <Link to="/etudiant/ajouter-stage" className="btn-voir-stage">
                  <FaPlus /> Ajouter un stage
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* LOCALISATION */}
        <div className="dashboard-localisation">
          <h3> Localisation du stage</h3>
          <div className="localisation-card">
            <div className="localisation-map">
              <img 
                src={mapImage}
                alt="Carte de localisation du stage"
              />
              <img
                src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png"
                alt="Localisation"
                className="map-pin"
              />
              <div className="map-pin-tooltip">
                {stageInfo.entreprise} - {stageInfo.ville}
              </div>
            </div>
            <div className="localisation-info-wrapper">
              <div className="localisation-info">
                <h4>{stageInfo.entreprise}</h4>
                <p>{stageInfo.adresse}</p>
                <p>{stageInfo.ville}, Madagascar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RAPPORTS + NOTIFICATIONS ===== */}
      <div className="dashboard-row-middle">
        {/* NOTIFICATIONS */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Notifications récentes</h3>
            <span className="card-badge">{recentNotifications.length} nouvelles</span>
          </div>
          <div className="card-list">
            {recentNotifications.map((notif, index) => (
              <div key={notif.id || index} className={`notif-item ${!notif.read ? 'unread' : ''}`} onClick={() => readNotification(notif)}>
                <div className="notif-left">
                  <div className="notif-icon" style={{ backgroundColor: notif.bg, color: notif.color }}>
                    {notif.icon}
                  </div>
                  <div className="notif-content">
                    <p>{notif.text}</p>
                    <span className="notif-detail">{notif.detail}</span>
                  </div>
                </div>
                <div className="notif-right">
                  <span className="notif-date">{notif.date}</span>
                  {notif.read && notif.id && (
                    <button type="button" className="notif-delete" aria-label="Supprimer la notification" title="Supprimer la notification" onClick={(event) => { event.stopPropagation(); deleteNotification(notif.id); }}>
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link to="/notifications" className="card-footer-link">
            Voir toutes les notifications <FaArrowRight />
          </Link>
        </div>

        {/* RAPPORTS - SANS FOND POUR LES ICÔNES */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Mes rapports</h3>
            <span className="card-badge">{reports.filter(r => r.status === 'Validé').length} validé(s)</span>
          </div>
          <div className="card-list">
            {reports.map((r, index) => (
              <div key={index} className="report-notif-item">
                <div className="report-notif-left">
                  {/* Plus de fond pour les icônes - background transparent */}
                  <div className="report-notif-icon">
                    {getFileIcon(r.fileName)}
                  </div>
                  <div className="report-notif-info">
                    <span className="report-notif-name">{r.name}</span>
                    <span className="report-notif-date">{r.date}</span>
                  </div>
                </div>
                <div className="report-notif-right">
                  <span className={getStatusBadge(r.status)}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/etudiant/rapports" className="card-footer-link">
            Voir tous les rapports <FaArrowRight />
          </Link>
        </div>
      </div>

      {/* ===== ÉTAPES - NOUVEAU STYLE ===== */}
      <div className="dashboard-steps-horizontal">
        <h3>
          Étapes de suivi du stage
          <span className="card-badge">
            {steps.filter(s => s.done).length}/{steps.length} réalisées
          </span>
        </h3>
        <div className="steps-horizontal-list">
          {steps.map((step, index) => {
            const isActive = step.done === false && (index === 0 || steps[index - 1]?.done === true);
            return (
              <div key={index} className="step-horizontal-wrapper">
                <div className={`step-horizontal-item ${step.done ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="step-horizontal-number">{index + 1}</div>
                  <div className="step-horizontal-label">{step.label}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`step-horizontal-line ${step.done ? 'done' : ''} ${isActive ? 'active' : ''}`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EtudiantDashboard;