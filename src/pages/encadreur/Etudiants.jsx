import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch, FaTimes, FaUsers } from 'react-icons/fa';
import { getApiErrorMessage } from '../../api/apiClient';
import encadreurService from '../../services/encadreurService';
import { useAuth } from '../../hooks/useAuth';

const statusLabels = { A_VENIR: 'À venir', EN_COURS: 'En cours', TERMINE: 'Terminé', SUSPENDU: 'Suspendu', ANNULE: 'Annulé' };
const statusClasses = { A_VENIR: 'status-en-attente', EN_COURS: 'status-en-cours', TERMINE: 'status-termine', SUSPENDU: 'status-suspendu', ANNULE: 'status-suspendu' };

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
  : 'Non renseignée';

const getProgress = (stage, now) => {
  if (!stage) return 0;
  if (stage.statut === 'TERMINE') return 100;
  if (stage.statut !== 'EN_COURS') return 0;
  const start = new Date(stage.dateDebut).getTime();
  const end = new Date(stage.dateFin).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.min(99, Math.max(1, Math.round(((now - start) / (end - start)) * 100)));
};

const getStudentName = (student) =>
  [student.user?.nom, student.user?.prenom].filter(Boolean).join(' ') || 'Étudiant';

const stagePriority = { EN_COURS: 0, A_VENIR: 1, SUSPENDU: 2, TERMINE: 3, ANNULE: 4 };

