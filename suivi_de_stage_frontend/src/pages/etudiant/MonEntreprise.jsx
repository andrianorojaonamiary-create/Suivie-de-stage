import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe,
  FaPlus, FaEdit, FaTrash, FaEye
} from 'react-icons/fa';
import { internshipsApi, companiesApi } from '../../api';
import { mapInternshipList } from '../../utils/internshipMapping';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import { toast } from 'react-toastify';

function MonEntreprise() {
  const navigate = useNavigate();

  // ===== ÉTATS =====
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entrepriseToDelete, setEntrepriseToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stagesRes, companiesRes] = await Promise.allSettled([
          internshipsApi.getAll(),
          companiesApi.getAll({ limit: 100 }),
        ]);
        const stagesList = stagesRes.status === 'fulfilled'
          ? stagesRes.value?.data || (Array.isArray(stagesRes.value) ? stagesRes.value : [])
          : [];
        setStages(mapInternshipList(stagesList));
        const companiesList = companiesRes.status === 'fulfilled'
          ? companiesRes.value?.data || (Array.isArray(companiesRes.value) ? companiesRes.value : [])
          : [];
        setCompanies(companiesList);
      } catch (err) {
        console.error('Erreur chargement entreprise:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ===== STAGE SÉLECTIONNÉ + ENTREPRISE ASSOCIÉE =====
  const stageOptions = stages.map((stage) => ({
    value: stage.id,
    label: stage.titre,
  }));

  const selectedStage = stages.find((s) => s.id === selectedStageId) || stages[0] || null;

  const matchedCompany = selectedStage?.companyId
    ? companies.find((c) => c.id === selectedStage.companyId) || null
    : null;

  const entreprise = matchedCompany
    ? {
        id: matchedCompany.id,
        nom: matchedCompany.nom || selectedStage.entreprise || 'Entreprise',
        domaine: matchedCompany.secteurActivite || '',
        adresse: matchedCompany.adresse || '',
        ville: matchedCompany.ville || selectedStage.ville || 'Antananarivo',
        region: matchedCompany.region || '',
        telephone: matchedCompany.telephone || '',
        email: matchedCompany.email || '',
        siteWeb: matchedCompany.siteWeb || '',
        description: matchedCompany.description || '',
      }
    : {
        id: selectedStage?.companyId || null,
        nom: selectedStage?.entreprise || 'Entreprise',
        domaine: '',
        adresse: selectedStage?.adresse || '',
        ville: selectedStage?.ville || 'Antananarivo',
        region: '',
        telephone: '',
        email: '',
        siteWeb: '',
        description: '',
      };

  // ===== ACTIONS (masquées pour l'instant) =====
  const handleView = (id) => {
    navigate(`/etudiant/entreprise/voir/${id}`, { state: { entreprise: companies.find((e) => e.id === id) } });
  };

  const handleEdit = (entrepriseData) => {
    navigate('/etudiant/entreprise/modifier', { state: { entreprise: entrepriseData } });
  };

  const handleDeleteClick = (id) => {
    setEntrepriseToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (entrepriseToDelete) {
        await companiesApi.delete(entrepriseToDelete);
      }
      const entrepriseData = companies.find((e) => e.id === entrepriseToDelete);
      setCompanies(companies.filter((e) => e.id !== entrepriseToDelete));
      toast.success(`Entreprise "${entrepriseData?.nom}" supprimée !`);
    } catch (err) {
      console.error('Erreur suppression entreprise:', err);
      toast.error('Erreur lors de la suppression de l\'entreprise');
    } finally {
      setShowDeleteModal(false);
      setEntrepriseToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEntrepriseToDelete(null);
  };

  return (
    <div className="etudiant-entreprise-page">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <h1>Mon entreprise</h1>
          <p className="text-muted">
            {selectedStage
              ? `Entreprise associée au stage « ${selectedStage.titre} »`
              : 'Aucun stage associé'}
          </p>
        </div>
        <div className="entreprise-header-actions">
          <Link to="/etudiant/entreprise/ajouter" className="btn-primary">
            <FaPlus /> Ajouter une entreprise
          </Link>
        </div>
      </div>

      {/* ===== SÉLECTEUR DE STAGE (si plusieurs) ===== */}
      {stageOptions.length > 1 && (
        <div className="entreprise-stage-selector">
          <SelectPersonnalise
            value={selectedStageId}
            onChange={setSelectedStageId}
            options={stageOptions}
            placeholder="Choisir un stage"
          />
        </div>
      )}

      {/* ===== CONTENU ===== */}
      <div className="entreprise-grid">
        {loading && <p>Chargement...</p>}

        {!loading && stageOptions.length === 0 && (
          <div className="empty-state">
            <p>Aucun stage défini</p>
            <p className="empty-sub">Ajoutez votre stage pour associer votre entreprise d'accueil</p>
            <Link to="/etudiant/ajouter-stage" className="btn-primary">
              <FaPlus /> Ajouter un stage
            </Link>
          </div>
        )}

        {!loading && selectedStage && (
          <div className="entreprise-card">
            <div className="entreprise-card-top">
              <div className="entreprise-icon">
                <FaBuilding />
              </div>
              <div className="entreprise-info">
                <h3>{entreprise.nom}</h3>
                <span className="entreprise-domaine">{entreprise.domaine || 'Domaine non renseigné'}</span>
              </div>
            </div>
            <div className="entreprise-card-middle">
              <p><FaMapMarkerAlt /> {[entreprise.ville, entreprise.region].filter(Boolean).join(', ')}</p>
              {entreprise.adresse && <p><FaMapMarkerAlt /> {entreprise.adresse}</p>}
              <p><FaPhone /> {entreprise.telephone || 'Non renseigné'}</p>
              <p><FaEnvelope /> {entreprise.email || 'Non renseigné'}</p>
              {entreprise.siteWeb && <p><FaGlobe /> {entreprise.siteWeb}</p>}
              {entreprise.description && <p>{entreprise.description}</p>}
            </div>
            <div className="entreprise-card-actions">
              <button className="btn-action" onClick={() => handleView(entreprise.id)} title="Voir">
                <FaEye />
              </button>
              <button className="btn-action btn-edit" onClick={() => handleEdit(entreprise)} title="Modifier">
                <FaEdit />
              </button>
              <button className="btn-action btn-danger" onClick={() => handleDeleteClick(entreprise.id)} title="Supprimer">
                <FaTrash />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODALE DE SUPPRESSION ===== */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmer la suppression</h3>
            <p>Voulez-vous vraiment supprimer cette entreprise ? Cette action est irréversible.</p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={confirmDelete}>
                Supprimer
              </button>
              <button className="btn-secondary" onClick={cancelDelete}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonEntreprise;