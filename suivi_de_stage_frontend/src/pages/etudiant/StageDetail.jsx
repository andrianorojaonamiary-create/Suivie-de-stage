import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSave, FaBuilding, FaUserTie, FaUserGraduate, FaCalendarAlt, 
  FaFileAlt, FaMapMarkerAlt, FaSpinner, FaMapPin,
  FaTimes, FaUpload,
  FaArrowLeft,FaDownload 
} from 'react-icons/fa';
import { geocodeAddress } from '../../services/geocoding';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { toast } from 'react-toastify';

import DateField from '../../components/Common/DateField';
import { 
  internshipsApi, 
  companiesApi, 
  supervisorsApi, 
  usersApi 
} from '../../api';
import { getApiErrorMessage } from '../../api/apiClient';
import { mapInternship } from '../../utils/internshipMapping';

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
  const [companies, setCompanies] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [showSupervisorSuggestions, setShowSupervisorSuggestions] = useState(false);
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    domaine: '',
    ville: '',
    adresse: '',
    dateDebut: '',
    dateFin: '',
    companyId: '',
    companyNom: '',
    supervisorId: '',
    tuteurId: '',
    encadreurProfessionnelNom: '',
    convention: '',
  });

  useEffect(() => {
    const loadReferences = async () => {
      const [companiesResult, supervisorsResult, enseignantsResult] =
        await Promise.allSettled([
          companiesApi.getAll({ limit: 100 }),
          supervisorsApi.getAll({ limit: 100 }),
          usersApi.getAll({ role: "ENSEIGNANT", limit: 100 }),
        ]);

      if (companiesResult.status === "fulfilled") {
        setCompanies(companiesResult.value?.data || (Array.isArray(companiesResult.value) ? companiesResult.value : []));
      }
      if (supervisorsResult.status === "fulfilled") {
        setSupervisors(supervisorsResult.value?.data || (Array.isArray(supervisorsResult.value) ? supervisorsResult.value : []));
      }
      if (enseignantsResult.status === "fulfilled") {
        setEnseignants(enseignantsResult.value?.data || (Array.isArray(enseignantsResult.value) ? enseignantsResult.value : []));
      }
    };
    loadReferences();
  }, []);

  useEffect(() => {
    const fetchStage = async () => {
      try {
        setLoading(true);
        if (id) {
          const res = await internshipsApi.getById(id);
          if (res) {
            const mapped = mapInternship(res);
            setFormData({
              titre: mapped.titre,
              description: mapped.description,
              domaine: mapped.domaine,
              ville: mapped.ville,
              adresse: mapped.adresse,
              dateDebut: mapped.dateDebut || '',
              dateFin: mapped.dateFin || '',
              companyId: mapped.companyId || '',
              companyNom: mapped.entreprise || '',
              supervisorId: mapped.supervisorId || '',
              tuteurId: mapped.tuteurId || '',
              encadreurProfessionnelNom: mapped.encadreurProfessionnelNom || '',
              convention: mapped.convention || '',
              conventionNom: mapped.conventionNom || '',
              createdAt: mapped.dateCreation || '',
              updatedAt: mapped.dateModification || '',
            });
            if (res.latitude && res.longitude) {
              setLocationMap({ lat: res.latitude, lon: res.longitude });
            }
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

  const supervisorLabel = (s) => {
    const name = [s.user?.nom, s.user?.prenom].filter(Boolean).join(" ");
    const detail = [s.fonction, s.specialite].filter(Boolean).join(" - ");
    return [name, detail].filter(Boolean).join(" — ");
  };

  const companyLabel = (company) =>
    [company.nom, company.ville].filter(Boolean).join(" — ");

  const handleProfessionalSupervisorChange = (e) => {
    if (!isEditing) return;
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      encadreurProfessionnelNom: value,
      supervisorId: "",
    }));
  };

  const handleSupervisorBlur = () => {
    setShowSupervisorSuggestions(false);
  };

  const handleCompanyChange = (e) => {
    if (!isEditing) return;
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      companyNom: value,
      companyId: "",
    }));
  };

  const handleCompanyBlur = () => {
    setShowCompanySuggestions(false);
  };

  const selectCompany = (company) => {
    setFormData((prev) => ({
      ...prev,
      companyId: company.id,
      companyNom: companyLabel(company),
    }));
    setShowCompanySuggestions(false);
  };

  const selectSupervisor = (supervisor) => {
    setFormData((prev) => ({
      ...prev,
      supervisorId: supervisor.id,
      encadreurProfessionnelNom: "",
    }));
    setShowSupervisorSuggestions(false);
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
      const result = await geocodeAddress(fullAddress, { ville: formData.ville });
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

  const handleDownload = async () => {
    try {
      toast.info('Téléchargement de la convention...');
      const blob = await internshipsApi.downloadConvention(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = formData.conventionNom || `convention_${formData.titre || 'stage'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement convention:', err);
      toast.error(getApiErrorMessage(err, 'Impossible de télécharger la convention'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) return;

    const encadreurOk = Boolean(
      formData.supervisorId || formData.encadreurProfessionnelNom?.trim(),
    );

    if (
      !formData.titre ||
      !formData.description ||
      !formData.domaine ||
      !formData.companyId ||
      !formData.ville ||
      !formData.adresse?.trim() ||
      !formData.dateDebut ||
      !formData.dateFin ||
      !encadreurOk
    ) {
      alert('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setSaving(true);
    try {
      await internshipsApi.update(id, {
        intitule: formData.titre,
        description: formData.description,
        domaine: formData.domaine,
        lieu: formData.adresse.trim(),
        ville: formData.ville,
        latitude: locationMap?.lat,
        longitude: locationMap?.lon,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        companyId: formData.companyId,
        tuteurId: formData.tuteurId || undefined,
        supervisorId: formData.supervisorId || undefined,
        encadreurProfessionnelNom:
          (formData.encadreurProfessionnelNom || "").trim() || undefined,
      });
      if (fichier) {
        await internshipsApi.uploadConvention(id, fichier);
      }
      toast.success('Stage modifié avec succès !');
      setIsEditing(false);
      navigate(`/etudiant/stage/${id}`, { state: { editMode: false } });
    } catch (err) {
      console.error('Erreur modification stage:', err);
      toast.error(getApiErrorMessage(err, 'Erreur lors de la modification du stage'));
    } finally {
      setSaving(false);
    }
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
            <div className="form-group">
              <label><FaFileAlt /> Titre du stage *</label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Ex: Développement d'une plateforme web"
                required
                disabled={!isEditing}
                className={!isEditing ? 'field-disabled' : ''}
              />
            </div>
            <div className="form-group">
              <label>
                <FaUserGraduate /> Tuteur pédagogique
              </label>
              <select
                name="tuteurId"
                value={formData.tuteurId}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? 'field-disabled' : ''}
              >
                <option value="">Sélectionner un enseignant</option>
                {enseignants.map((u) => (
                  <option key={u.id} value={u.id}>
                    {[u.nom, u.prenom].filter(Boolean).join(" ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><FaCalendarAlt /> Date de début *</label>
              <DateField
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                required
                disabled={!isEditing}
                className={!isEditing ? 'field-disabled' : ''}
              />
            </div>
            <div className="form-group">
              <label><FaCalendarAlt /> Date de fin *</label>
              <DateField
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                required
                disabled={!isEditing}
                className={!isEditing ? 'field-disabled' : ''}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <FaBuilding /> Entreprise *
                <span className="field-tooltip" role="tooltip">
                  Sélectionnez l'entreprise qui accueille votre stage.
                </span>
              </label>
              <div className="suggestion-field">
                <input
                  type="text"
                  value={formData.companyNom}
                  onChange={handleCompanyChange}
                  onBlur={handleCompanyBlur}
                  onFocus={() => isEditing && setShowCompanySuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowCompanySuggestions(false);
                  }}
                  placeholder="Sélectionner ou saisir une entreprise"
                  className="smart-select-input"
                  required
                  disabled={!isEditing}
                />
                {isEditing && showCompanySuggestions && (
                  <div className="suggestion-list">
                    {(() => {
                      const search = formData.companyNom.toLowerCase();
                      const exactMatch = companies.find(
                        (c) => companyLabel(c).toLowerCase() === search,
                      );
                      const filtered = exactMatch
                        ? [exactMatch]
                        : companies.filter((c) => c.nom.toLowerCase().includes(search));
                      if (filtered.length === 0) {
                        return (
                          <div className="suggestion-empty">
                            Aucune entreprise correspondante.
                            <span className="suggestion-empty-sub">
                              Vérifiez l'orthographe ou saisissez le nom exact.
                            </span>
                          </div>
                        );
                      }
                      return filtered.map((company) => (
                        <button
                          type="button"
                          key={company.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectCompany(company)}
                        >
                          {companyLabel(company)}
                        </button>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>
                <FaUserTie /> Encadreur professionnel *
                <span className="field-tooltip" role="tooltip">
                  Choisissez un encadreur existant ou saisissez le nom d'un
                  encadreur sans compte.
                </span>
              </label>
              <div className="suggestion-field">
                <input
                  type="text"
                  value={
                    formData.supervisorId
                      ? supervisorLabel(
                          supervisors.find(
                            (s) => s.id === formData.supervisorId,
                          ) || {},
                        )
                      : formData.encadreurProfessionnelNom
                  }
                  onChange={handleProfessionalSupervisorChange}
                  onFocus={() => isEditing && setShowSupervisorSuggestions(true)}
                  onBlur={handleSupervisorBlur}
                  placeholder="Sélectionner ou saisir un encadreur"
                  className="smart-select-input"
                  required
                  disabled={!isEditing}
                />
                {isEditing && showSupervisorSuggestions && (
                  <div className="suggestion-list">
                    {(() => {
                      const search = formData.encadreurProfessionnelNom.toLowerCase();
                      const exactMatch = supervisors.find(
                        (s) => supervisorLabel(s).toLowerCase() === search,
                      );
                      const filtered = exactMatch
                        ? [exactMatch]
                        : supervisors.filter((s) => {
                            const name = [s.user?.nom, s.user?.prenom]
                              .filter(Boolean)
                              .join(" ")
                              .toLowerCase();
                            return name.includes(search);
                          });
                      if (filtered.length === 0) {
                        return (
                          <div className="suggestion-empty">
                            Aucun encadreur correspondant.
                            <span className="suggestion-empty-sub">
                              Vérifiez l'orthographe ou saisissez le nom exact.
                            </span>
                          </div>
                        );
                      }
                      return filtered.map((supervisor) => (
                        <button
                          type="button"
                          key={supervisor.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectSupervisor(supervisor)}
                        >
                          {supervisorLabel(supervisor)}
                        </button>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <FaFileAlt /> Domaine *
              </label>
              <input
                type="text"
                name="domaine"
                value={formData.domaine}
                onChange={handleChange}
                placeholder="Ex: Informatique, Génie civil..."
                required
                disabled={!isEditing}
                className={!isEditing ? 'field-disabled' : ''}
              />
            </div>
            <div className="form-group">
              <label>
                <FaMapMarkerAlt /> Ville *
              </label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                placeholder="Ville"
                required
                disabled={!isEditing}
                className={!isEditing ? 'field-disabled' : ''}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Description *</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description du stage..."
                required
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
                  placeholder="Rue de la Réunion, Antananarivo"
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
              {isEditing && (
                <small className="form-hint">
                  Astuce : indiquez le nom de la rue ou du quartier, puis la
                  ville (ex. : Rue de la Réunion, Antananarivo). Ajoutez
                  « Madagascar » si besoin pour une meilleure localisation.
                </small>
              )}
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
                    <span className="file-name">{formData.conventionNom || formData.convention || 'Aucune convention déposée'}</span>
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
              <span>Créé le : {formData.createdAt ? new Date(formData.createdAt).toLocaleString('fr-FR') : '—'}</span>
              <span>Dernière modification : {formData.updatedAt ? new Date(formData.updatedAt).toLocaleString('fr-FR') : '—'}</span>
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