function EncadreurEtudiants() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [stages, setStages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('tous');
  const [selectedFormation, setSelectedFormation] = useState('toutes');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [now] = useState(() => Date.now());
  const itemsPerPage = 8;

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true);
        const { data: supervisor } = await encadreurService.getMe();
        const [studentsResponse, stagesResponse] = await Promise.all([
          encadreurService.getStudents(supervisor.id),
          encadreurService.getInternships(supervisor.id),
        ]);
        setStudents(studentsResponse.data || []);
        setStages(stagesResponse.data.data || []);
        setError('');
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Impossible de charger vos étudiants.'));
      } finally {
        setIsLoading(false);
      }
    };
    if (user) loadStudents();
  }, [user]);

  const rows = useMemo(() => {
    const stagesByStudent = new Map();
    stages.forEach((stage) => {
      const current = stagesByStudent.get(stage.student?.id) || [];
      stagesByStudent.set(stage.student?.id, [...current, stage]);
    });
    return students.map((student) => {
      const studentStages = stagesByStudent.get(student.id) || [];
      const stage = [...studentStages].sort((first, second) => {
        const priorityDifference = (stagePriority[first.statut] ?? 99) - (stagePriority[second.statut] ?? 99);
        if (priorityDifference !== 0) return priorityDifference;
        return new Date(second.dateDebut || 0).getTime() - new Date(first.dateDebut || 0).getTime();
      })[0] || null;
      return { student, stage, id: `${student.id}-${stage?.id || 'sans-stage'}` };
    });
  }, [students, stages]);

  const promotions = useMemo(() => ['tous', ...new Set(students.map((student) => student.promotion).filter(Boolean))], [students]);
  const formations = useMemo(() => ['toutes', ...new Set(students.map((student) => student.formation).filter(Boolean))], [students]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows.filter(({ student, stage }) => {
      const searchable = [getStudentName(student), student.matricule, student.formation, student.promotion, stage?.company?.nom, stage?.domaine, stage?.intitule].filter(Boolean).join(' ').toLowerCase();
      const statusMatches = selectedStatus === 'tous' || stage?.statut === selectedStatus || (!stage && selectedStatus === 'A_VENIR');
      return (term === '' || searchable.includes(term)) &&
        (selectedPromotion === 'tous' || student.promotion === selectedPromotion) &&
        (selectedFormation === 'toutes' || student.formation === selectedFormation) && statusMatches;
    });
  }, [rows, searchTerm, selectedPromotion, selectedFormation, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const visibleRows = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const updateFilter = (setter) => (event) => { setter(event.target.value); setCurrentPage(1); };
  const initials = (student) => `${student.user?.prenom?.[0] || ''}${student.user?.nom?.[0] || ''}`.toUpperCase() || 'ET';

  return (
    <div className="encadreur-etudiants">
      <div className="page-header"><div><h1><FaUsers /> Mes étudiants</h1><p className="text-muted">Étudiants dont vous assurez le suivi</p></div></div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="toolbar-filters">
            <div className="filter-group"><FaFilter className="filter-icon" /><select value={selectedPromotion} onChange={updateFilter(setSelectedPromotion)}><option value="tous">Toutes promotions</option>{promotions.slice(1).map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
            <div className="filter-group"><FaFilter className="filter-icon" /><select value={selectedFormation} onChange={updateFilter(setSelectedFormation)}><option value="toutes">Toutes formations</option>{formations.slice(1).map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
            <div className="filter-group"><FaFilter className="filter-icon" /><select value={selectedStatus} onChange={updateFilter(setSelectedStatus)}><option value="tous">Tous les statuts</option><option value="A_VENIR">À venir</option><option value="EN_COURS">En cours</option><option value="TERMINE">Terminé</option><option value="SUSPENDU">Suspendu</option></select></div>
          </div>
          <div className="search-wrapper"><div className="search-group"><FaSearch className="search-icon" /><input type="search" className="search-input" placeholder="Rechercher un étudiant, une entreprise..." value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} />{searchTerm && <button type="button" className="search-clear" onClick={() => { setSearchTerm(''); setCurrentPage(1); }} aria-label="Effacer la recherche"><FaTimes /></button>}</div></div>
        </div>
        {isLoading ? <div className="empty-state"><p>Chargement de vos étudiants...</p></div> : visibleRows.length === 0 ? <div className="empty-state"><FaUsers className="empty-icon" /><h3>Aucun étudiant trouvé</h3><p>Modifiez les filtres ou vérifiez vos affectations.</p></div> : <div className="students-table-scroll"><table className="students-table"><thead><tr><th>Étudiant</th><th>Formation</th><th>Promotion</th><th>Entreprise</th><th>Domaine du stage</th><th>Dates</th><th>Statut</th><th>Progression</th><th>Action</th></tr></thead><tbody>{visibleRows.map(({ student, stage, id }) => { const progress = getProgress(stage, now); return <tr key={id}><td><div className="student-cell"><span className="student-avatar">{initials(student)}</span><div><strong>{student.user?.nom || 'Nom non renseigné'}</strong><span>{student.user?.prenom || 'Prénom non renseigné'}</span><small>{student.matricule || 'Matricule non renseigné'}</small></div></div></td><td>{student.formation || 'Non renseignée'}</td><td>{student.promotion || 'Non renseignée'}</td><td>{stage?.company?.nom || 'Non affectée'}</td><td>{stage?.domaine || 'Non renseigné'}{stage?.intitule && <small>{stage.intitule}</small>}</td><td><span className="date-text">{formatDate(stage?.dateDebut)}</span><small>{formatDate(stage?.dateFin)}</small></td><td><span className={`status-badge ${statusClasses[stage?.statut || 'A_VENIR']}`}>{statusLabels[stage?.statut || 'A_VENIR']}</span></td><td><div className="student-progress"><strong>{progress}%</strong><div><i style={{ width: `${progress}%` }} /></div></div></td><td><button type="button" className="follow-button" onClick={() => navigate(`/encadreur/etudiant/${student.id}`)}>Voir le suivi</button></td></tr>; })}</tbody></table></div>}
        {filteredRows.length > 0 && <div className="pagination"><span className="page-info">{filteredRows.length} étudiant{filteredRows.length > 1 ? 's' : ''}</span><button type="button" className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>Précédent</button><span className="page-number">Page {currentPage} / {totalPages}</span><button type="button" className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>Suivant</button></div>}
      </div>
    </div>
  );
}

export default EncadreurEtudiants;
