import { useState, useRef, useEffect } from 'react';
import {
  FaStar, FaFilter, FaDownload, FaEye, FaSearch,
  FaChartBar, FaPrint, FaTimes, FaAward, FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { evaluationsApi } from '../../api';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import { toast } from 'react-toastify';

function AdminEvaluations() {
  // ===== ÉTATS =====
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const tableRef = useRef(null);

  // ===== DONNÉES ÉVALUATIONS =====
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await evaluationsApi.getAllAdmin({ limit: 100 });
        const list = Array.isArray(res) ? res : res?.items || res?.data || [];
        
        const mapped = list.map((ev) => {
          const student = ev.student;
          const stage = ev.stage;
          const company = stage?.company;
          const supervisor = stage?.supervisor;
          
          return {
            id: ev.id,
            etudiant: student?.user ? `${student.user.prenom || ''} ${student.user.nom || ''}`.trim() : 'Étudiant',
            stage: stage?.intitule || 'Stage',
            entreprise: company?.nom || 'Entreprise',
            encadreur: supervisor?.user ? `${supervisor.user.prenom || ''} ${supervisor.user.nom || ''}`.trim() : 
                       ev.evaluateur ? `${ev.evaluateur.prenom || ''} ${ev.evaluateur.nom || ''}`.trim() : 'Évaluateur',
            type: ev.typeEvaluateur,
            date: ev.dateEvaluation ? new Date(ev.dateEvaluation).toLocaleDateString('fr-FR') : 'Date',
            status: ev.validee ? 'Validé' : 'En attente',
            note: ev.note,
            commentaire: ev.commentaire,
            criteres: ev.criteres || []
          };
        });
        
        setEvaluations(mapped);
      } catch (err) {
        console.error('Erreur chargement évaluations:', err);
      }
    };

    fetchEvaluations();
  }, []);

  // ===== STATISTIQUES =====
  const notesList = evaluations.filter(e => e.note);
  const stats = {
    total: evaluations.length,
    valides: evaluations.filter(e => e.status === 'Validé').length,
    enAttente: evaluations.filter(e => e.status === 'En attente').length,
    enRevision: evaluations.filter(e => e.status === 'En révision').length,
    moyenneGenerale: notesList.length > 0 ? (notesList.reduce((acc, e) => acc + e.note, 0) / notesList.length).toFixed(1) : 0
  };

  // ===== STATUT STAGES POUR CAMEMBERT =====
  const statusData = [
    { name: 'Validé', value: stats.valides, color: '#22C55E' },
    { name: 'En révision', value: stats.enRevision, color: '#F59E0B' },
    { name: 'En attente', value: stats.enAttente, color: '#9CA3AF' },
  ];

  // ===== DONNÉES POUR LE GRAPHIQUE PAR TYPE =====
  const typeData = [
    { type: 'MAITRE_DE_STAGE', label: 'Encadreur professionnel', count: evaluations.filter(e => e.type === 'MAITRE_DE_STAGE').length },
    { type: 'TUTEUR_PEDAGOGIQUE', label: 'Tuteur pédagogique', count: evaluations.filter(e => e.type === 'TUTEUR_PEDAGOGIQUE').length },
  ];

  // ===== FILTRES =====
  const filteredEvaluations = evaluations.filter(e => {
    const matchSearch = e.etudiant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.entreprise.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'Tous' || e.type === filterType;
    const matchStatus = filterStatus === 'Tous' || e.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvaluations = filteredEvaluations.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // ===== TYPES D'ÉVALUATION =====
  const typeOptions = [
    { value: 'Tous', label: 'Tous les types' },
    { value: 'MAITRE_DE_STAGE', label: 'Encadreur professionnel' },
    { value: 'TUTEUR_PEDAGOGIQUE', label: 'Tuteur pédagogique' }
  ];

  // ===== STATUTS =====
  const statusOptions = [
    { value: 'Tous', label: 'Tous les statuts' },
    { value: 'Validé', label: 'Validé' },
    { value: 'En attente', label: 'En attente' },
    { value: 'En révision', label: 'En révision' }
  ];

  // ===== BADGES =====
  const getStatusBadge = (status) => {
    const classes = {
      'Validé': 'admin-eval-badge-valide',
      'En attente': 'admin-eval-badge-attente',
      'En révision': 'admin-eval-badge-revision',
    };
    return classes[status] || 'admin-eval-badge-attente';
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'MAITRE_DE_STAGE': return 'Encadreur professionnel';
      case 'TUTEUR_PEDAGOGIQUE': return 'Tuteur pédagogique';
      default: return type;
    }
  };

  const getTypeBadge = (type) => {
    const classes = {
      'MAITRE_DE_STAGE': 'admin-eval-type-badge-maitre',
      'TUTEUR_PEDAGOGIQUE': 'admin-eval-type-badge-tuteur',
    };
    return classes[type] || 'admin-eval-type-badge';
  };

  // ===== AFFICHAGE DES ÉTOILES =====
  const getStars = (note) => {
    if (!note) return null;
    const value = parseInt(note);
    const fullStars = Math.floor(value / 4);
    const emptyStars = 5 - fullStars;
    return (
      <span className="admin-eval-stars">
        {'★'.repeat(Math.min(fullStars, 5))}
        {'☆'.repeat(Math.max(emptyStars, 0))}
      </span>
    );
  };

  // ===== EXPORT PDF =====
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = tableRef.current;
      if (!element) return;
      
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('evaluations.pdf');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // ===== IMPRIMER =====
  const handlePrint = () => {
    window.print();
  };

  // ===== OUVIR MODAL =====
  const handleViewDetails = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailModal(true);
  };

  // ===== FORMAT PERSONNALISÉ POUR LES LABELS DU CAMEMBERT =====
  const MIN_PERCENT = 0.08;
  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    if (percent < MIN_PERCENT) return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#162449" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={11}
        fontWeight={500}
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="admin-eval-page">
      {/* ===== HEADER ===== */}
      <div className="admin-eval-header">
        <div>
          <h1>Évaluations</h1>
          <p className="admin-eval-subtitle">Consultez les évaluations des stages</p>
        </div>
        <div className="admin-eval-actions">
          <button className="admin-eval-btn-export" onClick={handleExportPDF} disabled={isExporting}>
            <FaDownload /> {isExporting ? 'Exportation...' : 'Exporter PDF'}
          </button>
        </div>
      </div>

      {/* ===== STATISTIQUES (5 cartes améliorées) ===== */}
      <div className="admin-eval-stats">
        <div className="admin-eval-stat-card">
          <div className="admin-eval-stat-icon-wrapper" style={{ background: '#E1ECFE', color: '#6BA9E6' }}>
            <FaStar />
          </div>
          <div className="admin-diplome-stat-content">
            <span className="admin-eval-stat-value">{stats.total}</span>
            <span className="admin-eval-stat-label">Total évaluations</span>
          </div>
        </div>
        <div className="admin-eval-stat-card">
          <div className="admin-eval-stat-icon-wrapper" style={{ background: '#D1FAE5', color: '#22C55E' }}>
            <FaAward />
          </div>
          <div className="admin-diplome-stat-content">
            <span className="admin-eval-stat-value" style={{ color: '#22C55E' }}>{stats.valides}</span>
            <span className="admin-eval-stat-label">Validées</span>
          </div>
        </div>
        <div className="admin-eval-stat-card">
          <div className="admin-eval-stat-icon-wrapper" style={{ background: '#FEF3C7', color: '#F59E0B' }}>
            <FaChartBar />
          </div>
          <div className="admin-diplome-stat-content">
            <span className="admin-eval-stat-value" style={{ color: '#F59E0B' }}>{stats.enRevision}</span>
            <span className="admin-eval-stat-label">En révision</span>
          </div>
        </div>
        <div className="admin-eval-stat-card">
          <div className="admin-eval-stat-icon-wrapper" style={{ background: '#F3F4F6', color: '#9CA3AF' }}>
            <FaFilter />
          </div>
          <div className="admin-diplome-stat-content">
            <span className="admin-eval-stat-value" style={{ color: '#9CA3AF' }}>{stats.enAttente}</span>
            <span className="admin-eval-stat-label">En attente</span>
          </div>
        </div>
        <div className="admin-eval-stat-card admin-eval-stat-card-featured">
          <div className="admin-eval-stat-icon-wrapper" style={{ background: '#162449', color: '#F5F8FC' }}>
            <FaAward />
          </div>
          <div className="admin-diplome-stat-content">
            <span className="admin-eval-stat-value" style={{ color: '#162449' }}>{stats.moyenneGenerale}/20</span>
            <span className="admin-eval-stat-label">Moyenne générale</span>
          </div>
        </div>
      </div>

      {/* ===== DIAGRAMMES ===== */}
      <div className="admin-eval-charts">
        <div className="admin-eval-chart-card">
          <h3><FaChartBar /> Répartition par statut</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={{ stroke: '#E1ECFE', strokeWidth: 1 }}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: 10, 
                  border: '1px solid #E1ECFE',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="admin-eval-chart-legend">
            {statusData.map((item) => (
              <div className="admin-eval-legend-item" key={item.name}>
                <span className="admin-eval-legend-dot" style={{ background: item.color }} />
                <span className="admin-eval-legend-label">{item.name}</span>
                <span className="admin-eval-legend-count">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-eval-chart-card">
          <h3><FaChartBar /> Répartition par type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={typeData} barSize={32} barGap={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F8FC" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6c7a8a' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6c7a8a' }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: 10, 
                  border: '1px solid #E1ECFE',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }} 
              />
              <Bar dataKey="count" fill="#162449" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== FILTRES + RECHERCHE ===== */}
      <div className="admin-eval-filters">
        <div className="admin-eval-filter-group">
          <label><FaFilter /> Filtres</label>
          <SelectPersonnalise
            value={filterType}
            onChange={setFilterType}
            options={typeOptions}
            className="admin-eval-filter-select"
          />
          <SelectPersonnalise
            value={filterStatus}
            onChange={setFilterStatus}
            options={statusOptions}
            className="admin-eval-filter-select"
          />
        </div>
        <div className="admin-eval-filter-group admin-eval-search-group">
          <FaSearch className="admin-eval-search-icon" />
          <input
            type="text"
            placeholder="Rechercher un étudiant, stage, entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-eval-search-input"
          />
        </div>
      </div>

      {/* ===== TABLEAU DES ÉVALUATIONS ===== */}
      <div className="admin-eval-table-container" ref={tableRef}>
        <table className="admin-eval-table">
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Stage</th>
              <th>Entreprise</th>
              <th>Type</th>
              <th>Date</th>
              <th>Note</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEvaluations.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-eval-empty">Aucune évaluation trouvée</td>
              </tr>
            ) : (
              paginatedEvaluations.map((evalItem) => (
                <tr key={evalItem.id}>
                  <td><strong>{evalItem.etudiant}</strong></td>
                  <td>{evalItem.stage}</td>
                  <td>{evalItem.entreprise}</td>
                  <td><span className={getTypeBadge(evalItem.type)}>{getTypeLabel(evalItem.type)}</span></td>
                  <td>{evalItem.date}</td>
                  <td>
                    {evalItem.note ? (
                      <span className="admin-eval-note">{evalItem.note}/20</span>
                    ) : (
                      <span className="admin-eval-note-empty">—</span>
                    )}
                  </td>
                  <td><span className={getStatusBadge(evalItem.status)}>{evalItem.status}</span></td>
                  <td>
                    <button className="admin-eval-btn-view" onClick={() => handleViewDetails(evalItem)}>
                      <FaEye /> Voir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="admin-eval-pagination">
            <button 
              className="admin-eval-pagination-btn" 
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>
            <span className="admin-eval-pagination-info">
              Page {currentPage} sur {totalPages}
            </span>
            <button 
              className="admin-eval-pagination-btn" 
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

         {/* ===== MODAL DE DÉTAIL ===== */}
      {showDetailModal && selectedEvaluation && (
        <div className="admin-eval-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="admin-eval-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-eval-modal-header">
              <h3><FaStar /> Détail de l'évaluation</h3>
              <button className="admin-eval-modal-close" onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="admin-eval-modal-body">
              {/* Informations générales */}
              <div className="admin-eval-modal-info">
                <div className="admin-eval-modal-info-item">
                  <span className="admin-eval-modal-info-label">Étudiant</span>
                  <span className="admin-eval-modal-info-value">{selectedEvaluation.etudiant}</span>
                </div>
                <div className="admin-eval-modal-info-item">
                  <span className="admin-eval-modal-info-label">Stage</span>
                  <span className="admin-eval-modal-info-value">{selectedEvaluation.stage}</span>
                </div>
                <div className="admin-eval-modal-info-item">
                  <span className="admin-eval-modal-info-label">Entreprise</span>
                  <span className="admin-eval-modal-info-value">{selectedEvaluation.entreprise}</span>
                </div>
                <div className="admin-eval-modal-info-item">
                  <span className="admin-eval-modal-info-label">Évaluateur</span>
                  <span className="admin-eval-modal-info-value">{selectedEvaluation.encadreur}</span>
                  <span className="admin-eval-modal-info-sub">{getTypeLabel(selectedEvaluation.type)}</span>
                </div>
                <div className="admin-eval-modal-info-item">
                  <span className="admin-eval-modal-info-label">Date d'évaluation</span>
                  <span className="admin-eval-modal-info-value">{selectedEvaluation.date}</span>
                </div>
                <div className="admin-eval-modal-info-item">
                  <span className="admin-eval-modal-info-label">Statut</span>
                  <span className={getStatusBadge(selectedEvaluation.status)}>{selectedEvaluation.status}</span>
                </div>
                {selectedEvaluation.note && (
                  <div className="admin-eval-modal-info-item admin-eval-modal-info-note">
                    <span className="admin-eval-modal-info-label">Note générale</span>
                    <span className="admin-eval-modal-info-value">
                      <span className="admin-eval-modal-note-big">{selectedEvaluation.note}/20</span>
                      <span className="admin-eval-modal-stars-big">{getStars(selectedEvaluation.note)}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Critères d'évaluation */}
              {selectedEvaluation.criteres && selectedEvaluation.criteres.length > 0 && (
                <div className="admin-eval-modal-criteres">
                  <h4>Critères d'évaluation</h4>
                  <table className="admin-eval-modal-table">
                    <thead>
                      <tr>
                        <th>Critère</th>
                        <th>Note /20</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEvaluation.criteres.map((critere, index) => (
                        <tr key={index}>
                          <td>{critere.nom}</td>
                          <td>
                            <span className="admin-eval-modal-note">{critere.note}/20</span>
                            <span className="admin-eval-modal-stars">{getStars(critere.note)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Appréciation générale */}
              {selectedEvaluation.commentaire && (
                <div className="admin-eval-modal-commentaire">
                  <h4>Appréciation générale</h4>
                  <div className="admin-eval-modal-commentaire-box">
                    <p>{selectedEvaluation.commentaire}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="admin-eval-modal-footer">
              <button className="admin-eval-modal-btn-secondary" onClick={() => setShowDetailModal(false)}>
                Fermer
              </button>
              <button className="admin-eval-modal-btn-primary" onClick={handlePrint}>
                <FaPrint /> Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEvaluations;