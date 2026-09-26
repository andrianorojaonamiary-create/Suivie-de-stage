import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaFileAlt, FaDownload, FaUpload, FaTrash, 
  FaFilePdf, FaFileWord, FaEye, 
  FaBuilding, FaFilter, FaTimes, FaInfoCircle, FaPlus
} from 'react-icons/fa';
import { internshipsApi, reportsApi } from '../../api';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import {
  mapReportStatus,
  mapReportType,
  REPORT_TYPE_ENUM,
  formatReportSize,
  formatReportDate,
} from '../../utils/reportMapping';

function MesRapports() {
  const [selectedStage, setSelectedStage] = useState('all');
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  
  // ===== ÉTAT DU FORMULAIRE =====
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    stageId: '',
    type: 'Intermédiaire',
    file: null
  });
  const [dragging, setDragging] = useState(false);

  // ===== ÉTAT MODAL CONFIRMATION SUPPRESSION =====
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  // ===== DONNÉES : RAPPORTS PAR STAGE =====
  const [stages, setStages] = useState([]);

  const fetchStagesWithRapports = async () => {
    try {
      const res = await internshipsApi.getAll();
      const list = Array.isArray(res) ? res : res?.data || [];
      const mapped = list.map(item => ({
        id: item.id,
        titre: item.intitule || item.titre || item.title || 'Stage',
        entreprise: item.company?.name || item.companyName || 'Entreprise',
        rapports: (item.reports || item.rapports || []).map((r) => ({
          id: r.id,
          title: mapReportType(r.type),
          fileName: r.originalName || r.fileName || null,
          date: formatReportDate(r.dateCreation || r.submittedAt),
          status: mapReportStatus(r.statut || r.status),
          size: formatReportSize(r.size),
          commentaire: r.commentaire || r.comment || ''
        }))
      }));
      setStages(mapped);
    } catch (err) {
      console.error('Erreur chargement rapports:', err);
    }
  };

  useEffect(() => {
    const run = async () => {
      await fetchStagesWithRapports();
    };
    run();
  }, []);

  // ===== RAPPORTS À DÉPOSER =====
  const pendingReports = stages.flatMap(s => 
    s.rapports
      .filter(r => r.status === 'À déposer' || r.status === 'À venir')
      .map(r => ({ ...r, stageTitre: s.titre, entreprise: s.entreprise, stageId: s.id }))
  );

  // ===== RAPPORTS EXISTANTS =====
  const existingReports = stages.flatMap(s =>
    s.rapports
      .filter(r => r.status !== 'À déposer' && r.status !== 'À venir')
      .map(r => ({ ...r, stageTitre: s.titre, entreprise: s.entreprise }))
  );

  // ===== FILTRES =====
  const filteredReports = selectedStage === 'all' 
    ? existingReports 
    : existingReports.filter(r => r.stageTitre === selectedStage);

  const getStatusBadge = (status) => {
    const classes = {
      'Validé': 'badge-valide',
      'En révision': 'badge-en-cours',
      'À corriger': 'badge-refuse',
      'Refusé': 'badge-refuse',
    };
    return classes[status] || 'badge-en-attente';
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt style={{ color: '#A0B8D0' }} />;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FaFilePdf style={{ color: '#E74C3C' }} />;
      case 'docx':
      case 'doc':
        return <FaFileWord style={{ color: '#6BA9E6' }} />;
      default:
        return <FaFileAlt style={{ color: '#A0B8D0' }} />;
    }
  };

  // ===== GESTION DU FORMULAIRE =====
  const handleOpenForm = () => {
    setShowForm(true);
    setFormData({ stageId: '', type: 'Intermédiaire', file: null });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({ stageId: '', type: 'Intermédiaire', file: null });
    setDragging(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file: file }));
    }
  };

  const handleSubmitReport = async () => {
    if (!formData.stageId) {
      toast.error('Veuillez sélectionner un stage');
      return;
    }
    if (!formData.file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    const selectedStage = stages.find(s => s.id === formData.stageId);
    const typeEnum = REPORT_TYPE_ENUM[formData.type];

    setSubmitting(true);
    try {
      await reportsApi.upload(formData.stageId, formData.file, typeEnum);
      toast.success(`Rapport "${formData.file.name}" déposé avec succès pour ${selectedStage?.titre || 'ce stage'} !`);
      handleCloseForm();
      await fetchStagesWithRapports();
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message ||
        'Erreur lors du dépôt du rapport';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSubmitting(false);
    }
  };

  // ===== ACTIONS =====

  // ===== VOIR - Ouvre le fichier dans un nouvel onglet =====
  const handleVoir = async (report) => {
    if (!report?.id) {
      toast.error('Aucun fichier à visualiser');
      return;
    }
    const ext = (report.fileName || '').split('.').pop()?.toLowerCase();
    if (ext !== 'pdf') {
      handleTelecharger(report);
      toast.info("Ce type de fichier (DOC/DOCX) ne peut pas s'afficher dans le navigateur. Téléchargement lancé.");
      return;
    }
    const win = window.open('', '_blank');
    try {
      const blob = await reportsApi.download(report.id);
      const url = URL.createObjectURL(blob);
      if (win) {
        win.location.href = url;
      } else {
        window.open(url, '_blank');
      }
      toast.info(`Ouverture de "${report.fileName || report.title}"...`);
    } catch (error) {
      toast.error('Erreur lors de l\'ouverture du fichier');
      console.error('Erreur:', error);
      if (win) win.close();
    }
  };

  // ===== TÉLÉCHARGER - Télécharge le fichier =====
  const handleTelecharger = async (report) => {
    if (!report?.id) {
      toast.error('Aucun fichier à télécharger');
      return;
    }
    try {
      const blob = await reportsApi.download(report.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = report.fileName || report.title || 'rapport';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Téléchargement de "${report.fileName || report.title}"...`);
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
      console.error('Erreur:', error);
    }
  };

  // ===== SUPPRIMER =====
  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete?.id) {
      toast.error('Impossible de supprimer ce rapport');
      return;
    }
    try {
      await reportsApi.remove(reportToDelete.id);
      toast.success(`Rapport "${reportToDelete?.title}" supprimé !`);
      setShowDeleteModal(false);
      setReportToDelete(null);
      await fetchStagesWithRapports();
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message ||
        'Erreur lors de la suppression';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setReportToDelete(null);
  };

  // ===== FILTRES PAR STAGE =====
  const stageOptions = ['all', ...stages.map(s => s.titre)].map(v => ({ value: v, label: v === 'all' ? 'Tous les stages' : v }));

  return (
    <div className="etudiant-rapports">
      {/* ===== PAGE HEADER ===== */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Mes rapports</h1>
          <p className="text-muted">
            {existingReports.filter(r => r.status === 'Validé').length} validé(s) · 
            {existingReports.filter(r => r.status === 'En révision').length} en révision · 
            {pendingReports.length} à déposer
          </p>
        </div>
      </div>

      {/* ===== BARRE D'ACTIONS ET FILTRE (ALIGNÉS EN HAUT À GAUCHE DU TABLEAU) ===== */}
      <div className="reports-top-bar">
        <div className="filter-inline-group">
          <label htmlFor="stage-filter" className="filter-label">
            <FaFilter /> Filtrer par stage :
          </label>
          <SelectPersonnalise
            id="stage-filter"
            value={selectedStage}
            onChange={setSelectedStage}
            options={stageOptions}
            className="filter-select-inline"
          />
        </div>

        <button className="btn-deposer-principal" onClick={handleOpenForm}>
          <FaPlus /> Déposer un rapport
        </button>

        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* ===== FORMULAIRE DE DÉPÔT ===== */}
      {showForm && (
        <div className="deposit-form">
          <div className="deposit-form-header">
            <h4><FaUpload /> Déposer un rapport</h4>
            <button className="deposit-form-close" onClick={handleCloseForm}>
              <FaTimes />
            </button>
          </div>

          <div className="deposit-form-body">
            <div className="form-group">
              <label><FaBuilding /> Stage *</label>
              <SelectPersonnalise
                value={formData.stageId}
                onChange={(v) => handleFormChange({ target: { name: 'stageId', value: v } })}
                placeholder="Sélectionnez un stage"
                className="form-control"
                options={stages.map(stage => ({ value: String(stage.id), label: `${stage.titre} - ${stage.entreprise}` }))}
              />
            </div>

            <div className="form-group">
              <label><FaInfoCircle /> Type de rapport *</label>
              <SelectPersonnalise
                value={formData.type}
                onChange={(v) => handleFormChange({ target: { name: 'type', value: v } })}
                className="form-control"
                options={[
                  { value: 'Prise en main', label: 'Prise en main' },
                  { value: 'Intermédiaire', label: 'Intermédiaire' },
                  { value: 'Final', label: 'Final' }
                ]}
              />
            </div>

            <div className="form-group">
              <label><FaFileAlt /> Fichier *</label>
              <div 
                className={`upload-zone-form ${dragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                {formData.file ? (
                  <div className="file-selected">
                    {formData.file.name.endsWith('.pdf') ? (
                      <FaFilePdf className="file-icon" style={{ color: '#E74C3C' }} />
                    ) : formData.file.name.endsWith('.doc') || formData.file.name.endsWith('.docx') ? (
                      <FaFileWord className="file-icon" style={{ color: '#6BA9E6' }} />
                    ) : (
                      <FaFileAlt className="file-icon" style={{ color: '#6BA9E6' }} />
                    )}
                    <span className="file-name">{formData.file.name}</span>
                    <button 
                      className="file-remove"
                      onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon-form">
                      <FaUpload />
                    </div>
                    <p className="upload-title-form">Glissez-déposez votre fichier ici</p>
                    <p className="upload-subtitle-form">ou</p>
                    <button className="upload-btn-form" onClick={handleFileSelect}>
                      Parcourir
                    </button>
                    <p className="upload-info-form">PDF, DOC, DOCX · Taille max : 10 MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="deposit-form-footer">
            <button className="btn-secondary" onClick={handleCloseForm}>
              Annuler
            </button>
            <button className="btn-primary" onClick={handleSubmitReport} disabled={submitting}>
              <FaUpload /> {submitting ? 'Dépôt en cours...' : 'Déposer le rapport'}
            </button>
          </div>
        </div>
      )}

      {/* ===== LISTE DES RAPPORTS DÉPOSÉS ===== */}
      <div className="reports-list">
        {filteredReports.length === 0 ? (
          <div className="empty-state">
            <p>Aucun rapport déposé pour ce stage</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="report-card">
              {/* Colonne : Fichier */}
              <div className="report-col-file">
                <div className="report-icon-wrapper" style={{ 
                  backgroundColor: report.status === 'Validé' ? '#D1FAE5' : 
                                 report.status === 'En révision' ? '#E1ECFE' : '#FEE2E2'
                }}>
                  {getFileIcon(report.fileName)}
                </div>
                <div className="report-info">
                  <span className="report-title">{report.title}</span>
                  <span className="report-filename">{report.fileName}</span>
                  <span className="report-meta">
                    <FaBuilding /> {report.stageTitre} · {report.size}
                  </span>
                </div>
              </div>

              {/* Colonne : Date */}
              <div className="report-col-date">
                <span className="report-date">{report.date}</span>
              </div>

              {/* Colonne : Statut */}
              <div className="report-col-status">
                <span className={getStatusBadge(report.status)}>{report.status}</span>
                {report.commentaire && (
                  <span className="report-comment">{report.commentaire}</span>
                )}
              </div>

              {/* Colonne : Actions */}
              <div className="report-col-actions">
                {report.status === 'Validé' && (
                  <>
                    <button 
                      className="btn-action-icon" 
                      onClick={() => handleVoir(report)}
                      title="Voir le fichier"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="btn-action-icon" 
                      onClick={() => handleTelecharger(report)}
                      title="Télécharger"
                    >
                      <FaDownload />
                    </button>
                  </>
                )}
                {report.status === 'En révision' && (
                  <>
                    <button 
                      className="btn-action-icon" 
                      onClick={() => handleVoir(report)}
                      title="Voir le fichier"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="btn-action-icon btn-danger" 
                      onClick={() => handleDeleteClick(report)}
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== MODAL DE CONFIRMATION SUPPRESSION ===== */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmer la suppression</h3>
            <p>Voulez-vous vraiment supprimer le rapport « {reportToDelete?.title} » ? Cette action est irréversible.</p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={confirmDelete}>
                Supprimer
              </button>
              <button className="btn-secondary" onClick={cancelDelete}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MesRapports;