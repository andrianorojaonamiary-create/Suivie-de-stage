import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaFileAlt, FaStar, FaInfoCircle,
  FaFilePdf, FaDownload, FaEye, FaCheck, FaTimes
} from 'react-icons/fa';
import { studentsApi } from '../../api';

function EnseignantStudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [rapports, setRapports] = useState([]);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const data = await studentsApi.getById(studentId);
        setStudent({
          id: data.id,
          nom: `${data.user?.prenom || ''} ${data.user?.nom || ''}`.trim() || 'Étudiant',
          matricule: data.matricule || '—',
          filiere: data.formation || 'Non renseigné',
          niveau: data.niveau || 'Non renseigné',
          email: data.user?.email || '—',
          telephone: data.telephone || '—',
          adresse: data.adresse || 'Non renseignée',
          statut: data.statutAcademique || 'ACTIF',
        });
      } catch (err) {
        console.error('Erreur chargement étudiant:', err);
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchStudent();
  }, [studentId]);

  const handleValiderRapport = (id) => {
    setRapports(prev => prev.map(r => r.id === id ? { ...r, statut: 'Validé' } : r));
  };

  const handleRefuserRapport = (id) => {
    setRapports(prev => prev.map(r => r.id === id ? { ...r, statut: 'À corriger' } : r));
  };

  const evaluations = [];

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
        <button className="btn-back-detail" onClick={() => navigate('/enseignant/etudiants')}>
          <FaArrowLeft /> Retour
        </button>
      </div>
    );
  }

  return (
    <div className="student-detail-page">
      <button className="btn-back-header" onClick={() => navigate('/enseignant/etudiants')}>
        <FaArrowLeft /> Retour à la liste
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
              <span className="info-field-label">Adresse</span>
              <span className="info-field-box">{student.adresse || 'Non renseignée'}</span>
            </div>
            <div className="info-field">
              <span className="info-field-label">Statut académique</span>
              <span className="info-field-box">{student.statut}</span>
            </div>
            <div className="info-field info-field-full">
              <span className="info-field-label">Formation</span>
              <span className="info-field-box">{student.filiere}</span>
            </div>
            <div className="info-field info-field-full">
              <span className="info-field-label">Informations de stage</span>
              <span className="info-field-box info-field-desc">Les informations du stage ne sont pas disponibles via cette vue.</span>
            </div>
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div className="eval-table-wrap">
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

export default EnseignantStudentDetail;
