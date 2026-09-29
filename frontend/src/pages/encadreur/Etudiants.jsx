import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  FaUsers, FaUserGraduate, FaEye, FaStar, FaFileAlt, 
  FaSearch, FaFilter, FaChevronLeft, FaChevronRight, 
  FaClock, FaCheckCircle, FaTimes, FaGraduationCap, 
  FaComment
} from 'react-icons/fa';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import { internshipsApi } from '../../api';
import { extractList } from '../../api/listResult';
import { getApiErrorMessage } from '../../api/apiClient';

const STATUT_LABELS = {
  A_VENIR: 'À venir',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  SUSPENDU: 'Suspendu',
  ANNULE: 'Annulé'
};

function EncadreurEtudiants() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomaine, setSelectedDomaine] = useState('tous');
  const [selectedStatut, setSelectedStatut] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const itemsPerPage = 5;

  // Les Étudiants encadrés sont déduits des stages dont l'encadreur connecté
  // est affecté : GET /internships est déjà restreint à ses propres stages côté
  // serveur. L'affectation se fait au niveau du stage, pas de l'Étudiant, donc
  // un Étudiant ayant eu plusieurs encadreurs apparaîtreont une fois par stage.
  const [students, setStudents] = useState([]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await internshipsApi.getAll();
      const stages = extractList(res);

      setStudents(
        stages
          .filter(stage => stage.student)
          .map(stage => ({
            id: stage.student.id,
            nom: `${stage.student.user?.prenom ?? ''} ${stage.student.user?.nom ?? ''}`.trim() || stage.student.matricule || '',
            matricule: stage.student.matricule || '',
            domaine: stage.domaine || '',
            stage: {
              id: stage.id,
              titre: stage.intitule || 'Sans intitulé',
              entreprise: stage.company?.nom || '',
              statut: STATUT_LABELS[stage.statut] || stage.statut,
              dateDebut: stage.dateDebut,
              dateFin: stage.dateFin,
              progression: stage.statut === 'TERMINE' ? 100 : stage.statut === 'EN_COURS' ? 50 : 0
            }
          }))
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erreur de chargement des Étudiants'));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const stats = {
    total: students.length,
    enStage: students.filter(s => s.stage.statut === 'En cours' || s.stage.statut === 'À venir').length,
    termines: students.filter(s => s.stage.statut === 'Terminé').length
  };

  const domaines = ['tous', ...new Set(students.map(s => s.domaine))].map(v => ({ value: v, label: v === 'tous' ? 'Tous domaines' : v }));
  const statuts = ['tous', ...new Set(students.map(s => s.stage.statut))].map(v => ({ value: v, label: v === 'tous' ? 'Tous les statuts' : v }));

  const filteredStudents = students.filter(s => {
    if (selectedDomaine !== 'tous' && s.domaine !== selectedDomaine) return false;
    if (selectedStatut !== 'tous' && s.stage.statut !== selectedStatut) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      return s.nom.toLowerCase().includes(term) ||
             s.matricule.toLowerCase().includes(term) ||
             s.domaine.toLowerCase().includes(term);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (key, value) => {
    if (key === 'domaine') setSelectedDomaine(value);
    if (key === 'statut') setSelectedStatut(value);
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
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'En cours': { className: 'status-badge status-en-cours', label: 'En cours' },
      'À venir': { className: 'status-badge status-en-attente', label: '? venir' },
      'Terminé': { className: 'status-badge status-termine', label: 'Terminé' },
      'Suspendu': { className: 'status-badge status-en-attente', label: 'Suspendu' },
      'Annulé': { className: 'status-badge status-refuse', label: 'Annulé' }
    };
    const badge = badges[statut] || badges['À venir'];
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

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="encadreur-etudiants">
      <div className="page-header">
        <div>
          <h1>Mes Étudiants</h1>
          <p className="text-muted">{students.length} Étudiant(s) encadré(s)</p>
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
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="toolbar-filters">
            <div className="filter-wrapper">
              <div className="filter-group">
                <FaFilter className="filter-icon" />
                <SelectPersonnalise
                  value={selectedDomaine}
                  onChange={(v) => handleFilterChange('domaine', v)}
                  options={domaines}
                />
              </div>
            </div>
            <div className="filter-wrapper">
              <div className="filter-group">
                <FaGraduationCap className="filter-icon" />
                <SelectPersonnalise
                  value={selectedStatut}
                  onChange={(v) => handleFilterChange('statut', v)}
                  options={statuts}
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

        {loading ? (
          <div className="text-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement&</span>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <FaUsers className="empty-icon" />
            <h3>Aucun Étudiant trouvé</h3>
            <p className="text-muted">
              Les Étudiants apparaissent ici dé qu'un stage vous est affecté.
            </p>
          </div>
        ) : (
          <>
            <table className="students-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Domaine</th>
                  <th>Stage</th>
                  <th>Période</th>
                  <th>Statut</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student.stage.id}>
                    <td>
                      <div className="student-cell">
                        <span className="student-name">{student.nom}</span>
                        <span className="student-matricule">{student.matricule}</span>
                      </div>
                    </td>
                    <td>
                      <div className="filiere-cell">
                        <span className="filiere-name">{student.domaine}</span>
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
                  {filteredStudents.length} Étudiant{filteredStudents.length > 1 ? 's' : ''}
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
