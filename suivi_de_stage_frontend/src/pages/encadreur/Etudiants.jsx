import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers, FaUserGraduate, FaEye, FaStar, FaFileAlt,
  FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaClock, FaCheckCircle, FaTimes, FaGraduationCap,
  FaComment
} from 'react-icons/fa';
import { studentsApi, internshipsApi, reportsApi, evaluationsApi } from '../../api';
import mapInternship from '../../utils/internshipMapping';
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
      setLoading(true);
      const [stagesRes, studentsRes, reportsRes] = await Promise.allSettled([
        internshipsApi.getAll({ limit: 100 }),
        studentsApi.getAll({ limit: 100 }),
        reportsApi.getAll({ limit: 100 }),
      ]);

      const stages = stagesRes.status === 'fulfilled'
        ? (stagesRes.value?.data || (Array.isArray(stagesRes.value) ? stagesRes.value : []))
        : [];
      const studentList = studentsRes.status === 'fulfilled'
        ? (studentsRes.value?.items || studentsRes.value?.data || (Array.isArray(studentsRes.value) ? studentsRes.value : []))
        : [];
      const rapports = reportsRes.status === 'fulfilled'
        ? (reportsRes.value?.items || reportsRes.value?.data || (Array.isArray(reportsRes.value) ? reportsRes.value : []))
        : [];

      const infosById = new Map(studentList.map((s) => [s.id, s]));
      const stagesByStudent = new Map();
      stages.forEach((s) => {
        const sid = s.student?.id;
        if (!sid) return;
        if (!stagesByStudent.has(sid)) stagesByStudent.set(sid, []);
        stagesByStudent.get(sid).push(s);
      });

      const prefer = (list) => {
        const order = ['EN_COURS', 'TERMINE', 'A_VENIR'];
        for (const statut of order) {
          const found = list.find((s) => s.statut === statut);
          if (found) return found;
        }
        return list[0];
      };

      const evalByStage = new Map();
      const uniqueStageIds = [...new Set(stages.map((s) => s.id))];
      await Promise.all(
        uniqueStageIds.map(async (stageId) => {
          try {
            const ev = await evaluationsApi.getByInternship(stageId);
            evalByStage.set(stageId, Array.isArray(ev) ? ev : ev?.data || []);
          } catch {
            evalByStage.set(stageId, []);
          }
        }),
      );

      const deriveEval = (statutApi, evals) => {
        if (!statutApi) return '—';
        if (evals && evals.length > 0) {
          return evals.some((ev) => ev.validee) ? 'Validé' : 'À faire';
        }
        return statutApi === 'EN_COURS' || statutApi === 'TERMINE' ? 'À faire' : '—';
      };

      const mapped = [...stagesByStudent.entries()].map(([studentId, list]) => {
        const info = infosById.get(studentId);
        const stage = prefer(list);
        const m = mapInternship(stage);
        const student = stage.student?.user
          ? `${stage.student.user.prenom ?? ''} ${stage.student.user.nom ?? ''}`.trim()
          : 'Étudiant';
        const nbRapports = rapports.filter(
          (r) => String(r.stage?.etudiantId) === String(studentId)
        ).length;
        const evaluation = deriveEval(m.statutApi, evalByStage.get(stage.id) || []);
        return {
          id: studentId,
          nom: info ? `${info.user?.prenom || ''} ${info.user?.nom || ''}`.trim() || student : student,
          matricule: info?.matricule || '—',
          filiere: stage.student?.formation || info?.formation || 'Non renseigné',
          niveau: stage.student?.niveau || info?.niveau || 'Non renseigné',
          stage: {
            id: m.id,
            titre: m.titre,
            entreprise: m.entreprise,
            statut: m.statut,
            statutApi: m.statutApi,
            dateDebut: m.dateDebut,
            dateFin: m.dateFin,
            progression: m.progression,
          },
          evaluation,
          rapports: nbRapports,
        };
      });

      setStudents(mapped);
      setLoading(false);
    };
    fetchStudents();
  }, []);

  const stats = {
    total: students.length,
    enStage: students.filter((s) => s.stage.statutApi === 'EN_COURS').length,
    termines: students.filter((s) => s.stage.statutApi === 'TERMINE').length,
    aEvaluer: students.filter((s) => s.evaluation === 'À faire').length,
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
      'En attente de validation': { className: 'status-badge status-en-attente', label: 'En attente' },
      'En attente': { className: 'status-badge status-en-attente', label: 'En attente' },
      'À venir': { className: 'status-badge status-en-attente', label: 'À venir' },
      'Terminé': { className: 'status-badge status-termine', label: 'Terminé' },
      'Validé': { className: 'status-badge status-valide', label: 'Validé' },
      'Refusé': { className: 'status-badge status-refuse', label: 'Refusé' },
      'Suspendu': { className: 'status-badge status-refuse', label: 'Suspendu' },
      'Annulé': { className: 'status-badge status-refuse', label: 'Annulé' },
    };
    const badge = badges[statut] || badges['En attente'];
    return <span className={badge.className}>{badge.label}</span>;
  };

  const getEvalBadge = (evalStatus) => {
    if (evalStatus === '—') {
      return <span className="eval-badge eval-neutral">—</span>;
    }
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

        {loading ? (
          <div className="empty-state">
            <FaUsers className="empty-icon" />
            <h3>Chargement…</h3>
          </div>
        ) : filteredStudents.length === 0 ? (
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