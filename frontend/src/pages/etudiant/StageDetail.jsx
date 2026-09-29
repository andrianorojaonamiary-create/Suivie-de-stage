import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSave, FaBuilding, FaUserTie, FaCalendarAlt, 
  FaFileAlt, FaMapMarkerAlt, FaSpinner, FaMapPin,
  FaTimes, FaUpload,
  FaArrowLeft,FaDownload 
} from 'react-icons/fa';
import { geocodeAddress } from '../../services/geocoding';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { internshipsApi } from '../../api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function StageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEditMode = location.state?.editMode || false;
  
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationMap, setLocationMap] = useState(null);
  const [geocodeError, setGeocodeError] = useState('');
  const [fichier, setFichier] = useState(null);
  
  const [formData, setFormData] = useState({
    titre: '',
    entreprise: '',
    ville: '',
    adresse: '',
    dateDebut: '',
    dateFin: '',
    tuteur: '',
    encadreur: '',
    description: '',
    convention: '',
    statut: '',
    createdAt: '',
    updatedAt: ''
  });

  useEffect(() => {
    const fetchStage = async () => {
      try {
        setLoading(true);
        if (id) {
          const res = await internshipsApi.getById(id);
          if (res) {
            setFormData({
              titre: res.title || res.subject || '',
              entreprise: res.company?.name || res.companyName || '',
              ville: res.city || res.company?.city || 'Antananarivo',
              adresse: res.address || res.company?.address || '',
              dateDebut: res.startDate ? res.startDate.split('T')[0] : '',
              dateFin: res.endDate ? res.endDate.split('T')[0] : '',
              tuteur: res.tuteurPedagogique ? `${res.tuteurPedagogique.firstName || ''} ${res.tuteurPedagogique.lastName || ''}`.trim() : '',
              encadreur: res.supervisor ? `${res.supervisor.firstName || ''} ${res.supervisor.lastName || ''}`.trim() : '',
              description: res.description || '',
              convention: res.convention || 'convention_stage.pdf',
              statut: res.status === 'en_cours' ? 'En cours' : res.status === 'termine' ? 'Terminé' : 'En attente',
              createdAt: res.createdAt ? new Date(res.createdAt).toLocaleDateString('fr-FR') : '',
              updatedAt: res.updatedAt ? new Date(res.updatedAt).toLocaleDateString('fr-FR') : ''
            });
          }
        }
      } catch (err) {
        console.error('Erreur chargement detail stage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStage();
  }, [id]);

  const handleChange = (e) => {
    if (!isEditing) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (!isEditing) return;
    if (e.target.files[0]) {
      setFichier(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (!isEditing) return;
    setFichier(null);
    document.getElementById('fileInput').value = '';
  };

  const handleGeocode = async () => {
    if (!isEditing) return;
    const fullAddress = `${formData.adresse}, ${formData.ville}`.trim();
    if (!fullAddress || fullAddress === ',') {
      setGeocodeError('Veuillez saisir une adresse complète');
      return;
    }

    setGeocoding(true);
    setGeocodeError('');
    
    try {
      const result = await geocodeAddress(fullAddress);
      if (result) {
        setLocationMap(result);
        setGeocodeError('');
      } else {
        setGeocodeError('Adresse non trouvée. Veuillez vérifier.');
        setLocationMap(null);
      }
    } catch (err) {
      console.error('Erreur de géocodage:', err);
      setGeocodeError('Erreur de connexion au service de géocodage.');
      setLocationMap(null);
    } finally {
      setGeocoding(false);
    }
  };

  const handleDownload = () => {
    alert('Téléchargement de la convention...');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditing) return;
    
    if (!formData.titre || !formData.entreprise || !formData.ville || !formData.dateDebut || !formData.dateFin) {
      alert('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Stage modifié avec succès !');
      setIsEditing(false);
      navigate(`/etudiant/stage/${id}`);
    }, 1500);
  };

  const handleCancel = () => {
    setIsEditing(false);
    navigate(`/etudiant/stage/${id}`);
  };

  const getTitle = () => {
    if (!isEditing) return 'Consulter le stage';
    return 'Modifier le stage';
  };

  const getSubtitle = () => {
    if (!isEditing) return 'Consultez les informations de votre stage';
    return 'Modifiez les informations de votre stage';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinning" />
        <p>Chargement du stage...</p>
      </div>
    );
  }

  return (
    <div className="etudiant-form-page">
      {/* ===== HEADER ===== */}
      <div className="form-header">
        <button className="btn-back" onClick={() => navigate('/etudiant/mes-stages')}>
          <FaArrowLeft /> Retour
        </button>
        <div className="stage-detail-header">
          <div>
            <h1>{getTitle()}</h1>
          </div>
        </div>
        <p className="text-muted">{getSubtitle()}</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group full-width">
              <label><FaFileAlt /> Titre du stage {isEditing && '*'}</label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Ex: Développement d'une plateforme web"
                required={isEditing}
                disabled={!isEditing}
                className={!isEditing ? 'field-disabled' : ''}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><FaCalendarAlt /> Date de début {isEditing && '*'}</label>
              <input
                type="date"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                required={isEditing}
                disabled={!isEditing}
                className={!isEditing ? 'field-disabled' : ''}
              />
            </div>
            <div className="form-group">
              <label><FaCalendarAlt /> Date de fin {isEditing && '*'}</label>
              <input
                type="date"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                required={isEditing}
                disabled={!isEditing}
                className={!isEditing ? 'field-disabled' : ''}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><FaUserTie /> Tuteur pédagogique</label>
              <input
                type="text"
                name="tuteur"
                value={formData.tuteur}
                onChange={handleChange}
                placeholder="Nom du tuteur"
                disabled={!isEditing}
                className={!isEditing ? 'field-disabled' : ''}
              />
            </div>
            <div className="form-group">
              <label><FaUserTie /> Maître de stage</label>
              <input
                type="text"
                name="encadreur"
                value={formData.encadreur}
                onChange={handleChange}
                placeholder="Nom de l'encadreur"
                disabled={!isEditing}
                className={!isEditing ? 'field-disabled' : ''}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description du stage..."
                disabled={!isEditing}
                className={!isEditing ? 'field-disabled' : ''}
              />
            </div>
          </div>

          <div className="form-row">
              <div className="form-group">
                <label><FaBuilding /> Entreprise {isEditing && '*'}</label>
                <input
                  type="text"
                  name="entreprise"
                  value={formData.entreprise}
                  onChange={handleChange}
                  placeholder="Nom de l'entreprise"
                  required={isEditing}
                  disabled={!isEditing}
                  className={!isEditing ? 'field-disabled' : ''}
                />
              </div>
              <div className="form-group">
                <label><FaMapMarkerAlt /> Ville {isEditing && '*'}</label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  placeholder="Ville"
                  required={isEditing}
                  disabled={!isEditing}
                  className={!isEditing ? 'field-disabled' : ''}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label><FaMapMarkerAlt /> Adresse</label>
                <div className="address-input-group">
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    placeholder="Lot II M 77, Antananarivo"
                    className={`address-input ${!isEditing ? 'field-disabled' : ''}`}
                    disabled={!isEditing}
                  />
                  {isEditing && (
                    <button
                      type="button"
                      className="btn-geocode"
                      onClick={handleGeocode}
                      disabled={geocoding}
                    >
                      {geocoding ? <FaSpinner className="spinning" /> : <FaMapPin />}
                      {geocoding ? 'Recherche...' : 'Localiser'}
                    </button>
                  )}
                </div>
                {isEditing && geocodeError && <span className="geocode-error">{geocodeError}</span>}
                {isEditing && locationMap && (
                  <span className="geocode-success">Localisé</span>
                )}
              </div>
            </div>

            {(locationMap || (formData.lat && formData.lng)) && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Aperçu de la localisation</label>
                  <div className="map-preview">
                    <MapContainer
                      center={[locationMap?.lat || -18.8792, locationMap?.lon || 47.5079]}
                      zoom={15}
                      style={{ height: '200px', width: '100%', borderRadius: '10px' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      <Marker position={[locationMap?.lat || -18.8792, locationMap?.lon || 47.5079]}>
                        <Popup>{formData.entreprise || 'Stage'}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group full-width">
                <label><FaFileAlt /> Convention de stage</label>
                {isEditing ? (
                  <>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        id="fileInput"
                        accept=".pdf"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="fileInput" className="file-label-btn">
                        <FaUpload /> Parcourir
                      </label>
                      {fichier ? (
                        <>
                          <span className="file-selected-name">{fichier.name}</span>
                          <button
                            type="button"
                            className="file-remove-btn"
                            onClick={handleRemoveFile}
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <span className="file-placeholder">Aucun fichier sélectionné</span>
                      )}
                    </div>
                    <small className="form-hint">Format PDF, max 5 Mo</small>
                  </>
                ) : (
                  <div className="convention-file">
                    <FaFileAlt className="file-icon" />
                    <span className="file-name">{formData.convention || 'Aucune convention déposée'}</span>
                    {formData.convention && (
                      <button type="button" className="btn-download" onClick={handleDownload}>
                        <FaDownload /> Télécharger
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

          {/* ===== MÉTADONNÉES ===== */}
          {!isEditing && (
            <div className="form-metadata">
              <span>Créé le : {formData.createdAt}</span>
              <span>Dernière modification : {formData.updatedAt}</span>
            </div>
          )}

          {/* ===== BOUTONS ===== */}
          <div className="form-actions">
            {!isEditing ? (
              <button type="button" className="btn-secondary" onClick={() => navigate('/etudiant/mes-stages')}>
                Retour
              </button>
            ) : (
              <>
                <button type="submit" className="btn-primary" disabled={saving}>
                  <FaSave /> {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
                <button type="button" className="btn-reset" onClick={handleCancel}>
                  <FaTimes /> Annuler
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default StageDetail;