import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaFileAlt, FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaClock, FaEye, FaDownload, FaCheck, FaTimes,
   FaFilePdf, FaFileWord, FaArrowLeft
} from 'react-icons/fa';

function EnseignantRapports() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ===== DONNÉES SIMULÉES =====
  const allRapports = [
    { id: 1, etudiant: 'Rakoto Miora', etudiantId: 1, stage: 'Plateforme web RH', entreprise: 'TechMada SARL', titre: 'Rapport de prise en main', fileName: 'rapport_prise_en_main.pdf', date: '20 Mar 2024', statut: 'Validé', size: '1.2 MB' },
    { id: 2, etudiant: 'Rakoto Miora', etudiantId: 1, stage: 'Plateforme web RH', entreprise: 'TechMada SARL', titre: 'Rapport intermédiaire', fileName: 'rapport_intermediaire.pdf', date: '15 Mai 2024', statut: 'En révision', size: '2.4 MB' },
    { id: 3, etudiant: 'Rakoto Miora', etudiantId: 1, stage: 'Plateforme web RH', entreprise: 'TechMada SARL', titre: 'Rapport final', fileName: null, date: '—', statut: 'À déposer', size: '—' },
    { id: 4, etudiant: 'Rakotondrabe Hery', etudiantId: 2, stage: 'App mobile comptes', entreprise: 'Airtel Madagascar', titre: 'Rapport de prise en main', fileName: null, date: '—', statut: 'À déposer', size: '—' },
    { id: 5, etudiant: 'Ramanantsoa Tojo', etudiantId: 3, stage: 'Migration système', entreprise: 'BNI Madagascar', titre: 'Rapport de prise en main', fileName: null, date: '—', statut: 'À déposer', size: '—' }
  ];

  // ===== FILTRER PAR ÉTUDIANT =====
  const rapports = studentId 
    ? allRapports.filter(r => r.etudiantId === parseInt(studentId))
    : allRapports;

  // Récupérer le nom de l'étudiant
  const getStudentName = () => {
    if (studentId) {
      const student = allRapports.find(r => r.etudiantId === parseInt(studentId));
      return student ? student.etudiant : '';
    }
    return '';
  };

  const studentName = getStudentName();

  const stats = {
    total: rapports.length,
    valides: rapports.filter(r => r.statut === 'Validé').length,
    revision: rapports.filter(r => r.statut === 'En révision').length,
    deposer: rapports.filter(r => r.statut === 'À déposer').length
  };

  const filteredRapports = rapports.filter(r => {
    if (selectedStatus !== 'tous' && r.statut !== selectedStatus) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      return r.etudiant.toLowerCase().includes(term) ||
             r.stage.toLowerCase().includes(term) ||
             r.entreprise.toLowerCase().includes(term) ||
             r.titre.toLowerCase().includes(term);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRapports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRapports = filteredRapports.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewFile = (fileName) => {
    if (fileName) {
      window.open(`/documents/${fileName}`, '_blank');
    }
  };

  const handleDownloadFile = (fileName) => {
    if (fileName) {
      const link = document.createElement('a');
      link.href = `/documents/${fileName}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleValidate = (id) => {
    alert(`✅ Rapport #${id} validé avec succès !`);
  };

  const handleReject = (id) => {
    const rapport = rapports.find(r => r.id === id);
    const comment = prompt(`Refuser le rapport "${rapport?.titre}".\nVeuillez indiquer la raison :`);
    if (comment !== null && comment.trim() !== '') {
      alert(`❌ Rapport #${id} refusé !\nRaison : ${comment}`);
    }
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'Validé': 'badge-valide',
      'En révision': 'badge-en-cours',
      'À déposer': 'badge-en-attente',
      'Refusé': 'badge-refuse'
    };
    return <span className={`badge ${badges[statut] || 'badge-en-attente'}`}>{statut}</span>;
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt style={{ color: '#A0B8D0' }} />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FaFilePdf style={{ color: '#E74C3C' }} />;
    if (ext === 'docx' || ext === 'doc') return <FaFileWord style={{ color: '#4A90D9' }} />;
    return <FaFileAlt style={{ color: '#A0B8D0' }} />;
  };

  return (
    <div className="rapports-page">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          {/* Bouton retour */}
          {studentId && (
            <button className="btn-back-header" onClick={() => navigate('/enseignant/etudiants')}>
              <FaArrowLeft /> Retour
            </button>
          )}
          
          {/* Titre */}
          <h1><FaFileAlt /> Rapports</h1>
          
          {/* Sous-titre */}
          <p className="text-muted">
            {studentId 
              ? `Rapports de ${studentName}`
              : 'Gérez les rapports des étudiants'}
          </p>
        </div>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total"><FaFileAlt /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon done"><FaCheckCircle /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.valides}</span>
            <span className="stat-label">Validés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.revision}</span>
            <span className="stat-label">En révision</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.deposer}</span>
            <span className="stat-label">À déposer</span>
          </div>
        </div>
      </div>

      {/* ===== TABLEAU ===== */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="toolbar-filters">
            <div className="filter-wrapper">
              <div className="filter-group">
                <FaFilter className="filter-icon" />
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="tous">Tous les statuts</option>
                  <option value="Validé">Validé</option>
                  <option value="En révision">En révision</option>
                  <option value="À déposer">À déposer</option>
                  <option value="Refusé">Refusé</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="search-wrapper">
            <div className="search-group">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredRapports.length === 0 ? (
          <div className="empty-state">
            <FaFileAlt className="empty-icon" />
            <h3>Aucun rapport</h3>
            <p>Aucun rapport ne correspond à vos critères</p>
          </div>
        ) : (
          <>
            <table className="rapports-table">
              <thead>
                <tr>
                  {!studentId && <th>Étudiant</th>}
                  <th>Rapport</th>
                  <th>Stage</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRapports.map((rapport) => (
                  <tr key={rapport.id}>
                    {!studentId && (
                      <td>
                        <div className="student-cell">
                          <span className="student-name">{rapport.etudiant}</span>
                        </div>
                      </td>
                    )}
                    <td>
                      <div className="rapport-cell">
                        <div className="rapport-icon">
                          {getFileIcon(rapport.fileName)}
                        </div>
                        <div className="rapport-info">
                          <span className="rapport-title">{rapport.titre}</span>
                          <span className="rapport-meta">
                            {rapport.fileName || 'Fichier non déposé'} · {rapport.size}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="stage-cell">
                        <span className="stage-title">{rapport.stage}</span>
                        <span className="stage-company">{rapport.entreprise}</span>
                      </div>
                    </td>
                    <td>{rapport.date}</td>
                    <td>{getStatusBadge(rapport.statut)}</td>
                    <td>
                      <div className="action-buttons">
                        {rapport.fileName && (
                          <>
                            <button 
                              className="action-btn view" 
                              onClick={() => handleViewFile(rapport.fileName)}
                              title="Voir le fichier"
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="action-btn download" 
                              onClick={() => handleDownloadFile(rapport.fileName)}
                              title="Télécharger"
                            >
                              <FaDownload />
                            </button>
                          </>
                        )}
                        {rapport.statut === 'En révision' && (
                          <>
                            <button 
                              className="action-btn validate" 
                              onClick={() => handleValidate(rapport.id)}
                              title="Valider"
                            >
                              <FaCheck />
                            </button>
                            <button 
                              className="action-btn reject" 
                              onClick={() => handleReject(rapport.id)}
                              title="Refuser"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => goToPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  className="page-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FaChevronRight />
                </button>
                
                <span className="page-info">
                  {filteredRapports.length} rapport{filteredRapports.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default EnseignantRapports;