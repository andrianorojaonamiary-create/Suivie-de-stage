import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, 
  FaPlus, FaEdit, FaTrash, FaEye
} from 'react-icons/fa';

function MonEntreprise() {
  const navigate = useNavigate();
  
  // ===== ÉTATS =====
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entrepriseToDelete, setEntrepriseToDelete] = useState(null);
  
  // ===== DONNÉES SIMULÉES =====
  const [entreprises, setEntreprises] = useState([
    {
      id: 1,
      nom: 'TechMada SARL',
      domaine: 'Technologies de l\'information',
      adresse: 'Lot II M 77, Antananarivo',
      ville: 'Antananarivo',
      telephone: '+261 34 12 345 67',
      email: 'contact@techmada.mg',
      site: 'www.techmada.mg',
      description: 'TechMada est une entreprise spécialisée dans le développement de solutions logicielles.',
      lat: -18.8792,
      lng: 47.5079
    }
  ]);

  // ===== ACTIONS =====
  const handleView = (id) => {
    navigate(`/etudiant/entreprise/voir/${id}`,{state:{entreprise: entreprises.find(e => e.id === id)}});
  };
  

  const handleEdit = (entreprise) => {
    // On passe les données via state
    navigate('/etudiant/entreprise/modifier', { state: { entreprise } });
  };

  const handleDeleteClick = (id) => {
    setEntrepriseToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const entreprise = entreprises.find(e => e.id === entrepriseToDelete);
    setEntreprises(entreprises.filter(e => e.id !== entrepriseToDelete));
    setShowDeleteModal(false);
    setEntrepriseToDelete(null);
    alert(`🗑️ Entreprise "${entreprise?.nom}" supprimée !`);
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
          <p className="text-muted">{entreprises.length} entreprise(s) enregistrée(s)</p>
        </div>
        <Link to="/etudiant/entreprise/ajouter" className="btn-primary">
          <FaPlus /> Ajouter une entreprise
        </Link>
      </div>

      {/* ===== GRILLE DES ENTREPRISES ===== */}
      <div className="entreprise-grid">
        {entreprises.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <p>Aucune entreprise enregistrée</p>
            <p className="empty-sub">Ajoutez votre entreprise d'accueil</p>
            <Link to="/etudiant/entreprise/ajouter" className="btn-primary">
              <FaPlus /> Ajouter
            </Link>
          </div>
        ) : (
          entreprises.map((entreprise) => (
            <div key={entreprise.id} className="entreprise-card">
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
                <p><FaMapMarkerAlt /> {entreprise.ville}</p>
                <p><FaPhone /> {entreprise.telephone || 'Non renseigné'}</p>
                <p><FaEnvelope /> {entreprise.email || 'Non renseigné'}</p>
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
          ))
        )}
      </div>

      {/* ===== MODALE DE SUPPRESSION ===== */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Confirmer la suppression</h3>
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