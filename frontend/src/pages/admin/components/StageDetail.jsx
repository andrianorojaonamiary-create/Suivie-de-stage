// src/pages/admin/components/StageDetail.jsx
import { useState, useEffect } from 'react';
import {
  FaTimes, FaList, FaUserGraduate, FaBuilding, FaUserTie,
  FaCalendarAlt, FaClock, FaExchangeAlt, FaHistory
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import internshipsApi from '../../../api/internshipsApi';
import { getApiErrorMessage } from '../../../api/apiClient';
import SelectPersonnalise from '../../../components/Common/SelectPersonnalise';

const formatDate = (value) =>
  value ? new Date(value).toLocaleString('fr-FR') : '';

const fullName = (person) =>
  person ? `${person.prenom ?? ''} ${person.nom ?? ''}`.trim() : null;

/**
 * Fiche détaille d'un stage, avec les outils d'affectation.
 *
 * Réservée à l'administrateur : c'est le seul rôle autorisé à changer
 * l'encadreur. L'enseignant dispose d'une consultation de l'historique dans
 * ses propres pages, sans aucune action.
 */
function StageDetail({ stage, onClose }) {
  const [supervisorOptions, setSupervisorOptions] = useState([]);
  const [supervisorLoading, setSupervisorLoading] = useState(false);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const currentSupervisorId = stage?.supervisorId || '';

  const loadSupervisors = async () => {
    try {
      setSupervisorLoading(true);
      const res = await internshipsApi.getAvailableSupervisors({
        excludeInternshipId: stage.id
      });
      const list = Array.isArray(res) ? res : res?.data || [];
      setSupervisorOptions(
        list.map(s => ({
          value: s.id,
          label: `${s.prenom} ${s.nom}  ${s.stagesActifs}/${s.maxStages}`,
          // Un encadreur à la limite reste listé mais non sélectionnable : c'est
          // plus parlant que de le faire disparaître du sélecteur.
          disabled: !s.disponible
        }))
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur de chargement des encadreurs'));
    } finally {
      setSupervisorLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await internshipsApi.getSupervisorHistory(stage.id);
      setHistory(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur de chargement de l\'historique'));
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadSupervisors();
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage?.id]);

  if (!stage) return null;

  const getStatusBadge = (statut) => {
    const classes = {
      'À venir': 'badge-a-venir',
      'En cours': 'badge-en-cours',
      'Terminé': 'badge-termine'
    };
    return classes[statut] || 'badge-en-cours';
  };

  const handleChangeSupervisor = async () => {
    if (!selectedSupervisorId || selectedSupervisorId === currentSupervisorId) return;
    try {
      setSaving(true);
      await internshipsApi.changeSupervisor(stage.id, selectedSupervisorId);
      toast.success('Encadreur du stage modifié');
      setSelectedSupervisorId('');
      await loadHistory();
      await loadSupervisors();
      // La liste parente recharge ses données à la fermeture de la fiche.
      onClose?.();
    } catch (err) {
      // 409 = limite de 10 atteinte. Le message du serveur est explicite, il
      // est donc remonté tel quel plutôt que masqué.
      toast.error(getApiErrorMessage(err, 'Erreur de changement d\'encadreur'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><FaList /> Détail du stage</h3>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item" style={{ gridColumn: 'span 2' }}>
              <label>Titre</label>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{stage.titre}</span>
            </div>
            <div className="detail-item">
              <label>Étudiant</label>
              <span><FaUserGraduate /> {stage.etudiant}</span>
            </div>
            <div className="detail-item">
              <label>Entreprise</label>
              <span><FaBuilding /> {stage.entreprise}</span>
            </div>
            <div className="detail-item">
              <label>Encadreur</label>
              <span><FaUserTie /> {stage.encadreur}</span>
            </div>
            <div className="detail-item">
              <label>Domaine</label>
              <span>{stage.domaine}</span>
            </div>
            <div className="detail-item">
              <label>Période</label>
              <span><FaCalendarAlt /> {stage.dateDebut} → {stage.dateFin}</span>
            </div>
            <div className="detail-item">
              <label>Statut</label>
              <span className={getStatusBadge(stage.statut)}>{stage.statut}</span>
            </div>
            <div className="detail-item">
              <label>Progression</label>
              <span><FaClock /> {stage.progression}%</span>
            </div>
          </div>

          {/* ===== AFFECTATION  administrateur uniquement ===== */}
          <div className="form-section">
            <h3 className="form-section-title"><FaExchangeAlt /> Changer l'encadreur</h3>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Nouvel encadreur</label>
                <SelectPersonnalise
                  value={selectedSupervisorId}
                  onChange={setSelectedSupervisorId}
                  placeholder={
                    supervisorLoading
                      ? 'Chargement des encadreurs...'
                      : 'Sélectionner un encadreur'
                  }
                  className="form-control"
                  options={supervisorOptions}
                />
                <small className="text-muted">
                  La charge entre parenthèses est le nombre de stages actifs sur
                  la limite de 10. Un encadreur à 10/10 est grisé.
                </small>
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={handleChangeSupervisor}
                disabled={
                  saving ||
                  supervisorLoading ||
                  !selectedSupervisorId ||
                  selectedSupervisorId === currentSupervisorId
                }
              >
                {saving ? 'Enregistrement...' : 'Valider l\'affectation'}
              </button>
            </div>
          </div>

          {/* ===== HISTORIQUE ===== */}
          <div className="form-section">
            <h3 className="form-section-title"><FaHistory /> Historique des encadreurs</h3>
            {historyLoading ? (
              <p className="text-muted">Chargement de l'historique&</p>
            ) : history.length === 0 ? (
              <p className="text-muted">Aucune affectation enregistrée.</p>
            ) : (
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Ancien encadreur</th>
                    <th>Nouvel encadreur</th>
                    <th>Par</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.dateAffectation)}</td>
                      <td>{fullName(entry.ancienSupervisor) || ' (affectation initiale)'}</td>
                      <td>{fullName(entry.nouveauSupervisor) || ''}</td>
                      <td>{fullName(entry.affectedBy) || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default StageDetail;
