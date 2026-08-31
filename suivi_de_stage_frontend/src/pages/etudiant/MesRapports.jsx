import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { 
  FaFileAlt, FaDownload, FaUpload, FaTrash, 
  FaFilePdf, FaFileWord, FaEye, 
  FaBuilding, FaFilter, FaTimes, FaInfoCircle, FaPlus
} from 'react-icons/fa';

function MesRapports() {
  const [selectedStage, setSelectedStage] = useState('all');
  const fileInputRef = useRef(null);
  
  // ===== ÉTAT DU FORMULAIRE =====
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    stageId: '',
    type: 'Intermédiaire',
    file: null
  });
  const [dragging, setDragging] = useState(false);

  // ===== DONNÉES : RAPPORTS PAR STAGE =====
  const [stages] = useState([
    {
      id: 1,
      titre: 'Développement plateforme web RH',
      entreprise: 'TechMada SARL',
      rapports: [
        { id: 1, title: 'Rapport de prise en main', fileName: 'rapport_prise_en_main.pdf', date: '20 Mar 2024', status: 'Validé', size: '1.2 MB', commentaire: 'Très bon travail !' },
        { id: 2, title: 'Rapport intermédiaire', fileName: 'rapport_intermediaire.pdf', date: '15 Mai 2024', status: 'En révision', size: '2.4 MB', commentaire: 'En attente de validation' },
      ]
    },
    {
      id: 2,
      titre: 'Application mobile de gestion',
      entreprise: 'Airtel Madagascar',
      rapports: [
        { id: 3, title: 'Rapport de prise en main', fileName: null, date: '—', status: 'À déposer', size: '—', commentaire: 'À déposer avant le 01 Avr 2024' },
      ]
    },
  ]);

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

  const handleSubmitReport = () => {
    if (!formData.stageId) {
      toast.error('⚠️ Veuillez sélectionner un stage');
      return;
    }
    if (!formData.file) {
      toast.error('⚠️ Veuillez sélectionner un fichier');
      return;
    }

    const selectedStage = stages.find(s => s.id === parseInt(formData.stageId));
    
    toast.success(`✅ Rapport "${formData.file.name}" déposé avec succès pour ${selectedStage?.titre} !`);
    handleCloseForm();
  };

  // ===== ACTIONS =====

  // ===== VOIR - Ouvre le fichier dans un nouvel onglet =====
  const handleVoir = (fileName) => {
    if (!fileName) {
      toast.error('❌ Aucun fichier à visualiser');
      return;
    }
    
    try {
      // Ouvrir le fichier dans un nouvel onglet
      // En production, utilisez l'URL de votre API
      window.open(`/documents/${fileName}`, '_blank');
      toast.info(`👁️ Ouverture de "${fileName}"...`);
    } catch (error) {
      toast.error('❌ Erreur lors de l\'ouverture du fichier');
      console.error('Erreur:', error);
    }
  };

  // ===== TÉLÉCHARGER - Télécharge le fichier =====
  const handleTelecharger = (fileName) => {
    if (!fileName) {
      toast.error('❌ Aucun fichier à télécharger');
      return;
    }
    
    try {
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = `/documents/${fileName}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`📥 Téléchargement de "${fileName}"...`);
    } catch (error) {
      toast.error('❌ Erreur lors du téléchargement');
      console.error('Erreur:', error);
    }
  };

  // ===== SUPPRIMER =====
  const handleSupprimer = (id, title) => {
    if (window.confirm(`Supprimer "${title}" ?`)) {
      // Ici, vous feriez un appel API pour supprimer
      toast.success(`🗑️ Rapport "${title}" supprimé !`);
    }
  };

  // ===== FILTRES PAR STAGE =====
  const stageOptions = ['all', ...stages.map(s => s.titre)];

  return (
    <div className="etudiant-rapports">
      <div className="page-header">
        <div>
          <h1>Mes rapports</h1>
          <p className="text-muted">
            {existingReports.filter(r => r.status === 'Validé').length} validé(s) · 
            {existingReports.filter(r => r.status === 'En révision').length} en révision · 
            {pendingReports.length} à déposer
          </p>
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

      {/* ===== RAPPORTS À DÉPOSER ===== 
      {pendingReports.length > 0 && (
        <div className="pending-reports-section">
          <div className="pending-reports-header">
            <h3>📋 Rapports à déposer</h3>
          </div>
          <div className="pending-reports-list">
            {pendingReports.map((report, index) => (
              <div key={index} className="pending-report-item">
                <div className="pending-report-info">
                  <span className="pending-report-title">{report.title}</span>
                  <span className="pending-report-stage"><FaBuilding /> {report.stageTitre}</span>
                  <span className="pending-report-date">Échéance : {report.date}</span>
                </div>
                <button 
                  className="btn-deposer" 
                  onClick={handleOpenForm}
                >
                  <FaUpload /> Déposer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      */}
      
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
              <select
                name="stageId"
                value={formData.stageId}
                onChange={handleFormChange}
                className="form-control"
              >
                <option value="">Sélectionnez un stage</option>
                {stages.map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.titre} - {stage.entreprise}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label><FaInfoCircle /> Type de rapport *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                className="form-control"
              >
                <option value="Prise en main">Prise en main</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Final">Final</option>
              </select>
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
            <button className="btn-primary" onClick={handleSubmitReport}>
              <FaUpload /> Déposer le rapport
            </button>
          </div>
        </div>
      )}

      {/* ===== FILTRE PAR STAGE ===== */}
      <div className="filter-section">
        <div className="filter-group">
          <label><FaFilter /> Filtrer par stage</label>
          <select 
            value={selectedStage} 
            onChange={(e) => setSelectedStage(e.target.value)}
            className="filter-select"
          >
            {stageOptions.map(option => (
              <option key={option} value={option}>
                {option === 'all' ? 'Tous les stages' : option}
              </option>
            ))}
          </select>
        </div>
      </div>

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
                      onClick={() => handleVoir(report.fileName)}
                      title="Voir le fichier"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="btn-action-icon" 
                      onClick={() => handleTelecharger(report.fileName)}
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
                      onClick={() => handleVoir(report.fileName)}
                      title="Voir le fichier"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="btn-action-icon btn-danger" 
                      onClick={() => handleSupprimer(report.id, report.title)}
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
    </div>
  );
}

export default MesRapports;