import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUserTie, FaEnvelope, FaPhone, FaBuilding, 
  FaPlus, FaEdit, FaTrash, FaEye, FaUsers
} from 'react-icons/fa';

function MonEncadreur() {
  const navigate = useNavigate();
  
  // ===== ÉTATS =====
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [encadreurToDelete, setEncadreurToDelete] = useState(null);
  
  // ===== DONNÉES SIMULÉES =====
  const [encadreurs, setEncadreurs] = useState([
    {
      id: 1,
      nom: 'Rakotomalala',
      prenom: 'Jean',
      fonction: 'Directeur technique',
      entreprise: 'TechMada SARL',
      email: 'j.rakotomalala@techmada.mg',
      telephone: '+261 34 12 345 78',
      specialite: 'Développement logiciel',
      etudiants: ['Miora Rakoto', 'Hery Rakotondrabe']
    }
  ]);

  // ===== ACTIONS =====
  const handleView = (id) => {
    navigate(`/etudiant/encadreur/voir/${id}`, {state:{encadreur: encadreurs.find(e => e.id === id)}});
  };

  const handleEdit = (encadreur) => {
    navigate('/etudiant/encadreur/modifier', { state: { encadreur } });
  };

  const handleDeleteClick = (id) => {
    setEncadreurToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const encadreur = encadreurs.find(e => e.id === encadreurToDelete);
    setEncadreurs(encadreurs.filter(e => e.id !== encadreurToDelete));
    setShowDeleteModal(false);
    setEncadreurToDelete(null);
    alert(`🗑️ Encadreur "${encadreur?.prenom} ${encadreur?.nom}" supprimé !`);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEncadreurToDelete(null);
  };

  return (
    <div className="etudiant-encadreur-page">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <h1>Mon encadreur</h1>
          <p className="text-muted">{encadreurs.length} encadreur(s) enregistré(s)</p>
        </div>
        <Link to="/etudiant/encadreur/ajouter" className="btn-primary">
          <FaPlus /> Ajouter un encadreur
        </Link>
      </div>

      {/* ===== GRILLE DES ENCADREURS ===== */}
      <div className="encadreur-grid">
        {encadreurs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <p>Aucun encadreur enregistré</p>
            <p className="empty-sub">Ajoutez votre maître de stage</p>
            <Link to="/etudiant/encadreur/ajouter" className="btn-primary">
              <FaPlus /> Ajouter
            </Link>
          </div>
        ) : (
          encadreurs.map((encadreur) => (
            <div key={encadreur.id} className="encadreur-card">
              <div className="encadreur-card-top">
                <div className="encadreur-avatar">
                  <FaUserTie />
                </div>
                <div className="encadreur-info">
                  <h3>{encadreur.prenom} {encadreur.nom}</h3>
                  <span className="encadreur-fonction">{encadreur.fonction || 'Fonction non renseignée'}</span>
                </div>
              </div>
              <div className="encadreur-card-middle">
                <p><FaBuilding /> {encadreur.entreprise || 'Entreprise non renseignée'}</p>
                <p><FaEnvelope /> {encadreur.email || 'Non renseigné'}</p>
                <p><FaPhone /> {encadreur.telephone || 'Non renseigné'}</p>
                <p><FaUsers /> {encadreur.etudiants?.length || 0} étudiant(s)</p>
              </div>
              <div className="encadreur-card-actions">
                <button className="btn-action" onClick={() => handleView(encadreur.id)} title="Voir">
                  <FaEye />
                </button>
                <button className="btn-action btn-edit" onClick={() => handleEdit(encadreur)} title="Modifier">
                  <FaEdit />
                </button>
                <button className="btn-action btn-danger" onClick={() => handleDeleteClick(encadreur.id)} title="Supprimer">
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
            <p>Voulez-vous vraiment supprimer cet encadreur ? Cette action est irréversible.</p>
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

export default MonEncadreur;