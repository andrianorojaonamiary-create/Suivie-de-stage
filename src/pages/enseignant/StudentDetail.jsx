import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaUserGraduate, FaEnvelope,  
  FaFileAlt, FaStar, FaBriefcase, FaInfoCircle,
  FaFilePdf,FaDownload, FaEye, FaUserTie
} from 'react-icons/fa';

function EnseignantStudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    // Simulation de chargement des données
    setTimeout(() => {
      const students = {
        1: {
          id: 1,
          nom: 'Rakoto Miora',
          prenom: 'Miora',
          matricule: 'ETU-2024-0421',
          email: 'miora.rakoto@emit.mg',
          telephone: '+261 34 12 345 01',
          filiere: 'Génie Logiciel',
          niveau: 'Master 2',
          ville: 'Antananarivo',
          stage: {
            id: 1,
            titre: "Développement d'une plateforme web de gestion RH",
            entreprise: 'TechMada SARL',
            statut: 'En cours',
            dateDebut: '2024-03-01',
            dateFin: '2024-09-15',
            progression: 65,
            description: "Développement d'une plateforme web de gestion des ressources humaines avec React et Node.js."
          },
          evaluation: 'Validé',
          rapports: 2,
          encadreur: 'M. Rakotomalala',
          tuteur: 'Prof. Andrianivo'
        },
        2: {
          id: 2,
          nom: 'Rakotondrabe Hery',
          prenom: 'Hery',
          matricule: 'ETU-2024-0422',
          email: 'hery.rakotondrabe@emit.mg',
          telephone: '+261 34 12 345 02',
          filiere: 'Réseaux',
          niveau: 'Licence 3',
          ville: 'Antananarivo',
          stage: {
            id: 2,
            titre: "Application mobile de gestion des comptes",
            entreprise: 'Airtel Madagascar',
            statut: 'En attente',
            dateDebut: '2024-04-01',
            dateFin: '2024-10-01',
            progression: 30,
            description: "Développement d'une application mobile de gestion des comptes clients sous Android."
          },
          evaluation: 'À faire',
          rapports: 1,
          encadreur: 'Mme. Ralava',
          tuteur: 'Dr. Ranaivo'
        }
      };

      setStudent(students[studentId] || null);
      setLoading(false);
    }, 500);
  }, [studentId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'En cours': { className: 'status-badge status-en-cours', label: 'En cours' },
      'En attente': { className: 'status-badge status-en-attente', label: 'En attente' },
      'Terminé': { className: 'status-badge status-termine', label: 'Terminé' },
      'Validé': { className: 'status-badge status-valide', label: 'Validé' },
      'Refusé': { className: 'status-badge status-refuse', label: 'Refusé' }
    };
    const badge = badges[statut] || badges['En attente'];
    return <span className={badge.className}>{badge.label}</span>;
  };

  const getEvalBadge = (evalStatus) => {
    const badges = {
      'Validé': { className: 'eval-badge eval-valide', label: 'Validé' },
      'À faire': { className: 'eval-badge eval-a-faire', label: 'À faire' },
      'À corriger': { className: 'eval-badge eval-corriger', label: 'À corriger' }
    };
    const badge = badges[evalStatus] || badges['À faire'];
    return <span className={badge.className}>{badge.label}</span>;
  };

  const tabs = [
    { id: 'info', label: 'Informations', icon: <FaInfoCircle /> },
    { id: 'stage', label: 'Stage', icon: <FaBriefcase /> },
    { id: 'evaluations', label: 'Évaluations', icon: <FaStar /> },
    { id: 'rapports', label: 'Rapports', icon: <FaFileAlt /> }
  ];

  if (loading) {
    return (
      <div className="student-detail-loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-detail-notfound">
        <FaInfoCircle className="notfound-icon" />
        <h2>Étudiant non trouvé</h2>
        <p>L'étudiant que vous recherchez n'existe pas.</p>
        <button className="btn-back-detail" onClick={() => navigate('/enseignant/etudiants')}>
          <FaArrowLeft /> Retour
        </button>
      </div>
    );
  }

  return (
    <div className="student-detail-page">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <button className="btn-back-header" onClick={() => navigate('/enseignant/etudiants')}>
            <FaArrowLeft /> Retour
          </button>
          <h1><FaUserGraduate /> {student.nom}</h1>
          <p className="text-muted">{student.matricule} · {student.filiere} · {student.niveau}</p>
        </div>
      </div>

      {/* ===== STATUT ===== */}
      <div className="student-detail-status">
        <div className="status-item">
          <span className="status-label">Stage</span>
          {getStatusBadge(student.stage.statut)}
        </div>
        <div className="status-item">
          <span className="status-label">Évaluation</span>
          {getEvalBadge(student.evaluation)}
        </div>
        <div className="status-item">
          <span className="status-label">Progression</span>
          <span className="progress-text">{student.stage.progression}%</span>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="detail-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`detail-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ===== CONTENU ===== */}
      <div className="detail-content">
        {/* ===== TAB INFORMATIONS ===== */}
        {activeTab === 'info' && (
          <div className="detail-info-grid">
            <div className="info-card">
              <div className="info-card-header"><FaUserGraduate /> Identité</div>
              <div className="info-card-body">
                <div className="info-row">
                  <span className="info-label">Nom complet</span>
                  <span className="info-value"><strong>{student.nom}</strong></span>
                </div>
                <div className="info-row">
                  <span className="info-label">Matricule</span>
                  <span className="info-value">{student.matricule}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Filière</span>
                  <span className="info-value">{student.filiere}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Niveau</span>
                  <span className="info-value">{student.niveau}</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header"><FaEnvelope /> Contact</div>
              <div className="info-card-body">
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{student.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Téléphone</span>
                  <span className="info-value">{student.telephone || 'Non renseigné'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Ville</span>
                  <span className="info-value">{student.ville || 'Non renseignée'}</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header"><FaUserTie /> Encadrement</div>
              <div className="info-card-body">
                <div className="info-row">
                  <span className="info-label">Encadreur</span>
                  <span className="info-value">{student.encadreur || 'Non renseigné'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Tuteur pédagogique</span>
                  <span className="info-value">{student.tuteur || 'Non renseigné'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB STAGE ===== */}
        {activeTab === 'stage' && (
          <div className="detail-stage">
            <div className="info-card full-width">
              <div className="info-card-header"><FaBriefcase /> Détails du stage</div>
              <div className="info-card-body">
                <div className="info-row">
                  <span className="info-label">Titre</span>
                  <span className="info-value"><strong>{student.stage.titre}</strong></span>
                </div>
                <div className="info-row">
                  <span className="info-label">Entreprise</span>
                  <span className="info-value">{student.stage.entreprise}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Période</span>
                  <span className="info-value">{formatDate(student.stage.dateDebut)} → {formatDate(student.stage.dateFin)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Progression</span>
                  <span className="info-value">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${student.stage.progression}%` }} />
                    </div>
                    <span className="progress-text">{student.stage.progression}%</span>
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Statut</span>
                  <span className="info-value">{getStatusBadge(student.stage.statut)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Description</span>
                  <span className="info-value description-text">{student.stage.description || 'Non renseignée'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB ÉVALUATIONS ===== */}
        {activeTab === 'evaluations' && (
          <div className="detail-evaluations">
            <div className="info-card full-width">
              <div className="info-card-header"><FaStar /> Évaluations</div>
              <div className="info-card-body">
                <div className="eval-list">
                  <div className="eval-item">
                    <div className="eval-item-header">
                      <span className="eval-type">Tuteur pédagogique</span>
                      <span className="eval-date">15 Mai 2024</span>
                      <span className="badge badge-valide">Validé</span>
                    </div>
                    <div className="eval-item-body">
                      <div className="eval-note">
                        <span className="eval-note-label">Note</span>
                        <span className="eval-note-value">16.5 / 20</span>
                        <span className="eval-stars">★★★★☆</span>
                      </div>
                      <div className="eval-comment">
                        <span className="eval-comment-label">Commentaire</span>
                        <p>Bon travail, étudiant sérieux et impliqué.</p>
                      </div>
                    </div>
                  </div>

                  <div className="eval-item">
                    <div className="eval-item-header">
                      <span className="eval-type">Maître de stage</span>
                      <span className="eval-date">20 Mai 2024</span>
                      <span className="badge badge-valide">Validé</span>
                    </div>
                    <div className="eval-item-body">
                      <div className="eval-note">
                        <span className="eval-note-label">Note</span>
                        <span className="eval-note-value">17.0 / 20</span>
                        <span className="eval-stars">★★★★☆</span>
                      </div>
                      <div className="eval-comment">
                        <span className="eval-comment-label">Commentaire</span>
                        <p>Très impliqué dans les projets.</p>
                      </div>
                    </div>
                  </div>

                  <div className="eval-item">
                    <div className="eval-item-header">
                      <span className="eval-type">Entreprise</span>
                      <span className="eval-date">25 Mai 2024</span>
                      <span className="badge badge-en-attente">À faire</span>
                    </div>
                    <div className="eval-item-body">
                      <div className="eval-note">
                        <span className="eval-note-label">Note</span>
                        <span className="eval-note-value">—</span>
                      </div>
                      <div className="eval-comment">
                        <span className="eval-comment-label">Commentaire</span>
                        <p>En attente d'évaluation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB RAPPORTS ===== */}
        {activeTab === 'rapports' && (
          <div className="detail-rapports">
            <div className="info-card full-width">
              <div className="info-card-header"><FaFileAlt /> Rapports</div>
              <div className="info-card-body">
                <div className="rapport-list">
                  <div className="rapport-item">
                    <div className="rapport-item-left">
                      <div className="rapport-icon"><FaFilePdf style={{ color: '#E74C3C' }} /></div>
                      <div className="rapport-info">
                        <span className="rapport-title">Rapport de prise en main</span>
                        <span className="rapport-meta">rapport_prise_en_main.pdf · 1.2 MB</span>
                      </div>
                    </div>
                    <div className="rapport-item-right">
                      <span className="rapport-date">20 Mar 2024</span>
                      <span className="badge badge-valide">Validé</span>
                      <div className="rapport-actions">
                        <button className="btn-action-icon" title="Voir"><FaEye /></button>
                        <button className="btn-action-icon" title="Télécharger"><FaDownload /></button>
                      </div>
                    </div>
                  </div>

                  <div className="rapport-item">
                    <div className="rapport-item-left">
                      <div className="rapport-icon"><FaFilePdf style={{ color: '#E74C3C' }} /></div>
                      <div className="rapport-info">
                        <span className="rapport-title">Rapport intermédiaire</span>
                        <span className="rapport-meta">rapport_intermediaire.pdf · 2.4 MB</span>
                      </div>
                    </div>
                    <div className="rapport-item-right">
                      <span className="rapport-date">15 Mai 2024</span>
                      <span className="badge badge-en-cours">En révision</span>
                      <div className="rapport-actions">
                        <button className="btn-action-icon" title="Voir"><FaEye /></button>
                        <button className="btn-action-icon" title="Télécharger"><FaDownload /></button>
                      </div>
                    </div>
                  </div>

                  <div className="rapport-item">
                    <div className="rapport-item-left">
                      <div className="rapport-icon"><FaFileAlt style={{ color: '#A0B8D0' }} /></div>
                      <div className="rapport-info">
                        <span className="rapport-title">Rapport final</span>
                        <span className="rapport-meta">Fichier non déposé · —</span>
                      </div>
                    </div>
                    <div className="rapport-item-right">
                      <span className="rapport-date">—</span>
                      <span className="badge badge-en-attente">À déposer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnseignantStudentDetail;