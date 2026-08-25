import { useState } from 'react';
import { 
  FaUsers, FaUserGraduate, FaBuilding, FaCalendarAlt, 
  FaEye, FaStar, FaFileAlt, FaSearch, FaFilter,
  FaChevronLeft, FaChevronRight, FaClock, FaCheckCircle,
  FaTimesCircle, FaTimes,
  FaGraduationCap, FaBriefcase, 
} from 'react-icons/fa';

// Composant Modal pour voir les détails de l'étudiant
import ViewStudentModal from './components/ViewStudentModal';

function EnseignantEtudiants() {
  //const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('tous');
  const [selectedNiveau, setSelectedNiveau] = useState('tous');
  
  // ===== MODAL =====
  const [modalViewOpen, setModalViewOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // ===== PAGINATION =====
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ===== DONNÉES SIMULÉES =====
  const [students] = useState([
    {
      id: 1,
      nom: 'Rakoto',
      prenom: 'Miora',
      matricule: 'ETU-2024-0421',
      email: 'miora.rakoto@emit.mg',
      telephone: '+261 34 12 345 01',
      filiere: 'Génie Logiciel',
      niveau: 'Master 2',
      ville: 'Antananarivo',
      stage: {
        titre: "Développement d'une plateforme web de gestion RH",
        entreprise: 'TechMada SARL',
        statut: 'En cours',
        dateDebut: '2024-03-01',
        dateFin: '2024-09-15',
        progression: 65
      },
      rapports: 2,
      evaluation: 'Validé',
      encadreur: 'M. Rakotomalala'
    },
    {
      id: 2,
      nom: 'Rakotondrabe',
      prenom: 'Hery',
      matricule: 'ETU-2024-0422',
      email: 'hery.rakotondrabe@emit.mg',
      telephone: '+261 34 12 345 02',
      filiere: 'Réseaux et Télécommunications',
      niveau: 'Licence 3',
      ville: 'Antananarivo',
      stage: {
        titre: "Application mobile de gestion des comptes",
        entreprise: 'Airtel Madagascar',
        statut: 'En attente',
        dateDebut: '2024-04-01',
        dateFin: '2024-10-01',
        progression: 30
      },
      rapports: 1,
      evaluation: 'À faire',
      encadreur: 'Mme. Ralava'
    },
    {
      id: 3,
      nom: 'Ramanantsoa',
      prenom: 'Tojo',
      matricule: 'ETU-2024-0423',
      email: 'tojo.ramanantsoa@emit.mg',
      telephone: '+261 34 12 345 03',
      filiere: 'Sécurité Informatique',
      niveau: 'Master 1',
      ville: 'Fianarantsoa',
      stage: {
        titre: "Migration et sécurisation du système d'information",
        entreprise: 'BNI Madagascar',
        statut: 'En attente',
        dateDebut: '2024-05-01',
        dateFin: '2024-11-01',
        progression: 15
      },
      rapports: 0,
      evaluation: 'À faire',
      encadreur: 'M. Randrianarison'
    },
    {
      id: 4,
      nom: 'Andriantsoa',
      prenom: 'Fanja',
      matricule: 'ETU-2024-0424',
      email: 'fanja.andriantsoa@emit.mg',
      telephone: '+261 34 12 345 04',
      filiere: 'Génie Logiciel',
      niveau: 'Licence 2',
      ville: 'Antananarivo',
      stage: {
        titre: "Analyse de données pour la relation client",
        entreprise: 'Airtel Madagascar',
        statut: 'En attente',
        dateDebut: '2024-06-01',
        dateFin: '2024-12-01',
        progression: 10
      },
      rapports: 0,
      evaluation: 'À faire',
      encadreur: 'Mme. Ralava'
    },
    {
      id: 5,
      nom: 'Rakotondrabe',
      prenom: 'Hery',
      matricule: 'ETU-2024-0425',
      email: 'hery2.rakotondrabe@emit.mg',
      telephone: '+261 34 12 345 05',
      filiere: 'Multimédia',
      niveau: 'Licence 3',
      ville: 'Toamasina',
      stage: {
        titre: "Développement d'une plateforme de e-learning",
        entreprise: 'TechMada SARL',
        statut: 'Terminé',
        dateDebut: '2024-02-01',
        dateFin: '2024-08-01',
        progression: 100
      },
      rapports: 3,
      evaluation: 'Validé',
      encadreur: 'M. Rakotomalala'
    },
    {
      id: 6,
      nom: 'Rajaonarivelo',
      prenom: 'Ando',
      matricule: 'ETU-2024-0426',
      email: 'ando.rajaonarivelo@emit.mg',
      telephone: '+261 34 12 345 06',
      filiere: 'Réseaux et Télécommunications',
      niveau: 'Licence 1',
      ville: 'Antananarivo',
      stage: {
        titre: "Système de gestion de stock",
        entreprise: 'DistriTech',
        statut: 'Refusé',
        dateDebut: '2024-07-01',
        dateFin: '2024-12-31',
        progression: 20
      },
      rapports: 1,
      evaluation: 'À corriger',
      encadreur: 'M. Randrianarison'
    },
    {
      id: 7,
      nom: 'Razafindramary',
      prenom: 'Fy',
      matricule: 'ETU-2024-0427',
      email: 'fy.razafindramary@emit.mg',
      telephone: '+261 34 12 345 07',
      filiere: 'Génie Logiciel',
      niveau: 'Master 2',
      ville: 'Antsirabe',
      stage: {
        titre: "Application de gestion des rendez-vous",
        entreprise: 'Santé Plus',
        statut: 'En cours',
        dateDebut: '2024-08-01',
        dateFin: '2025-01-15',
        progression: 5
      },
      rapports: 0,
      evaluation: 'À faire',
      encadreur: 'Mme. Ralava'
    }
  ]);

  // ===== STATISTIQUES =====
  const stats = {
    total: students.length,
    enStage: students.filter(s => s.stage.statut === 'En cours' || s.stage.statut === 'En attente').length,
    termines: students.filter(s => s.stage.statut === 'Terminé' || s.stage.statut === 'Validé').length,
    aEvaluer: students.filter(s => s.evaluation === 'À faire' || s.evaluation === 'À corriger').length
  };

  // ===== FILTRES =====
  const filieres = ['tous', ...new Set(students.map(s => s.filiere))];
  const niveaux = ['tous', 'Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'];

  const filteredStudents = students.filter(s => {
    if (selectedFiliere !== 'tous' && s.filiere !== selectedFiliere) return false;
    if (selectedNiveau !== 'tous' && s.niveau !== selectedNiveau) return false;
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      return s.nom.toLowerCase().includes(term) ||
             s.prenom.toLowerCase().includes(term) ||
             s.matricule.toLowerCase().includes(term);
    }
    return true;
  });

  // ===== PAGINATION =====
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

  // ===== FORMAT DATE =====
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ===== BADGE STATUT =====
  const getStatusBadge = (statut) => {
    const badges = {
      'En cours': { className: 'badge-status-en-cours', icon: <FaClock />, label: 'En cours' },
      'En attente': { className: 'badge-status-en-attente', icon: <FaClock />, label: 'En attente' },
      'Terminé': { className: 'badge-status-termine', icon: <FaCheckCircle />, label: 'Terminé' },
      'Validé': { className: 'badge-status-valide', icon: <FaCheckCircle />, label: 'Validé' },
      'Refusé': { className: 'badge-status-refuse', icon: <FaTimesCircle />, label: 'Refusé' }
    };
    const badge = badges[statut] || badges['En attente'];
    return <span className={`badge ${badge.className}`}>{badge.icon} {badge.label}</span>;
  };

  // ===== BADGE ÉVALUATION =====
  const getEvalBadge = (evalStatus) => {
    const badges = {
      'Validé': { className: 'badge-eval-valide', label: 'Validé' },
      'À faire': { className: 'badge-eval-en-attente', label: 'À faire' },
      'À corriger': { className: 'badge-eval-refuse', label: 'À corriger' }
    };
    const badge = badges[evalStatus] || badges['À faire'];
    return <span className={`badge ${badge.className}`}>{badge.label}</span>;
  };

  // ===== ACTIONS =====
  const openViewModal = (student) => {
    setSelectedStudent(student);
    setModalViewOpen(true);
  };

  const closeViewModal = () => {
    setModalViewOpen(false);
    setSelectedStudent(null);
  };

  const handleViewStage = (student) => {
    alert(`📋 Stage de ${student.prenom} ${student.nom}\n\n🏷️ Titre : ${student.stage.titre}\n🏢 Entreprise : ${student.stage.entreprise}\n📅 Période : ${formatDate(student.stage.dateDebut)} → ${formatDate(student.stage.dateFin)}\n📊 Progression : ${student.stage.progression}%`);
  };

  const handleEvaluate = (student) => {
    alert(`⭐ Évaluation de ${student.prenom} ${student.nom}\n\nStatut actuel : ${student.evaluation}`);
  };

  const handleViewReports = (student) => {
    alert(`📄 Rapports de ${student.prenom} ${student.nom}\n\nNombre de rapports : ${student.rapports}`);
  };

  return (
    <div className="page-enseignant-etudiants">
      {/* ===== EN-TÊTE ===== */}
      <div className="page-header">
        <div>
          <h1><FaUsers /> Mes étudiants</h1>
          <p className="text-muted">{students.length} étudiants suivis</p>
        </div>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="stats-cards">
        <div className="stat-card stat-total">
          <div className="stat-icon"><FaUserGraduate /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total étudiants</span>
          </div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-icon"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.enStage}</span>
            <span className="stat-label">En stage</span>
          </div>
        </div>
        <div className="stat-card stat-done">
          <div className="stat-icon"><FaCheckCircle /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.termines}</span>
            <span className="stat-label">Stages terminés</span>
          </div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-icon"><FaStar /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.aEvaluer}</span>
            <span className="stat-label">À évaluer</span>
          </div>
        </div>
      </div>

      {/* ===== TABLEAU AVEC FILTRES ET RECHERCHE ===== */}
      <div className="etudiants-table-wrapper">
        {/* ===== TOOLBAR ===== */}
        <div className="table-toolbar">
          <div className="toolbar-left">
            <div className="filter-group">
              <label><FaFilter /> Filière</label>
              <select 
                value={selectedFiliere} 
                onChange={(e) => handleFilterChange('filiere', e.target.value)}
              >
                {filieres.map(opt => (
                  <option key={opt} value={opt}>{opt === 'tous' ? 'Toutes' : opt}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label><FaGraduationCap /> Niveau</label>
              <select 
                value={selectedNiveau} 
                onChange={(e) => handleFilterChange('niveau', e.target.value)}
              >
                {niveaux.map(opt => (
                  <option key={opt} value={opt}>{opt === 'tous' ? 'Tous' : opt}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="toolbar-right">
            <div className="search-group">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher un étudiant..."
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
            <p>Aucun étudiant ne correspond à vos critères de recherche</p>
          </div>
        ) : (
          <>
            <table className="etudiants-table">
              <thead>
                <tr>
                  <th><FaUserGraduate /> Étudiant</th>
                  <th><FaGraduationCap /> Niveau</th>
                  <th><FaBuilding /> Entreprise</th>
                  <th><FaCalendarAlt /> Période</th>
                  <th>Statut</th>
                  <th><FaStar /> Évaluation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-name">
                        <strong>{student.prenom} {student.nom}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="niveau-tag">{student.niveau}</span>
                    </td>
                    <td>
                      <div className="entreprise-info">
                        <span className="entreprise-name">{student.stage.entreprise}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <span>{formatDate(student.stage.dateDebut)}</span>
                        <span className="date-separator">→</span>
                        <span>{formatDate(student.stage.dateFin)}</span>
                      </div>
                    </td>
                    <td>{getStatusBadge(student.stage.statut)}</td>
                    <td>{getEvalBadge(student.evaluation)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-action" 
                          onClick={() => openViewModal(student)}
                          title="Voir les détails"
                        >
                          <FaEye />
                        </button>
                        <button 
                          className="btn-action" 
                          onClick={() => handleViewStage(student)}
                          title="Voir le stage"
                        >
                          <FaBriefcase />
                        </button>
                        <button 
                          className="btn-action" 
                          onClick={() => handleEvaluate(student)}
                          title="Évaluer"
                        >
                          <FaStar />
                        </button>
                        <button 
                          className="btn-action" 
                          onClick={() => handleViewReports(student)}
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
                  className="pagination-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => goToPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  className="pagination-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FaChevronRight />
                </button>
                
                <span className="pagination-info">
                  {filteredStudents.length} étudiant{filteredStudents.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== MODAL VIEW STUDENT ===== */}
      <ViewStudentModal
        student={selectedStudent}
        isOpen={modalViewOpen}
        onClose={closeViewModal}
      />
    </div>
  );
}

export default EnseignantEtudiants;