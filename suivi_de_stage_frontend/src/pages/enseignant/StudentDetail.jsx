import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaFileAlt, FaStar, FaInfoCircle,
  FaFilePdf, FaDownload, FaEye, FaCheck, FaTimes
} from 'react-icons/fa';
import { studentsApi, internshipsApi, reportsApi, evaluationsApi } from '../../api';
import { toast } from 'react-toastify';
import {
  mapReportType,
  mapReportStatus,
  formatReportSize,
  formatReportDate,
} from '../../utils/reportMapping';
import mapInternship from '../../utils/internshipMapping';

function EnseignantStudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [rapports, setRapports] = useState([]);
  const [stage, setStage] = useState(null);
  const [evaluations, setEvaluations] = useState([]);

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

  useEffect(() => {
    if (!studentId) return;
    const fetchStage = async () => {
      try {
        const res = await internshipsApi.getAll({ limit: 100 });
        const items = res?.data || (Array.isArray(res) ? res : []);
        const owned = items.filter((s) => String(s.student?.id) === String(studentId));
        if (owned.length === 0) return;
        const raw =
          owned.find((s) => s.statut === 'EN_COURS') ||
          owned.find((s) => s.statut === 'TERMINE') ||
          owned.find((s) => s.statut === 'A_VENIR') ||
          owned[0];
        const mapped = mapInternship(raw);
        setStage(mapped);
        const evalRes = await evaluationsApi.getByInternship(mapped.id).catch(() => ({ data: [] }));
        const list = evalRes?.data || (Array.isArray(evalRes) ? evalRes : []);
        setEvaluations(
          list.map((e) => ({
            id: e.id,
            type: 'Encadreur',
            note: e.note,
            date: e.dateEvaluation
              ? new Date(e.dateEvaluation).toLocaleDateString('fr-FR')
              : '—',
            statut: 'Évalué',
            commentaire: e.commentaire || '',
          })),
        );
      } catch (err) {
        console.error('Erreur chargement stage étudiant:', err);
      }
    };
    fetchStage();
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    const fetchRapports = async () => {
      try {
        const res = await reportsApi.getAll({ limit: 100 });
        const items = Array.isArray(res) ? res : res?.items || [];
        const filtered = items
          .filter((r) => String(r.stage?.etudiantId) === String(studentId))
          .map((r) => ({
            id: r.id,
            titre: mapReportType(r.type),
            fileName: r.originalName || r.fileName,
            size: formatReportSize(r.size),
            date: formatReportDate(r.dateCreation),
            statut: mapReportStatus(r.statut),
            commentaire: r.commentaire || '',
            raison: r.commentaire || '',
          }));
        setRapports(filtered);
      } catch (err) {
        console.error('Erreur chargement rapports étudiant:', err);
      }
    };
    fetchRapports();
  }, [studentId]);

  const handleValiderRapport = async (id) => {
    try {
      await reportsApi.updateStatus(id, { statut: 'APPROUVE' });
      setRapports(prev => prev.map(r => r.id === id ? { ...r, statut: 'Validé' } : r));
      toast.success('Rapport validé avec succès !');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Erreur lors de la validation';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const handleRefuserRapport = async (id) => {
    try {
      await reportsApi.updateStatus(id, { statut: 'REJETE' });
      setRapports(prev => prev.map(r => r.id === id ? { ...r, statut: 'Refusé' } : r));
      toast.success('Rapport refusé');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Erreur lors du refus';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const handleViewFile = async (rapport) => {
    if (!rapport?.id) return;
    const ext = (rapport.fileName || '').split('.').pop()?.toLowerCase();
    if (ext !== 'pdf') {
      handleDownloadFile(rapport);
      toast.info("Ce type de fichier (DOC/DOCX) ne peut pas s'afficher dans le navigateur. Téléchargement lancé.");
      return;
    }
    const win = window.open('', '_blank');
    try {
      const blob = await reportsApi.download(rapport.id);
      const url = URL.createObjectURL(blob);
      if (win) {
        win.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Erreur:', err);
      if (win) win.close();
      toast.error("Erreur lors de l'ouverture du fichier");
    }
  };

  const handleDownloadFile = async (rapport) => {
    if (!rapport?.id) return;
    try {
      const blob = await reportsApi.download(rapport.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = rapport.fileName || rapport.titre || 'rapport';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fr-FR');
  };

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
              <span className="info-field-label">Nom complet</span>
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
              <span className="info-field-label">Informations de stage</span>
              {stage ? (
                <span className="info-field-box info-field-desc">
                  {stage.intitule}
                  {(stage.entreprise || stage.lieu) && (
                    <span className="info-field-sub">
                      {[stage.entreprise, stage.lieu].filter(Boolean).join(' · ')}
                      {stage.encadreur && ` · Encadreur : ${stage.encadreur}`}
                    </span>
                  )}
                  <span className="info-field-sub">
                    Période : {formatDate(stage.dateDebut)} → {formatDate(stage.dateFin)} · Statut : {stage.statut} · Progression : {stage.progression}%
                  </span>
                </span>
              ) : (
                <span className="info-field-box info-field-desc">Aucun stage enregistré</span>
              )}
            </div>
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div className="eval-table-wrap">
            {evaluations.length === 0 ? (
              <div className="empty-state">
                <FaStar className="empty-icon" />
                <h3>Aucune évaluation</h3>
                <p>Aucune évaluation n'a encore été déposée pour ce stage.</p>
              </div>
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
                        <span className={`badge ${evalItem.statut === 'Évalué' ? 'badge-valide' : evalItem.statut === 'À corriger' ? 'badge-refuse' : 'badge-en-attente'}`}>
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
                          <button className="btn-action-icon" title="Voir" onClick={() => handleViewFile(rapport)}><FaEye /></button>
                          <button className="btn-action-icon" title="Télécharger" onClick={() => handleDownloadFile(rapport)}><FaDownload /></button>
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
