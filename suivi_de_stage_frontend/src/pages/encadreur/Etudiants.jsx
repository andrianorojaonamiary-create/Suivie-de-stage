import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaUserGraduate, FaEye, FaStar, FaFileAlt, 
  FaSearch, FaFilter, FaChevronLeft, FaChevronRight, 
  FaClock, FaCheckCircle, FaTimes, FaGraduationCap, 
  FaComment
} from 'react-icons/fa';
import { studentsApi } from '../../api';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

function EncadreurEtudiants() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('tous');
  const [selectedNiveau, setSelectedNiveau] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(true);

  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await studentsApi.getAll();
        const list = res?.items || [];
        const mapped = list.map(item => ({
          id: item.id,
          nom: `${item.user?.prenom || ''} ${item.user?.nom || ''}`.trim() || 'Étudiant',
          matricule: item.matricule || '—',
          filiere: item.formation || 'Non renseigné',
          niveau: item.niveau || 'Non renseigné',
          stage: { id: 0, titre: 'Aucun stage', entreprise: '', statut: 'En attente', dateDebut: null, dateFin: null, progression: 0 },
          evaluation: 'À faire',
          rapports: 0
        }));
        setStudents(mapped);
      } catch (err) {
        console.error('Erreur chargement étudiants encadreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const stats = {
    total: students.length,
    enStage: 0,
    termines: 0,
    aEvaluer: students.filter(s => s.evaluation === 'À faire' || s.evaluation === 'À corriger').length
  };

  const filieres = ['tous', ...new Set(students.map(s => s.filiere))].map(v => ({ value: v, label: v === 'tous' ? 'Toutes filières' : v }));
  const niveaux = ['tous', ...new Set(students.map(s => s.niveau))].map(v => ({ value: v, label: v === 'tous' ? 'Tous niveaux' : v }));

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

  const goToStudentDetail = (studentId) => {
    navigate(`/encadreur/etudiant/${studentId}`);
  };

  const goToEvaluations = (studentId) => {
    navigate(`/encadreur/evaluations/${studentId}`);
  };

  const goToRapports = (studentId) => {
    navigate(`/encadreur/rapports/${studentId}`);
  };

  const goToObservations = (studentId) => {
    navigate(`/encadreur/observations/${studentId}`);
  };

  return (
    <div className="encadreur-etudiants">
      <div className="page-header">
        <div>
          <h1>Mes étudiants</h1>
          <p className="text-muted">{students.length} étudiants encadrés</p>
        </div>
      </div>

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

      <div className="table-container">
        <div className="table-toolbar">
          <div className="toolbar-filters">
            <div className="filter-wrapper">
              <div className="filter-group">
                <FaFilter className="filter-icon" />
                <SelectPersonnalise
                  value={selectedFiliere}
                  onChange={(v) => handleFilterChange('filiere', v)}
                  options={filieres}
                />
              </div>
            </div>
            <div className="filter-wrapper">
              <div className="filter-group">
                <FaGraduationCap className="filter-icon" />
                <SelectPersonnalise
                  value={selectedNiveau}
                  onChange={(v) => handleFilterChange('niveau', v)}
                  options={niveaux}
                />
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
                        <button 
                          className="action-btn view" 
                          onClick={() => goToStudentDetail(student.id)}
                          title="Voir les détails"
                        >
                          <FaEye />
                        </button>
                        <button 
                          className="action-btn eval" 
                          onClick={() => goToEvaluations(student.id)}
                          title="Évaluer"
                        >
                          <FaStar />
                        </button>
                        <button 
                          className="action-btn report" 
                          onClick={() => goToRapports(student.id)}
                          title="Voir les rapports"
                        >
                          <FaFileAlt />
                        </button>
                        <button 
                          className="action-btn observe" 
                          onClick={() => goToObservations(student.id)}
                          title="Observations"
                        >
                          <FaComment />
                        </button>
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

export default EncadreurEtudiants;