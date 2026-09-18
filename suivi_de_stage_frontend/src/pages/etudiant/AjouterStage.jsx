import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSave,
  FaBuilding,
  FaUserTie,
  FaUserGraduate,
  FaCalendarAlt,
  FaFileAlt,
  FaMapMarkerAlt,
  FaSpinner,
  FaMapPin,
  FaTimes,
  FaUpload,
  FaArrowLeft,
} from "react-icons/fa";
import { geocodeAddress } from "../../services/geocoding";
import DateField from "../../components/Common/DateField";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "react-toastify";
import {
  internshipsApi,
  companiesApi,
  supervisorsApi,
  usersApi,
} from "../../api";
import { getApiErrorMessage } from "../../api/apiClient";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function AjouterStage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    domaine: "",
    ville: "",
    adresse: "",
    dateDebut: "",
    dateFin: "",
    companyId: "",
    companyNom: "",
    supervisorId: "",
    tuteurId: "",
    encadreurProfessionnelNom: "",
  });
  const [enseignants, setEnseignants] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [showSupervisorSuggestions, setShowSupervisorSuggestions] =
    useState(false);
  const [fichier, setFichier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [location, setLocation] = useState(null);
  const [geocodeError, setGeocodeError] = useState("");

  const listFromResponse = (res) =>
    res?.data || (Array.isArray(res) ? res : []);

  useEffect(() => {
    const loadReferences = async () => {
      const [companiesResult, supervisorsResult, enseignantsResult] =
        await Promise.allSettled([
          companiesApi.getAll({ limit: 100 }),
          supervisorsApi.getAll({ limit: 100 }),
          usersApi.getAll({ role: "ENSEIGNANT", limit: 100 }),
        ]);

      if (companiesResult.status === "fulfilled") {
        setCompanies(listFromResponse(companiesResult.value));
      }
      if (supervisorsResult.status === "fulfilled") {
        setSupervisors(listFromResponse(supervisorsResult.value));
      }
      if (enseignantsResult.status === "fulfilled") {
        setEnseignants(listFromResponse(enseignantsResult.value));
      }

      if (
        companiesResult.status === "rejected" ||
        supervisorsResult.status === "rejected" ||
        enseignantsResult.status === "rejected"
      ) {
        console.error("Erreur chargement des références :", {
          companiesResult,
          supervisorsResult,
          enseignantsResult,
        });
        toast.error(
          "Certaines listes de référence n'ont pas pu être chargées.",
        );
      }
    };
    loadReferences();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfessionalSupervisorChange = (e) => {
    const value = e.target.value;
    const selectedSupervisor = supervisors.find(
      (supervisor) => supervisorLabel(supervisor) === value,
    );
    setFormData((prev) => ({
      ...prev,
      supervisorId: selectedSupervisor?.id ?? "",
      encadreurProfessionnelNom: selectedSupervisor ? "" : value,
    }));
  };

  const handleCompanyChange = (e) => {
    const value = e.target.value;
    const selectedCompany = companies.find(
      (company) => companyLabel(company) === value,
    );
    setFormData((prev) => ({
      ...prev,
      companyId: selectedCompany?.id ?? "",
      companyNom: value,
    }));
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
    if (e.target.files[0]) {
      setFichier(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFichier(null);
    document.getElementById("fileInput").value = "";
  };

  const handleGeocode = async () => {
    const fullAddress = `${formData.adresse}, ${formData.ville}`.trim();
    if (!fullAddress || fullAddress === ",") {
      setGeocodeError("Veuillez saisir une adresse complète");
      return;
    }

    setGeocoding(true);
    setGeocodeError("");

    try {
      const result = await geocodeAddress(fullAddress, {
        ville: formData.ville,
      });
      if (result) {
        setLocation(result);
        setGeocodeError("");
      } else {
        setGeocodeError("Adresse non trouvée. Veuillez vérifier.");
        setLocation(null);
      }
    } catch (err) {
      console.error("Erreur de géocodage:", err);
      setGeocodeError("Erreur de connexion au service de géocodage.");
      setLocation(null);
    } finally {
      setGeocoding(false);
    }
  };

  const handleReset = () => {
    setFormData({
      titre: "",
      description: "",
      domaine: "",
      ville: "",
      adresse: "",
      dateDebut: "",
      dateFin: "",
      companyId: "",
      companyNom: "",
      supervisorId: "",
      tuteurId: "",
      encadreurProfessionnelNom: "",
    });
    setFichier(null);
    setLocation(null);
    setGeocodeError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      alert("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }

    setLoading(true);
    try {
      await internshipsApi.create({
        intitule: formData.titre,
        description: formData.description,
        domaine: formData.domaine,
        lieu: formData.adresse.trim(),
        ville: formData.ville,
        latitude: location?.lat,
        longitude: location?.lon,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        companyId: formData.companyId,
        tuteurId: formData.tuteurId || undefined,
        supervisorId: formData.supervisorId || undefined,
        encadreurProfessionnelNom:
          (formData.encadreurProfessionnelNom || "").trim() || undefined,
      });
      toast.success(
        "Stage ajouté avec succès ! Il doit être validé par un encadreur.",
      );
      navigate("/etudiant/mes-stages");
    } catch (err) {
      console.error("Erreur création stage:", err);
      toast.error(
        getApiErrorMessage(err, "Erreur lors de l\u2019ajout du stage"),
      );
      setLoading(false);
    }
  };

  const supervisorLabel = (s) => {
    const name = [s.user?.nom, s.user?.prenom].filter(Boolean).join(" ");
    const detail = [s.fonction, s.specialite].filter(Boolean).join(" - ");
    return [name, detail].filter(Boolean).join(" — ");
  };

  const companyLabel = (company) =>
    [company.nom, company.ville].filter(Boolean).join(" — ");

  return (
    <div className="etudiant-form-page">
      <button
        type="button"
        className="btn-back"
        onClick={() => navigate("/etudiant/mes-stages")}
      >
        <FaArrowLeft /> Retour
      </button>

      <div className="form-header">
        <h1>Ajouter un stage</h1>
        <p className="text-muted">Renseignez les informations de votre stage</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>
                <FaFileAlt /> Titre du stage *
              </label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Ex: Développement d'une plateforme web"
                required
              />
            </div>
            <div className="form-group">
              <label>
                <FaUserGraduate /> Encadreur pédagogique
              </label>
              <select
                name="tuteurId"
                value={formData.tuteurId}
                onChange={handleChange}
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
              <label>
                <FaCalendarAlt /> Date de début *
              </label>
              <DateField
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <FaCalendarAlt /> Date de fin *
              </label>
              <DateField
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                required
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
                  onFocus={() => setShowCompanySuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowCompanySuggestions(false), 150)
                  }
                  placeholder="Sélectionner ou saisir une entreprise"
                  className="smart-select-input"
                  required
                />
                {showCompanySuggestions && (
                  <div className="suggestion-list">
                    {companies.length === 0 ? (
                      <div className="suggestion-empty">
                        Aucune entreprise disponible.
                        <span className="suggestion-empty-sub">
                          Contactez l'administration pour ajouter votre
                          entreprise d'accueil.
                        </span>
                      </div>
                    ) : (
                      companies.map((company) => (
                        <button
                          type="button"
                          key={company.id}
                          onClick={() => selectCompany(company)}
                        >
                          {companyLabel(company)}
                        </button>
                      ))
                    )}
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
                  onFocus={() => setShowSupervisorSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSupervisorSuggestions(false), 150)
                  }
                  placeholder="Sélectionner ou saisir un encadreur"
                  className="smart-select-input"
                  required
                />
                {showSupervisorSuggestions && (
                  <div className="suggestion-list">
                    {supervisors.map((supervisor) => (
                      <button
                        type="button"
                        key={supervisor.id}
                        onClick={() => selectSupervisor(supervisor)}
                      >
                        {supervisorLabel(supervisor)}
                      </button>
                    ))}
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
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>
                <FaMapMarkerAlt /> Adresse
              </label>
              <div className="address-input-group">
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Rue de la Réunion, Antananarivo"
                  className="address-input"
                  required
                />
                <button
                  type="button"
                  className="btn-geocode"
                  onClick={handleGeocode}
                  disabled={geocoding}
                >
                  {geocoding ? (
                    <FaSpinner className="spinning" />
                  ) : (
                    <FaMapPin />
                  )}
                  {geocoding ? "Recherche..." : "Localiser"}
                </button>
              </div>
              <small className="form-hint">
                Astuce : indiquez le nom de la rue ou du quartier, puis la ville
                (ex. : Rue de la Réunion, Antananarivo). Ajoutez « Madagascar »
                si besoin pour une meilleure localisation.
              </small>
              {geocodeError && (
                <span className="geocode-error">{geocodeError}</span>
              )}
              {location && <span className="geocode-success">Localisé</span>}
            </div>
          </div>

          {location && (
            <div className="form-row">
              <div className="form-group full-width">
                <label>Aperçu de la localisation</label>
                <div className="map-preview">
                  <MapContainer
                    center={[location.lat, location.lon]}
                    zoom={15}
                    style={{
                      height: "200px",
                      width: "100%",
                      borderRadius: "10px",
                    }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap"
                    />
                    <Marker position={[location.lat, location.lon]}>
                      <Popup>
                        {companies.find((c) => c.id === formData.companyId)
                          ?.nom || "Stage"}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group full-width">
              <label>
                <FaFileAlt /> Convention de stage (PDF)
              </label>
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
                  <span className="file-placeholder">
                    Aucun fichier sélectionné
                  </span>
                )}
              </div>
              <small className="form-hint">Format PDF, max 5 Mo</small>
            </div>
          </div>

          {/* ===== BOUTONS ===== */}
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              <FaSave />{" "}
              {loading ? "Enregistrement..." : "Enregistrer le stage"}
            </button>
            <button type="button" className="btn-reset" onClick={handleReset}>
              <FaTimes /> Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AjouterStage;
