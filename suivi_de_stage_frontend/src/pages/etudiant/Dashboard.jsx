import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, FaFileAlt, 
  FaArrowRight, FaClock, FaPlus,
  FaChartLine, FaAward,
  FaFilePdf, FaFileWord, FaFile, FaBell,
  FaMapPin, FaEye, FaExclamationTriangle,
  FaCheck
} from 'react-icons/fa';
import mapImage from '../../assets/map.jpg';
import { internshipsApi, notificationsApi } from '../../api';

function EtudiantDashboard() {
  const [progress, setProgress] = useState(45);
  const [loading, setLoading] = useState(true);

  // ===== INFORMATIONS DU STAGE =====
  const [stageInfo, setStageInfo] = useState({
    id: 1,
    titre: "Développement Web",
    entreprise: 'ABC Informatique',
    ville: 'Antananarivo',
    adresse: 'Lot III A 15 bis, Andrainjato',
    dateDebut: '03 Août 2026',
    dateFin: '03 Octobre 2026',
    statut: 'En cours',
    duree: '2 mois',
    joursEcoules: 20
  });

  // ===== RAPPORTS =====
  const [reports, setReports] = useState([
    { name: "Rapport de prise en main", fileName: "rapport_prise_en_main.pdf", date: "20 Mar 2024", status: "Validé" },
    { name: "Rapport intermédiaire", fileName: null, date: "—", status: "À déposer" },
    { name: "Rapport final", fileName: null, date: "—", status: "À venir" },
  ]);

  // ===== NOTIFICATIONS =====
  const [recentNotifications, setRecentNotifications] = useState([
    { text: "Rappel : Déposer la convention", detail: "Il vous reste 5 jours", date: "22/08/2026", icon: <FaBell />, color: '#F59E0B', bg: '#FEF3C7' },
    { text: "Nouvelle activité demandée", detail: "Ajouter le rapport d'avancement", date: "21/08/2026", icon: <FaExclamationTriangle />, color: '#EF4444', bg: '#FEE2E2' },
    { text: "Document validé", detail: "Votre plan de travail a été validé", date: "20/08/2026", icon: <FaCheck />, color: '#22C55E', bg: '#D1FAE5' },
  ]);

  // ===== ÉTAPES =====
  const [steps, setSteps] = useState([
    { label: "Convention Validée", done: true },
    { label: "Stage validé", done: true },
    { label: "Stage commencé", done: true },
    { label: "Stage en cours", done: true },
    { label: "Rapport à déposer", done: false },
    { label: "Évaluation", done: false },
    { label: "Stage terminé", done: false },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stagesRes = await internshipsApi.getAll();
        const stagesList = Array.isArray(stagesRes) ? stagesRes : stagesRes?.items || [];
        if (stagesList.length > 0) {
          const current = stagesList[0];
          setStageInfo({
            id: current.id,
            titre: current.title || 'Mon Stage',
            entreprise: current.company?.name || current.companyName || 'Entreprise',
            ville: current.city || current.company?.city || 'Antananarivo',
            adresse: current.address || current.company?.address || '',
            dateDebut: current.startDate ? new Date(current.startDate).toLocaleDateString('fr-FR') : 'Date début',
            dateFin: current.endDate ? new Date(current.endDate).toLocaleDateString('fr-FR') : 'Date fin',
            statut: current.status === 'en_cours' ? 'En cours' : current.status === 'termine' ? 'Terminé' : 'À venir',
            duree: current.duration || '3 mois',
            joursEcoules: current.elapsedDays || 30
          });
          if (current.progressPercentage) {
            setProgress(current.progressPercentage);
          }
        }

        const notifsRes = await notificationsApi.getAll();
        const notifsList = Array.isArray(notifsRes) ? notifsRes : notifsRes?.items || [];
        if (notifsList.length > 0) {
          setRecentNotifications(notifsList.slice(0, 3).map(n => ({
            text: n.title || n.message,
            detail: n.content || n.message || '',
            date: n.createdAt ? new Date(n.createdAt).toLocaleDateString('fr-FR') : '',
            icon: <FaBell />,
            color: '#F59E0B',
            bg: '#FEF3C7'
          })));
        }
      } catch (err) {
        console.error('Erreur dashboard etudiant:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        <Link to="/etudiant/ajouter-stage" className="btn-primary">
          <FaPlus /> Ajouter un stage
        </Link>
      </div>

      {/* ===== STATS ===== */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#DBEBF9', color: '#4A90D9' }}>
            <FaClock />
          </div>
          <div className="stat-content">
            <span className="stat-value">42</span>
            <span className="stat-label">Jours restants</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#D1FAE5', color: '#22C55E' }}>
            <FaFileAlt />
          </div>
          <div className="stat-content">
            <span className="stat-value">1 / 3</span>
            <span className="stat-label">Rapports déposés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEF3C7', color: '#F59E0B' }}>
            <FaChartLine />
          </div>
          <div className="stat-content">
            <span className="stat-value">75%</span>
            <span className="stat-label">Objectif atteint</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
            <FaAward />
          </div>
          <div className="stat-content">
            <span className="stat-value">4.5</span>
            <span className="stat-label">Évaluation moyenne</span>
          </div>
        </div>
      </div>

      {/* ===== LIGNE 1 : STAGE + LOCALISATION ===== */}
      <div className="dashboard-row-top">
        {/* STAGE - SANS ICÔNE */}
        <div className="dashboard-stage">
          <div className="stage-header">
            <h3>Mon stage actuel</h3>
            <span className="badge-en-cours">En cours</span>
          </div>
          <div className="stage-content">
            <div className="stage-layout">
              {/* L'icône FaBuilding a été supprimée */}
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
              <Link to="/etudiant/stage/1" className="btn-voir-stage">
                <FaEye /> Voir mon stage
              </Link>
            </div>
          </div>
        </div>

        {/* LOCALISATION */}
        <div className="dashboard-localisation">
          <h3><FaMapPin /> Localisation du stage</h3>
          <div className="localisation-card">
            <div className="localisation-map">
              <img 
                src={mapImage}
                alt="Carte de localisation du stage"
              />
              <FaMapPin className="map-pin" />
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
              <Link to="/etudiant/carte" className="btn-voir-carte">
                <FaEye /> Voir sur la carte
              </Link>
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
              <div key={index} className="notif-item">
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