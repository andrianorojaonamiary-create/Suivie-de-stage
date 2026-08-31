import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaUserGraduate, FaEnvelope, FaFileAlt, FaStar,
   FaBriefcase, FaInfoCircle,
  FaFilePdf, FaDownload, FaEye, FaUserTie
} from 'react-icons/fa';

function EncadreurStudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
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
          nom: 'Ramanantsoa Tojo',
          prenom: 'Tojo',
          matricule: 'ETU-2024-0423',
          email: 'tojo.ramanantsoa@emit.mg',
          telephone: '+261 34 12 345 03',
          filiere: 'Sécurité Info.',
          niveau: 'Master 1',
          ville: 'Antananarivo',
          stage: {
            id: 2,
            titre: "Migration et sécurisation du système d'information",
            entreprise: 'BNI Madagascar',
            statut: 'En attente',
            dateDebut: '2024-05-01',
            dateFin: '2024-11-01',
            progression: 15,
            description: "Migration du système d'information vers une architecture sécurisée."
          },
          evaluation: 'À faire',
          rapports: 0,
          encadreur: 'M. Rakotomalala',
          tuteur: 'Prof. Andrianivo'
        },
        3: {
          id: 3,
          nom: 'Razafindramary Fy',
          prenom: 'Fy',
          matricule: 'ETU-2024-0427',
          email: 'fy.razafindramary@emit.mg',
          telephone: '+261 34 12 345 07',
          filiere: 'Génie Logiciel',
          niveau: 'Master 2',
          ville: 'Antananarivo',
          stage: {
            id: 3,
            titre: "Application de gestion des rendez-vous",
            entreprise: 'Santé Plus',
            statut: 'En cours',
            dateDebut: '2024-08-01',
            dateFin: '2025-01-15',
            progression: 5,
            description: "Application mobile de gestion des rendez-vous médicaux avec React Native."
          },
          evaluation: 'À faire',
          rapports: 0,
          encadreur: 'M. Rakotomalala',
          tuteur: 'Prof. Andrianivo'
        },
        4: {
          id: 4,
          nom: 'Rajaonarivelo Ando',
          prenom: 'Ando',
          matricule: 'ETU-2024-0426',
          email: 'ando.rajaonarivelo@emit.mg',
          telephone: '+261 34 12 345 06',
          filiere: 'Réseaux',
          niveau: 'Licence 1',
          ville: 'Antananarivo',
          stage: {
            id: 4,
            titre: "Système de gestion de stock",
            entreprise: 'DistriTech',
            statut: 'Refusé',
            dateDebut: '2024-07-01',
            dateFin: '2024-12-31',
            progression: 20,
            description: "Développement d'un système de gestion de stock pour entreprise de distribution."
          },
          evaluation: 'À corriger',
          rapports: 1,
          encadreur: 'M. Rakotomalala',
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

  const evaluations = [
    { id: 1, type: 'Maître de stage', date: '15 Mai 2024', statut: 'Validé', note: '16.5', commentaire: 'Bon travail, étudiant sérieux' },
    { id: 2, type: 'Entreprise', date: '20 Mai 2024', statut: 'À faire', note: null, commentaire: null }
  ];

  const rapports = [
    { id: 1, titre: 'Rapport de prise en main', fileName: 'rapport_prise_en_main.pdf', date: '20 Mar 2024', statut: 'Validé', size: '1.2 MB' },
    { id: 2, titre: 'Rapport intermédiaire', fileName: 'rapport_intermediaire.pdf', date: '15 Mai 2024', statut: 'En révision', size: '2.4 MB' }
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
        <button className="btn-back-detail" onClick={() => navigate('/encadreur/etudiants')}>
          <FaArrowLeft /> Retour
        </button>
      </div>
    );
  }

  return (
    <div className="encadreur-student-detail">
      <div className="page-header">
        <div>
          <button className="btn-back-header" onClick={() => navigate('/encadreur/etudiants')}>
            <FaArrowLeft /> Retour
          </button>
          <h1><FaUserGraduate /> {student.nom}</h1>
          <p className="text-muted">{student.matricule} · {student.filiere} · {student.niveau}</p>
        </div>
      </div>

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

      <div className="detail-content">
        {activeTab === 'info' && (
          <div className="detail-info-grid">
            <div className="info-card">
              <div className="info-card-header"><FaUserGraduate /> Identité</div>
              <div className="info-card-body">
                <div className="info-row"><span className="info-label">Nom complet</span><span className="info-value"><strong>{student.nom}</strong></span></div>
                <div className="info-row"><span className="info-label">Matricule</span><span className="info-value">{student.matricule}</span></div>
                <div className="info-row"><span className="info-label">Filière</span><span className="info-value">{student.filiere}</span></div>
                <div className="info-row"><span className="info-label">Niveau</span><span className="info-value">{student.niveau}</span></div>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-header"><FaEnvelope /> Contact</div>
              <div className="info-card-body">
                <div className="info-row"><span className="info-label">Email</span><span className="info-value">{student.email}</span></div>
                <div className="info-row"><span className="info-label">Téléphone</span><span className="info-value">{student.telephone || 'Non renseigné'}</span></div>
                <div className="info-row"><span className="info-label">Ville</span><span className="info-value">{student.ville || 'Non renseignée'}</span></div>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-header"><FaUserTie /> Encadrement</div>
              <div className="info-card-body">
                <div className="info-row"><span className="info-label">Encadreur</span><span className="info-value">{student.encadreur || 'Non renseigné'}</span></div>
                <div className="info-row"><span className="info-label">Tuteur pédagogique</span><span className="info-value">{student.tuteur || 'Non renseigné'}</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stage' && (
          <div className="detail-stage">
            <div className="info-card full-width">
              <div className="info-card-header"><FaBriefcase /> Détails du stage</div>
              <div className="info-card-body">
                <div className="info-row"><span className="info-label">Titre</span><span className="info-value"><strong>{student.stage.titre}</strong></span></div>
                <div className="info-row"><span className="info-label">Entreprise</span><span className="info-value">{student.stage.entreprise}</span></div>
                <div className="info-row"><span className="info-label">Période</span><span className="info-value">{formatDate(student.stage.dateDebut)} → {formatDate(student.stage.dateFin)}</span></div>
                <div className="info-row"><span className="info-label">Progression</span><span className="info-value"><div className="progress-bar"><div className="progress-fill" style={{ width: `${student.stage.progression}%` }} /></div><span className="progress-text">{student.stage.progression}%</span></span></div>
                <div className="info-row"><span className="info-label">Statut</span><span className="info-value">{getStatusBadge(student.stage.statut)}</span></div>
                <div className="info-row"><span className="info-label">Description</span><span className="info-value description-text">{student.stage.description || 'Non renseignée'}</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div className="detail-evaluations">
            <div className="info-card full-width">
              <div className="info-card-header"><FaStar /> Évaluations</div>
              <div className="info-card-body">
                {evaluations.length === 0 ? (
                  <p className="detail-empty">Aucune évaluation disponible</p>
                ) : (
                  evaluations.map((evalItem) => (
                    <div key={evalItem.id} className="eval-item">
                      <div className="eval-item-header">
                        <span className="eval-type">{evalItem.type}</span>
                        <span className="eval-date">{evalItem.date}</span>
                        <span className={`badge ${evalItem.statut === 'Validé' ? 'badge-valide' : 'badge-en-attente'}`}>{evalItem.statut}</span>
                      </div>
                      <div className="eval-item-body">
                        <div className="eval-note">
                          <span className="eval-note-label">Note</span>
                          <span className="eval-note-value">{evalItem.note || '—'}</span>
                          {evalItem.note && <span className="eval-stars">{'★'.repeat(Math.round(evalItem.note / 4))}{'☆'.repeat(5 - Math.round(evalItem.note / 4))}</span>}
                        </div>
                        {evalItem.commentaire && (
                          <div className="eval-comment">
                            <span className="eval-comment-label">Commentaire</span>
                            <p>{evalItem.commentaire}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rapports' && (
          <div className="detail-rapports">
            <div className="info-card full-width">
              <div className="info-card-header"><FaFileAlt /> Rapports</div>
              <div className="info-card-body">
                {rapports.length === 0 ? (
                  <p className="detail-empty">Aucun rapport disponible</p>
                ) : (
                  rapports.map((rapport) => (
                    <div key={rapport.id} className="rapport-item">
                      <div className="rapport-item-left">
                        <div className="rapport-icon">{rapport.fileName ? <FaFilePdf style={{ color: '#E74C3C' }} /> : <FaFileAlt style={{ color: '#A0B8D0' }} />}</div>
                        <div className="rapport-info">
                          <span className="rapport-title">{rapport.titre}</span>
                          <span className="rapport-meta">{rapport.fileName || 'Fichier non déposé'} · {rapport.size}</span>
                        </div>
                      </div>
                      <div className="rapport-item-right">
                        <span className="rapport-date">{rapport.date}</span>
                        <span className={`badge ${rapport.statut === 'Validé' ? 'badge-valide' : rapport.statut === 'En révision' ? 'badge-en-cours' : 'badge-en-attente'}`}>{rapport.statut}</span>
                        {rapport.fileName && (
                          <div className="rapport-actions">
                            <button className="btn-action-icon" title="Voir"><FaEye /></button>
                            <button className="btn-action-icon" title="Télécharger"><FaDownload /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EncadreurStudentDetail;