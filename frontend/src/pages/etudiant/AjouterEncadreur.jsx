import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaUserTie, FaBuilding, FaCalendarAlt, FaInfoCircle,
  FaTimes, FaArrowLeft
} from 'react-icons/fa';
import { internshipsApi } from '../../api';
import { extractList } from '../../api/listResult';
import { getApiErrorMessage } from '../../api/apiClient';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('fr-FR') : '';

/**
 * Consultation d'un encadreur  lecture seule.
 *
 * Cette page était un formulaire par lequel l'Étudiant saisissait, modifiait et
 * supprimait son encadreur, sans appel API (un simple setTimeout suivi d'un
 * alert). Elle ne pouvait donc rien enregistrer, et contredisait la règle
 * À seul l'administrateur affecte un encadreur à. Elle n'affiche plus que
 * l'encadreur du stage, les champs de saisie et les boutons d'action ayant été
 * retiré.
 */
function AjouterEncadreur() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [encadreur, setEncadreur] = useState(null);
  const [stage, setStage] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await internshipsApi.getAll();
      const stages = extractList(res);

      // L'identifiant de route reste celui d'un stage ; l'encadreur affiché
      // est toujours celui du stage, jamais celui de l'Étudiant.
      const current = id
        ? stages.find(s => s.id === id)
        : stages.find(s => s.statut === 'EN_COURS') ??
          stages.find(s => s.statut === 'A_VENIR') ??
          stages[0] ??
          null;

      setStage(current);
      setEncadreur(current?.supervisor ?? null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erreur de chargement de l\'encadreur'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement&</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="etudiant-form-page">
      <div className="form-header">
        <button className="btn-back" onClick={() => navigate('/etudiant/encadreur')}>
          <FaArrowLeft /> Retour
        </button>
        <h1>Consulter l'encadreur</h1>
        <p className="text-muted">
          Les informations de votre encadreur, en lecture seule
        </p>
      </div>

      <div className="form-card">
        {encadreur ? (
          <div className="form-row">
            <div className="form-group">
              <label><FaUserTie /> Nom</label>
              <input type="text" value={encadreur.user?.nom || ''} readOnly disabled />
            </div>
            <div className="form-group">
              <label><FaUserTie /> Prénom</label>
              <input type="text" value={encadreur.user?.prenom || ''} readOnly disabled />
            </div>
            <div className="form-group">
              <label><FaInfoCircle /> Fonction</label>
              <input type="text" value={encadreur.fonction || ''} readOnly disabled />
            </div>
            <div className="form-group">
              <label><FaBuilding /> Entreprise</label>
              <input type="text" value={stage?.company?.nom || ''} readOnly disabled />
            </div>
            <div className="form-group full-width">
              <label><FaUserTie /> Spécialité</label>
              <input type="text" value={encadreur.specialite || ''} readOnly disabled />
            </div>
            <div className="form-group full-width">
              <label><FaCalendarAlt /> Stage encadré</label>
              <input
                type="text"
                value={
                  stage
                    ? `${stage.intitule}  ${formatDate(stage.dateDebut)} → ${formatDate(stage.dateFin)}`
                    : ''
                }
                readOnly
                disabled
              />
            </div>
          </div>
        ) : (
          <p className="text-muted">
            Aucun encadreur affecté pour le moment. L'administration ràlise
            l'affectation une fois votre stage déclaré.
          </p>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/etudiant/encadreur')}
          >
            <FaTimes /> Retour
          </button>
        </div>
      </div>
    </div>
  );
}

export default AjouterEncadreur;
