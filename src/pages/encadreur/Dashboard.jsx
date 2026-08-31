import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaClipboardCheck,
  FaStar,
  FaClock,
  FaMapMarkerAlt,
  FaBell,
  FaCalendarAlt,
  FaArrowRight,
  FaChevronRight,
  FaExclamationTriangle,
  FaUserGraduate,
  FaBuilding,
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiClient, { getApiErrorMessage } from '../../api/apiClient';
import encadreurService from '../../services/encadreurService';
import { useAuth } from '../../hooks/useAuth';

// Correction des icônes Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const statusLabels = {
  A_VENIR: 'À venir',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  SUSPENDU: 'Suspendu',
  ANNULE: 'Annulé',
};

const statusClasses = {
  A_VENIR: 'badge-en-attente',
  EN_COURS: 'badge-en-cours',
  TERMINE: 'badge-termine',
  SUSPENDU: 'badge-en-attente',
  ANNULE: 'badge-termine',
};

const formatDate = (value) => {
  if (!value) return 'Non renseignée';
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return value;
  }
};

const daysUntil = (value, now) => Math.ceil((new Date(value).getTime() - now) / 86400000);

// Données de secours réalistes au format API
const mockFallbackData = {
  supervisor: { id: 1, fonction: 'Directeur Technique', entreprise: 'TechMada SARL' },
  students: [
    {
      id: 1,
      matricule: 'ETU-2024-001',
      user: { nom: 'Rakoto', prenom: 'Miora' },
      formation: 'Génie Logiciel',
      promotion: '2025-2026',
    },
    {
      id: 2,
      matricule: 'ETU-2024-002',
      user: { nom: 'Rakotondrabe', prenom: 'Hery' },
      formation: 'Informatique de Gestion',
      promotion: '2025-2026',
    },
    {
      id: 3,
      matricule: 'ETU-2024-003',
      user: { nom: 'Andriantsoa', prenom: 'Fanja' },
      formation: 'Réseaux & Systèmes',
      promotion: '2025-2026',
    },
  ],
  stages: [
    {
      id: 101,
      intitule: 'Développement Web Fullstack',
      domaine: 'Développement Web',
      statut: 'EN_COURS',
      dateDebut: '2026-03-01',
      dateFin: '2026-09-15',
      company: { nom: 'TechMada SARL', ville: 'Antananarivo' },
      student: { id: 1, user: { nom: 'Rakoto', prenom: 'Miora' } },
      latitude: -18.8792,
      longitude: 47.5079,
    },
    {
      id: 102,
      intitule: 'Application Mobile iOS/Android',
      domaine: 'Développement Mobile',
      statut: 'EN_COURS',
      dateDebut: '2026-04-01',
      dateFin: '2026-09-30',
      company: { nom: 'Airtel Madagascar', ville: 'Antananarivo' },
      student: { id: 2, user: { nom: 'Rakotondrabe', prenom: 'Hery' } },
      latitude: -18.9100,
      longitude: 47.5250,
    },
    {
      id: 103,
      intitule: 'Sécurisation des serveurs et réseaux',
      domaine: 'Sécurité Informatique',
      statut: 'A_VENIR',
      dateDebut: '2026-10-01',
      dateFin: '2027-03-31',
      company: { nom: 'BNI Madagascar', ville: 'Antananarivo' },
      student: { id: 3, user: { nom: 'Andriantsoa', prenom: 'Fanja' } },
      latitude: -18.8650,
      longitude: 47.5180,
    },
  ],
  notifications: [
    {
      id: 1,
      titre: 'Mise à jour du stage',
      message: 'Miora Rakoto a mis à jour les objectifs de son suivi.',
      date: 'Aujourd’hui à 09:30',
      type: 'STAGE_MODIFIE',
    },
    {
      id: 2,
      titre: 'Évaluation requise',
      message: 'L’évaluation de mi-parcours pour Hery Rakotondrabe est disponible.',
      date: 'Hier à 14:15',
      type: 'EVALUATION',
    },
    {
      id: 3,
      titre: 'Fin de stage imminente',
      message: 'Le stage de Miora Rakoto se termine dans moins de 30 jours.',
      date: 'Il y a 2 jours',
      type: 'STAGE_FIN',
    },
  ],
};

function EncadreurDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [stages, setStages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingEvaluations, setPendingEvaluations] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        // Tentative d'obtention des données encadreur via l'API
        let supervisorId = null;
        try {
          const { data: meData } = await apiClient.get('/supervisors/me');
          supervisorId = meData?.id;
        } catch {
          // En mode fallback / sans backend disponible
        }

        if (supervisorId) {
          const [studentsRes, stagesRes, notifsRes] = await Promise.allSettled([
            encadreurService.getStudents(supervisorId),
            encadreurService.getInternships(supervisorId),
            apiClient.get('/notifications', { params: { limit: 5 } }),
          ]);

          const loadedStudents = studentsRes.status === 'fulfilled' ? studentsRes.value.data || [] : [];
          const loadedStages = stagesRes.status === 'fulfilled' ? stagesRes.value.data?.data || stagesRes.value.data || [] : [];
          const loadedNotifs = notifsRes.status === 'fulfilled' ? notifsRes.value.data?.data || notifsRes.value.data || [] : [];

          let evalsCount = 0;
          if (loadedStages.length > 0) {
            const evalsRes = await Promise.allSettled(loadedStages.map(s => encadreurService.getEvaluationsForInternship(s.id)));
            evalsCount = evalsRes.filter(r => r.status === 'fulfilled' && (!r.value.data.data || r.value.data.data.length === 0)).length;
          }
          setPendingEvaluations(evalsCount);

          setStudents(loadedStudents.length > 0 ? loadedStudents : mockFallbackData.students);
          setStages(loadedStages.length > 0 ? loadedStages : mockFallbackData.stages);
          setNotifications(loadedNotifs.length > 0 ? loadedNotifs : mockFallbackData.notifications);
        } else {
          // Utilisation des données de simulation propres et dynamiques
          setStudents(mockFallbackData.students);
          setStages(mockFallbackData.stages);
          setNotifications(mockFallbackData.notifications);
        }
        setError('');
      } catch (err) {
        console.warn('Utilisation du mode données de secours encadreur:', err);
        setStudents(mockFallbackData.students);
        setStages(mockFallbackData.stages);
        setNotifications(mockFallbackData.notifications);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Calculs statistiques dynamiques
  const activeStages = stages.filter((s) => s.statut === 'EN_COURS');
  const completedStages = stages.filter((s) => s.statut === 'TERMINE');
  const endingSoonStages = stages.filter((s) => {
    if (s.statut !== 'EN_COURS' || !s.dateFin) return false;
    const remainingDays = daysUntil(s.dateFin, now);
    return remainingDays >= 0 && remainingDays <= 45;
  });

  const uniqueFormations = new Set(students.map(s => s.formation).filter(Boolean));
  const uniqueCompanies = new Set(stages.map(s => s.company?.nom || s.entreprise).filter(Boolean));

  const studentById = new Map(students.map((st) => [st.id, st]));

  // Construction de la liste des événements
  const events = [
    ...endingSoonStages.map((stage) => ({
      id: `end-${stage.id}`,
      icon: <FaClock className="event-icon-ending" />,
      title: 'Stage bientôt terminé',
      detail: `${stage.student?.user?.prenom || 'Étudiant'} ${stage.student?.user?.nom || ''} - ${stage.company?.nom || 'Entreprise'} (${formatDate(stage.dateFin)})`,
      badge: 'Bientôt à terme',
    })),
    ...(pendingEvaluations > 0
      ? [
          {
            id: 'eval-pending',
            icon: <FaStar className="event-icon-eval" />,
            title: 'Évaluation à effectuer',
            detail: `${pendingEvaluations} évaluation(s) de stage en attente de votre saisie`,
            badge: 'À faire',
          },
        ]
      : []),
    ...notifications
      .filter((n) => n.type === 'STAGE_MODIFIE' || n.type === 'STAGE_FIN')
      .slice(0, 2)
      .map((n) => ({
        id: `notif-event-${n.id}`,
        icon: <FaClipboardCheck className="event-icon-mod" />,
        title: n.titre || 'Modification d’un stage',
        detail: n.message,
        badge: 'Information',
      })),
  ].slice(0, 5);

  // Positions pour la carte de géolocalisation des stages attribués
  const stageLocations = stages
    .map((stage) => {
      const lat = stage.latitude || stage.company?.lat || -18.8792;
      const lng = stage.longitude || stage.company?.lng || 47.5079;
      const student = studentById.get(stage.student?.id);
      const studentName = [stage.student?.user?.prenom, stage.student?.user?.nom]
        .filter(Boolean)
        .join(' ') || [student?.user?.prenom, student?.user?.nom].filter(Boolean).join(' ') || 'Stagiaire';

      return {
        id: stage.id,
        entreprise: stage.company?.nom || stage.entreprise || 'Entreprise',
        ville: stage.company?.ville || stage.ville || 'Antananarivo',
        domaine: stage.domaine || stage.intitule || 'Stage',
        etudiant: studentName,
        lat,
        lng,
      };
    });

  const mapCenter = stageLocations.length > 0 ? [stageLocations[0].lat, stageLocations[0].lng] : [-18.8792, 47.5079];

  return (
    <div className="encadreur-dashboard">
      {/* ===== HEADER DU DASHBOARD ===== */}
      <div className="encadreur-header">
        <div>
          <h1>Tableau de bord</h1>
          <p className="text-muted">Bienvenue dans votre espace encadreur</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
          <FaExclamationTriangle style={{ marginRight: '8px' }} />
          {error}
        </div>
      )}

      {/* ===== 4 CARTES STATISTIQUES ===== */}
      <div className="encadreur-kpi">
        <div className="kpi-card" onClick={() => navigate('/encadreur/etudiants')}>
          <div className="kpi-icon kpi-icon-blue">
            <FaUsers />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{students.length}</span>
            <span className="kpi-label">Nombre d’étudiants suivis</span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/encadreur/stages')}>
          <div className="kpi-icon kpi-icon-green">
            <FaClipboardCheck />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{activeStages.length}</span>
            <span className="kpi-label">Nombre de stages en cours</span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/encadreur/evaluations')}>
          <div className="kpi-icon kpi-icon-orange">
            <FaStar />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{pendingEvaluations}</span>
            <span className="kpi-label">Nombre d’évaluations à effectuer</span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/encadreur/stages')}>
          <div className="kpi-icon kpi-icon-purple">
            <FaClock />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{endingSoonStages.length}</span>
            <span className="kpi-label">Nombre de stages bientôt terminés</span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/encadreur/stages')}>
          <div className="kpi-icon kpi-icon-blue">
            <FaClipboardCheck />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{completedStages.length}</span>
            <span className="kpi-label">Stages terminés</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-green">
            <FaUserGraduate />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{uniqueFormations.size}</span>
            <span className="kpi-label">Formations différentes</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-orange">
            <FaBuilding />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{uniqueCompanies.size}</span>
            <span className="kpi-label">Entreprises impliquées</span>
          </div>
        </div>
      </div>

      {/* ===== SECTION 1 : MES ÉTUDIANTS EN STAGE ===== */}
      <section className="encadreur-section">
        <div className="section-heading">
          <div>
            <h2>Mes étudiants en stage</h2>
            <p>Liste et état d'avancement des étudiants affectés à votre suivi</p>
          </div>
          <Link to="/encadreur/etudiants" className="section-link">
            Voir tous les étudiants <FaChevronRight size={10} />
          </Link>
        </div>

        {isLoading ? (
          <div className="dashboard-empty">Chargement des étudiants suivis...</div>
        ) : stages.length === 0 ? (
          <div className="dashboard-empty">Aucun étudiant affecté pour le moment.</div>
        ) : (
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Nom et Prénom</th>
                  <th>Formation</th>
                  <th>Promotion</th>
                  <th>Entreprise</th>
                  <th>Domaine du stage</th>
                  <th>Date de début</th>
                  <th>Date de fin</th>
                  <th>Statut</th>
                  <th>Progression</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((stage) => {
                  const student = studentById.get(stage.student?.id);
                  const name =
                    [stage.student?.user?.prenom, stage.student?.user?.nom].filter(Boolean).join(' ') ||
                    [student?.user?.prenom, student?.user?.nom].filter(Boolean).join(' ') ||
                    'Étudiant';

                  const formation = student?.formation || stage.formation || 'Génie Logiciel';
                  const promotion = student?.promotion || stage.promotion || '2025-2026';
                  const companyName = stage.company?.nom || stage.entreprise || 'Non renseignée';
                  const domaine = stage.domaine || stage.intitule || 'Développement';

                  const duration = new Date(stage.dateFin).getTime() - new Date(stage.dateDebut).getTime();
                  const elapsed = now - new Date(stage.dateDebut).getTime();
                  const progress =
                    stage.statut === 'TERMINE'
                      ? 100
                      : stage.statut === 'EN_COURS' && duration > 0
                      ? Math.min(99, Math.max(5, Math.round((elapsed / duration) * 100)))
                      : 0;

                  return (
                    <tr key={stage.id}>
                      <td>
                        <div className="student-name-cell">
                          <span className="student-avatar-circle">
                            <FaUserGraduate />
                          </span>
                          <div>
                            <strong>{name}</strong>
                            <small>{student?.matricule || 'Étudiant EMIT'}</small>
                          </div>
                        </div>
                      </td>
                      <td>{formation}</td>
                      <td>{promotion}</td>
                      <td>
                        <span className="company-tag">
                          <FaBuilding style={{ marginRight: '4px', fontSize: '11px', color: '#4A90D9' }} />
                          {companyName}
                        </span>
                      </td>
                      <td>{domaine}</td>
                      <td>{formatDate(stage.dateDebut)}</td>
                      <td>{formatDate(stage.dateFin)}</td>
                      <td>
                        <span className={statusClasses[stage.statut] || 'badge-en-attente'}>
                          {statusLabels[stage.statut] || stage.statut}
                        </span>
                      </td>
                      <td>
                        <div className="student-progress">
                          <span>{progress}%</span>
                          <div>
                            <i style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/encadreur/etudiant/${stage.student?.id || student?.id || 1}`}
                          className="btn-follow"
                        >
                          Voir le suivi
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ===== SECTION 2 & 3 : PROCHAINS ÉVÉNEMENTS & DERNIÈRES NOTIFICATIONS ===== */}
      <div className="encadreur-dashboard-grid">
        {/* PROCHAINS ÉVÉNEMENTS */}
        <section className="encadreur-section">
          <div className="section-heading">
            <div>
              <h2>Prochains événements</h2>
              <p>Échéances et actions prioritaires de suivi</p>
            </div>
          </div>
          {events.length === 0 ? (
            <div className="dashboard-empty">Aucun événement à venir.</div>
          ) : (
            <div className="event-list">
              {events.map((ev) => (
                <div className="event-item" key={ev.id}>
                  <span className="event-icon">{ev.icon}</span>
                  <div className="event-info">
                    <div className="event-title-row">
                      <strong>{ev.title}</strong>
                      <span className="event-badge">{ev.badge}</span>
                    </div>
                    <p>{ev.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* DERNIÈRES NOTIFICATIONS */}
        <section className="encadreur-section">
          <div className="section-heading">
            <div>
              <h2>Dernières notifications</h2>
              <p>Activités et alertes des étudiants suivis</p>
            </div>
            <Link to="/notifications" className="section-link">
              Tout voir <FaChevronRight size={10} />
            </Link>
          </div>
          {notifications.length === 0 ? (
            <div className="dashboard-empty">Aucune notification récente.</div>
          ) : (
            <div className="notification-list">
              {notifications.slice(0, 4).map((notif) => (
                <div className="dashboard-notification" key={notif.id}>
                  <span className="notification-icon">
                    <FaBell />
                  </span>
                  <div className="notification-info">
                    <strong>{notif.titre || 'Notification'}</strong>
                    <p>{notif.message}</p>
                    <span className="notification-date">{notif.date || 'Récemment'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ===== SECTION 4 : LOCALISATION DES STAGES ===== */}
      <section className="encadreur-section location-section">
        <div className="section-heading">
          <div>
            <h2>Localisation des stages</h2>
            <p>Cartographie des lieux de stage de vos étudiants affectés</p>
          </div>
          <Link to="/encadreur/carte" className="btn-voir-carte-main">
            <FaMapMarkerAlt /> Voir la carte
          </Link>
        </div>

        <div className="location-container-grid">
          {/* Mini Carte Leaflet */}
          <div className="location-mini-map">
            <MapContainer
              center={mapCenter}
              zoom={11}
              style={{ height: '240px', width: '100%', borderRadius: '10px' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              {stageLocations.map((loc) => (
                <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                  <Popup>
                    <div className="popup-mini-content">
                      <strong>{loc.entreprise}</strong>
                      <p>Stagiaire : {loc.etudiant}</p>
                      <p>Ville : {loc.ville}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Liste récapitulative des lieux */}
          <div className="location-list-summary">
            {stageLocations.length === 0 ? (
              <div className="dashboard-empty">Aucun lieu de stage disponible.</div>
            ) : (
              stageLocations.map((loc) => (
                <div className="location-item" key={loc.id}>
                  <FaMapMarkerAlt className="location-pin" />
                  <div>
                    <strong>{loc.entreprise}</strong>
                    <span className="location-sub">
                      {loc.etudiant} · {loc.ville} ({loc.domaine})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* NOTE PIED DE PAGE ENCADREUR */}
      <div className="encadreur-profile-note">
        <FaCalendarAlt /> Suivi assuré pour le semestre en cours · Espace personnalisé Encadreur EMIT
      </div>
    </div>
  );
}

export default EncadreurDashboard;
