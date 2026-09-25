import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaFileAlt, FaStar, FaInfoCircle,
  FaFilePdf, FaDownload, FaEye, FaCheck, FaTimes
} from 'react-icons/fa';

function EncadreurStudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [rapports, setRapports] = useState([
    { id: 1, titre: 'Rapport de prise en main', fileName: 'rapport_prise_en_main.pdf', date: '20 Mar 2024', statut: 'Validé', size: '1.2 MB' },
    { id: 2, titre: 'Rapport intermédiaire', fileName: 'rapport_intermediaire.pdf', date: '15 Mai 2024', statut: 'En révision', size: '2.4 MB' }
  ]);

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

  const handleValiderRapport = (id) => {
    setRapports(prev => prev.map(r => r.id === id ? { ...r, statut: 'Validé' } : r));
  };

  const handleRefuserRapport = (id) => {
    setRapports(prev => prev.map(r => r.id === id ? { ...r, statut: 'À corriger' } : r));
  };

  const evaluations = [
    { id: 1, type: 'Encadreur', date: '15 Mai 2024', statut: 'Validé', note: '16.5', commentaire: 'Bon travail, étudiant sérieux' },
    { id: 2, type: 'Enseignant', date: '20 Mai 2024', statut: 'À faire', note: null, commentaire: null }
  ];

  const tabs = [
    { id: 'info', label: 'Informations', icon: <FaInfoCircle /> },
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
        <button className="btn-back-detail" onClick={() => navigate('/encadreur/etudiants')}>
          <FaArrowLeft /> Retour
        </button>
      </div>
    );
  }

  return (
    <div className="encadreur-student-detail">
      <button className="btn-back-header" onClick={() => navigate('/encadreur/etudiants')}>
        <FaArrowLeft /> Retour
      </button>

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
          <div className="info-fields-grid">
            <div className="info-field info-field-full">
              <span className="info-field-label">Nom</span>
              <span className="info-field-box">{student.nom}</span>
            </div>
            <div className="info-field">
              <span className="info-field-label">Matricule</span>
              <span className="info-field-box">{student.matricule}</span>
            </div>
            <div className="info-field">
              <span className="info-field-label">Filière</span>
              <span className="info-field-box">{student.filiere}</span>
            </div>
            <div className="info-field">
              <span className="info-field-label">Niveau</span>
              <span className="info-field-box">{student.niveau}</span>
            </div>
            <div className="info-field">
              <span className="info-field-label">Email</span>
              <span className="info-field-box">{student.email}</span>
            </div>
            <div className="info-field">
              <span className="info-field-label">Téléphone</span>
              <span className="info-field-box">{student.telephone || 'Non renseigné'}</span>
            </div>
            <div className="info-field">
              <span className="info-field-label">Ville</span>
              <span className="info-field-box">{student.ville || 'Non renseignée'}</span>
            </div>
            <div className="info-field">
              <span className="info-field-label">Tuteur pédagogique</span>
              <span className="info-field-box">{student.tuteur || 'Non renseigné'}</span>
            </div>
            <div className="info-field-divider" />
            <div className="info-field info-field-full">
              <span className="info-field-label">Stage</span>
              <span className="info-field-box"><strong>{student.stage.titre}</strong></span>
            </div>
            <div className="info-field">
              <span className="info-field-label">Entreprise</span>
              <span className="info-field-box">{student.stage.entreprise}</span>
            </div>
            <div className="info-field">
              <span className="info-field-label">Période</span>
              <span className="info-field-box">{formatDate(student.stage.dateDebut)} → {formatDate(student.stage.dateFin)}</span>
            </div>
            <div className="info-field">
              <span className="info-field-label">Progression</span>
              <span className="info-field-box">
                <div className="inline-progress">
                  <div className="inline-progress-bar">
                    <div className="inline-progress-fill" style={{ width: `${student.stage.progression}%` }} />
                  </div>
                  <span>{student.stage.progression}%</span>
                </div>
              </span>
            </div>
            <div className="info-field">
              <span className="info-field-label">Statut</span>
              <span className="info-field-box">{getStatusBadge(student.stage.statut)}</span>
            </div>
            <div className="info-field info-field-full">
              <span className="info-field-label">Description</span>
              <span className="info-field-box info-field-desc">{student.stage.description || 'Non renseignée'}</span>
            </div>
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div className="eval-table-wrap">
            {evaluations.length === 0 ? (
              <p className="detail-empty">Aucune évaluation disponible</p>
            ) : (
              <table className="eval-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Note</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((evalItem) => (
                    <tr key={evalItem.id}>
                      <td className="eval-table-type" data-label="Type">{evalItem.type}</td>
                      <td data-label="Note">
                        {evalItem.note ? (
                          <span className="eval-table-note">
                            {evalItem.note} / 20
                          </span>
                        ) : (
                          <span className="eval-table-empty">—</span>
                        )}
                      </td>
                      <td className="eval-table-date" data-label="Date">{evalItem.date}</td>
                      <td data-label="Statut">
                        <span className={`badge ${evalItem.statut === 'Validé' ? 'badge-valide' : evalItem.statut === 'À corriger' ? 'badge-refuse' : 'badge-en-attente'}`}>
                          {evalItem.statut}
                        </span>
                      </td>
                      <td className="eval-table-comment" data-label="Commentaire">
                        {evalItem.commentaire || <span className="eval-table-empty">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'rapports' && (
          <div className="detail-rapports">
            {rapports.length === 0 ? (
              <p className="detail-empty">Aucun rapport disponible</p>
            ) : (
              <div className="rapport-list">
                {rapports.map((rapport) => (
                  <div key={rapport.id} className="report-card">
                    <div className="report-col-file">
                      <div
                        className="report-icon-wrapper"
                        style={{
                          backgroundColor:
                            rapport.statut === 'Validé' ? '#D1FAE5' :
                            rapport.statut === 'En révision' ? '#E1ECFE' :
                            rapport.statut === 'À corriger' ? '#FEE2E2' : '#F8FAFC'
                        }}
                      >
                        {rapport.fileName ? <FaFilePdf style={{ color: '#E74C3C' }} /> : <FaFileAlt style={{ color: '#A0B8D0' }} />}
                      </div>
                      <div className="report-info">
                        <span className="report-title">{rapport.titre}</span>
                        {rapport.fileName && <span className="report-filename">{rapport.fileName}</span>}
                        <span className="report-meta">{rapport.size}</span>
                      </div>
                    </div>
                    <div className="report-col-date">
                      <span className="report-date">{rapport.date}</span>
                    </div>
                    <div className="report-col-status">
                      <span className={`badge ${rapport.statut === 'Validé' ? 'badge-valide' : rapport.statut === 'En révision' ? 'badge-en-cours' : rapport.statut === 'À corriger' ? 'badge-refuse' : 'badge-en-attente'}`}>{rapport.statut}</span>
                      {rapport.commentaire && <span className="report-comment">{rapport.commentaire}</span>}
                    </div>
                    <div className="report-col-actions">
                      {rapport.fileName && (
                        <>
                          <button className="btn-action-icon" title="Voir"><FaEye /></button>
                          <button className="btn-action-icon" title="Télécharger"><FaDownload /></button>
                          {rapport.statut !== 'Validé' && (
                            <>
                              <button className="btn-action-icon" title="Valider" onClick={() => handleValiderRapport(rapport.id)}><FaCheck /></button>
                              <button className="btn-action-icon" title="Refuser" onClick={() => handleRefuserRapport(rapport.id)}><FaTimes /></button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EncadreurStudentDetail;
