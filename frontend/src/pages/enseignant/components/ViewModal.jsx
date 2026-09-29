import { useState, useEffect } from 'react';
import { 
  FaTimes, FaInfoCircle, FaUserGraduate, FaFileAlt, 
  FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaUserTie,
  FaPercent, FaComment, FaCheckCircle, FaTimesCircle, FaClock,
  FaHistory
} from 'react-icons/fa';
import { internshipsApi } from '../../../api';
import { getApiErrorMessage } from '../../../api/apiClient';

const fullName = (person) =>
  person ? `${person.prenom ?? ''} ${person.nom ?? ''}`.trim() : null;

function ViewModal({ stage, isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  /**
   * Historique des affectations  consultation seule.
   *
   * L'enseignant suit l'affectation mais ne la dçide pas : la route
   * GET /internships/:id/historique-encadreurs l'autorise en lecture, et aucun
   * bouton de modification n'est proposé ici. L'affectation elle-même reste
   * réservée à l'administrateur (PATCH /internships/:id/supervisor).
   */
  useEffect(() => {
    if (!isOpen || !stage?.id) return;
    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError('');
      try {
        const res = await internshipsApi.getSupervisorHistory(stage.id);
        if (!cancelled) setHistory(Array.isArray(res) ? res : res?.data || []);
      } catch (err) {
        if (!cancelled) {
          setHistoryError(getApiErrorMessage(err, 'Erreur de chargement de l\'historique'));
          setHistory([]);
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    loadHistory();
    return () => { cancelled = true; };
  }, [isOpen, stage?.id]);

  if (!isOpen || !stage) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'valide': { className: 'badge-view badge-valide', icon: <FaCheckCircle />, label: 'Validé' },
      'refuse': { className: 'badge-view badge-refuse', icon: <FaTimesCircle />, label: 'Refusé' },
      'en_attente': { className: 'badge-view badge-en-attente', icon: <FaClock />, label: 'En attente' }
    };
    const badge = badges[statut] || badges.en_attente;
    return <span className={`badge-view ${badge.className}`}>{badge.icon} {badge.label}</span>;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaInfoCircle className="modal-icon-view" /> Détails du stage</h2>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        
        <div className="modal-body">
          {/* ===== ÉTUDIANT ===== */}
          <div className="view-row">
            <span className="view-label"><FaUserGraduate /> Étudiant</span>
            <span className="view-value"><strong>{stage.etudiant}</strong></span>
          </div>

          {/* ===== TITRE ===== */}
          <div className="view-row">
            <span className="view-label"><FaFileAlt /> Titre du stage</span>
            <span className="view-value">{stage.titre}</span>
          </div>

          {/* ===== ENTREPRISE ===== */}
          <div className="view-row">
            <span className="view-label"><FaBuilding /> Entreprise</span>
            <span className="view-value">{stage.entreprise}</span>
          </div>

          {/* ===== VILLE ===== */}
          <div className="view-row">
            <span className="view-label"><FaMapMarkerAlt /> Ville</span>
            <span className="view-value">{stage.ville}</span>
          </div>

          {/* ===== PréRIODE ===== */}
          <div className="view-row">
            <span className="view-label"><FaCalendarAlt /> Période</span>
            <span className="view-value">{formatDate(stage.dateDebut)} → {formatDate(stage.dateFin)}</span>
          </div>

          {/* ===== TUTEUR ===== */}
          <div className="view-row">
            <span className="view-label"><FaUserTie /> Tuteur pédagogique</span>
            <span className="view-value">{stage.tuteur || 'Non renseigné'}</span>
          </div>

          {/* ===== ENCADREUR ===== */}
          <div className="view-row">
            <span className="view-label"><FaUserTie /> Maître de stage</span>
            <span className="view-value">{stage.encadreur || 'Non renseigné'}</span>
          </div>

          {/* ===== PROGRESSION ===== */}
          <div className="view-row">
            <span className="view-label"><FaPercent /> Progression</span>
            <span className="view-value">
              <div className="progress-bar-view">
                <div className="progress-fill-view" style={{ width: `${stage.progression || 0}%` }} />
              </div>
              <span className="progress-text-view">{stage.progression || 0}%</span>
            </span>
          </div>

          {/* ===== DESCRIPTION ===== */}
          <div className="view-row view-description">
            <span className="view-label"><FaInfoCircle /> Description</span>
            <span className="view-value view-description-text">{stage.description || 'Non renseignée'}</span>
          </div>

          {/* ===== COMMENTAIRE ===== */}
          {stage.commentaireValidation && (
            <div className="view-row view-comment">
              <span className="view-label"><FaComment /> Commentaire</span>
              <span className="view-value view-comment-text">{stage.commentaireValidation}</span>
            </div>
          )}

          {/* ===== STATUT ===== */}
          <div className="view-row view-status">
            <span className="view-label">Statut</span>
            <span className="view-value">{getStatusBadge(stage.statutValidation)}</span>
          </div>

          {/* ===== HISTORIQUE DES ENCADREURS (lecture seule) ===== */}
          <div className="view-row">
            <span className="view-label"><FaHistory /> Historique des encadreurs</span>
            <span className="view-value">
              {historyLoading ? (
                <span className="text-muted">Chargement&</span>
              ) : historyError ? (
                <span className="text-muted">{historyError}</span>
              ) : history.length === 0 ? (
                <span className="text-muted">Aucune affectation enregistrée.</span>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {history.map((entry) => (
                    <li key={entry.id} className="text-muted" style={{ marginBottom: 4 }}>
                      {new Date(entry.dateAffectation).toLocaleString('fr-FR')}
                      {'  '}
                      {fullName(entry.ancienSupervisor) || 'affectation initiale'}
                      {' → '}
                      {fullName(entry.nouveauSupervisor) || ''}
                      {entry.affectedBy && ` (par ${fullName(entry.affectedBy)})`}
                    </li>
                  ))}
                </ul>
              )}
            </span>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewModal;