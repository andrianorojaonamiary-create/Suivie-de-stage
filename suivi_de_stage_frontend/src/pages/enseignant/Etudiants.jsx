import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaUserGraduate,
  FaEye, FaStar, FaFileAlt, FaSearch, FaFilter,
  FaChevronLeft, FaChevronRight, FaClock, FaCheckCircle,
  FaTimes, FaGraduationCap
} from 'react-icons/fa';

function EnseignantEtudiants() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('tous');
  const [selectedNiveau, setSelectedNiveau] = useState('tous');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [students] = useState([
    {
      id: 1,
      nom: 'Rakoto Miora',
      matricule: 'ETU-2024-0421',
      filiere: 'Génie Logiciel',
      niveau: 'Master 2',
      stage: {
        id: 1,
        titre: "Plateforme web RH",
        entreprise: 'TechMada SARL',
        statut: 'En cours',
        dateDebut: '2024-03-01',
        dateFin: '2024-09-15',
        progression: 65
      },
      evaluation: 'Validé',
      rapports: 2
    },
    {
      id: 2,
      nom: 'Rakotondrabe Hery',
      matricule: 'ETU-2024-0422',
      filiere: 'Réseaux',
      niveau: 'Licence 3',
      stage: {
        id: 2,
        titre: "App mobile comptes",
        entreprise: 'Airtel Madagascar',
        statut: 'En attente',
        dateDebut: '2024-04-01',
        dateFin: '2024-10-01',
        progression: 30
      },
      evaluation: 'À faire',
      rapports: 1
    },
    {
      id: 3,
      nom: 'Ramanantsoa Tojo',
      matricule: 'ETU-2024-0423',
      filiere: 'Sécurité Info.',
      niveau: 'Master 1',
      stage: {
        id: 3,
        titre: "Migration système",
        entreprise: 'BNI Madagascar',
        statut: 'En attente',
        dateDebut: '2024-05-01',
        dateFin: '2024-11-01',
        progression: 15
      },
      evaluation: 'À faire',
      rapports: 0
    },
    {
      id: 4,
      nom: 'Andriantsoa Fanja',
      matricule: 'ETU-2024-0424',
      filiere: 'Génie Logiciel',
      niveau: 'Licence 2',
      stage: {
        id: 4,
        titre: "Analyse données clients",
        entreprise: 'Airtel Madagascar',
        statut: 'En attente',
        dateDebut: '2024-06-01',
        dateFin: '2024-12-01',
        progression: 10
      },
      evaluation: 'À faire',
      rapports: 0
    },
    {
      id: 5,
      nom: 'Rakotondrabe Hery',
      matricule: 'ETU-2024-0425',
      filiere: 'Multimédia',
      niveau: 'Licence 3',
      stage: {
        id: 5,
        titre: "Plateforme e-learning",
        entreprise: 'TechMada SARL',
        statut: 'Terminé',
        dateDebut: '2024-02-01',
        dateFin: '2024-08-01',
        progression: 100
      },
      evaluation: 'Validé',
      rapports: 3
    },
    {
      id: 6,
      nom: 'Rajaonarivelo Ando',
      matricule: 'ETU-2024-0426',
      filiere: 'Réseaux',
      niveau: 'Licence 1',
      stage: {
        id: 6,
        titre: "Gestion de stock",
        entreprise: 'DistriTech',
        statut: 'Refusé',
        dateDebut: '2024-07-01',
        dateFin: '2024-12-31',
        progression: 20
      },
      evaluation: 'À corriger',
      rapports: 1
    },
    {
      id: 7,
      nom: 'Razafindramary Fy',
      matricule: 'ETU-2024-0427',
      filiere: 'Génie Logiciel',
      niveau: 'Master 2',
      stage: {
        id: 7,
        titre: "Gestion rendez-vous",
        entreprise: 'Santé Plus',
        statut: 'En cours',
        dateDebut: '2024-08-01',
        dateFin: '2025-01-15',
        progression: 5
      },
      evaluation: 'À faire',
      rapports: 0
    }
  ]);

  const stats = {
    total: students.length,
    enStage: students.filter(s => s.stage.statut === 'En cours' || s.stage.statut === 'En attente').length,
    termines: students.filter(s => s.stage.statut === 'Terminé' || s.stage.statut === 'Validé').length,
    aEvaluer: students.filter(s => s.evaluation === 'À faire' || s.evaluation === 'À corriger').length
  };

  const filieres = ['tous', ...new Set(students.map(s => s.filiere))];
  const niveaux = ['tous', 'Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'];

  const filteredStudents = students.filter(s => {
    if (selectedFiliere !== 'tous' && s.filiere !== selectedFiliere) return false;
    if (selectedNiveau !== 'tous' && s.niveau !== selectedNiveau) return false;
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      return s.nom.toLowerCase().includes(term) ||
             s.matricule.toLowerCase().includes(term) ||
             s.filiere.toLowerCase().includes(term);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (key, value) => {
    if (key === 'filiere') setSelectedFiliere(value);
    if (key === 'niveau') setSelectedNiveau(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

  // ============================================================
  // NAVIGATION
  // ============================================================

  const goToStudentDetail = (studentId) => {
    navigate(`/enseignant/etudiant/${studentId}`);
  };

  const goToEvaluations = (studentId) => {
    navigate(`/enseignant/evaluations/${studentId}`);
  };

  const goToRapports = (studentId) => {
    navigate(`/enseignant/rapports/${studentId}`);
  };

  return (
    <div className="enseignant-etudiants">
      {/* ===== EN-TÊTE ===== */}
      <div className="page-header">
        <div>
          <h1><FaUsers /> Mes étudiants</h1>
          <p className="text-muted">{students.length} étudiants suivis</p>
        </div>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total"><FaUserGraduate /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.enStage}</span>
            <span className="stat-label">En stage</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon done"><FaCheckCircle /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.termines}</span>
            <span className="stat-label">Terminés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending"><FaStar /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.aEvaluer}</span>
            <span className="stat-label">À évaluer</span>
          </div>
        </div>
      </div>

      {/* ===== TABLEAU ===== */}
      <div className="table-container">
        {/* ===== TOOLBAR ===== */}
        <div className="table-toolbar">
          <div className="toolbar-filters">
            <div className="filter-wrapper">
              <div className="filter-group">
                <FaFilter className="filter-icon" />
                <select 
                  value={selectedFiliere} 
                  onChange={(e) => handleFilterChange('filiere', e.target.value)}
                >
                  {filieres.map(opt => (
                    <option key={opt} value={opt}>{opt === 'tous' ? 'Toutes filières' : opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-wrapper">
              <div className="filter-group">
                <FaGraduationCap className="filter-icon" />
                <select 
                  value={selectedNiveau} 
                  onChange={(e) => handleFilterChange('niveau', e.target.value)}
                >
                  {niveaux.map(opt => (
                    <option key={opt} value={opt}>{opt === 'tous' ? 'Tous niveaux' : opt}</option>
                  ))}
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

        {/* ===== TABLEAU ===== */}
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <FaUsers className="empty-icon" />
            <h3>Aucun étudiant trouvé</h3>
          </div>
        ) : (
          <>
            <table className="students-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Filière / Niveau</th>
                  <th>Stage</th>
                  <th>Période</th>
                  <th>Statut</th>
                  <th>Évaluation</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-cell">
                        <span className="student-name">{student.nom}</span>
                        <span className="student-matricule">{student.matricule}</span>
                      </div>
                    </td>
                    <td>
                      <div className="filiere-cell">
                        <span className="filiere-name">{student.filiere}</span>
                        <span className="niveau-tag">{student.niveau}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stage-cell">
                        <span className="stage-title">{student.stage.titre}</span>
                        <span className="stage-company">{student.stage.entreprise}</span>
                      </div>
                    </td>
                    <td>
                      <span className="date-text">
                        {formatDate(student.stage.dateDebut)} → {formatDate(student.stage.dateFin)}
                      </span>
                    </td>
                    <td>{getStatusBadge(student.stage.statut)}</td>
                    <td>{getEvalBadge(student.evaluation)}</td>
                    <td>
                      <div className="action-buttons">
                        {/* ===== BOUTON VOIR DÉTAILS ===== */}
                        <button 
                          className="action-btn view" 
                          onClick={() => goToStudentDetail(student.id)}
                          title="Voir les détails"
                        >
                          <FaEye />
                        </button>
                        
                        {/* ===== BOUTON ÉVALUER ===== */}
                        <button 
                          className="action-btn eval" 
                          onClick={() => goToEvaluations(student.id)}
                          title="Évaluer"
                        >
                          <FaStar />
                        </button>
                        
                        {/* ===== BOUTON VOIR RAPPORTS ===== */}
                        <button 
                          className="action-btn report" 
                          onClick={() => goToRapports(student.id)}
                          title="Voir les rapports"
                        >
                          <FaFileAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ===== PAGINATION ===== */}
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
                  {filteredStudents.length} étudiant{filteredStudents.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default EnseignantEtudiants;