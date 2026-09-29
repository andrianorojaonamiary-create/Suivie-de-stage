import { useState, useEffect } from 'react';
import { FaUserTie, FaBuilding, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
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

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('fr-FR') : '';

const fullName = (person) =>
  person ? `${person.prenom ?? ''} ${person.nom ?? ''}`.trim() : null;

/**
 * Page Mon encadreur  consultation uniquement.
 *
 * L'affectation d'un encadreur est faite par l'administrateur sur le stage :
 * un Étudiant ne peut ni choisir, ni remplacer, ni supprimer son encadreur.
 * Les actions d'ajout, de modification et de suppression qui figuraient ici ont
 * Été retirées, et la donne provient du stage en cours plutôt que d'une liste
 * d'encadreurs saisie par l'Étudiant.
 */
function MonEncadreur() {
  const [loading, setLoading] = useState(true);
  const [encadreur, setEncadreur] = useState(null);
  const [stage, setStage] = useState(null);
  const [error, setError] = useState('');

  const loadEncadreur = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await internshipsApi.getAll();
      const stages = extractList(res);

      // Un Étudiant peut avoir plusieurs stages : on montre celui en cours, à
      // défaut le plus rçent. L'encadreur est celui du stage, pas de l'Étudiant.
      const current =
        stages.find(s => s.statut === 'EN_COURS') ??
        stages.find(s => s.statut === 'A_VENIR') ??
        stages[0] ??
        null;

      setStage(current);
      setEncadreur(current?.supervisor ?? null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erreur de chargement de votre encadreur'));
      setEncadreur(null);
      setStage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEncadreur();
  }, []);

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

  if (!stage || !encadreur) {
    return (
      <div className="etudiant-encadreur-page">
        <div className="page-header">
          <div>
            <h1>Mon encadreur</h1>
            <p className="text-muted">Encadreur du stage en cours</p>
          </div>
        </div>
        <div className="empty-state">
          <p>Aucun encadreur affecté pour le moment</p>
          <p className="empty-sub">
            L'affectation est ràlise par l'administration une fois votre stage
            déclaré.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="etudiant-encadreur-page">
      <div className="page-header">
        <div>
          <h1>Mon encadreur</h1>
          <p className="text-muted">Encadreur de votre stage en cours</p>
        </div>
      </div>

      <div className="encadreur-grid">
        <div className="encadreur-card">
          <div className="encadreur-card-top">
            <div className="encadreur-avatar">
              <FaUserTie />
            </div>
            <div className="encadreur-info">
              <h3>{fullName(encadreur.user) || 'Encadreur'}</h3>
              <span className="encadreur-fonction">
                {encadreur.fonction || 'Fonction non renseignée'}
              </span>
            </div>
          </div>
          <div className="encadreur-card-middle">
            <p><FaBuilding /> {stage.company?.nom || 'Entreprise non renseignée'}</p>
            <p><FaCalendarAlt /> {stage.intitule}</p>
            <p>
              <FaInfoCircle /> {formatDate(stage.dateDebut)} → {formatDate(stage.dateFin)}
              {' '}({STATUT_LABELS[stage.statut] || stage.statut})
            </p>
            {encadreur.specialite && <p>Spécialité : {encadreur.specialite}</p>}
          </div>
        </div>
      </div>

      <p className="text-muted" style={{ marginTop: 16 }}>
        Pour tout changement d'encadreur, adressez-vous à l'administration.
      </p>
    </div>
  );
}

export default MonEncadreur;
