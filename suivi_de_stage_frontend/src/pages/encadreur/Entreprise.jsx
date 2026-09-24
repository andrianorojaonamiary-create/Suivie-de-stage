import { useState, useEffect } from "react";

import {
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaSave,
  FaTimes,
  FaInfoCircle,
  FaEdit,
} from "react-icons/fa";
import { sanitizePhone } from "../../utils/phone";
import { toast } from "react-toastify";
import { companiesApi, getApiErrorMessage } from "../../api";

function EncadreurEntreprise() {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [entrepriseIntrouvable, setEntrepriseIntrouvable] = useState(false);
  const [societesEncadrees, setSocietesEncadrees] = useState([]);
  const [companyId, setCompanyId] = useState("");

  const [formData, setFormData] = useState({
    nom: "",
    domaine: "",
    adresse: "",
    ville: "",
    telephone: "",
    email: "",
    site: "",
    description: "",
  });

  useEffect(() => {
    const fetchEntreprise = async () => {
      setChargement(true);
      try {
        const company = await companiesApi.getMe();
        setCompanyId(company.id || "");
        setFormData({
          nom: company.nom || "",
          domaine: company.secteurActivite || company.secteur_activite || "",
          adresse: company.adresse || "",
          ville: company.ville || "",
          telephone: company.telephone || "",
          email: company.email || "",
          site: company.siteWeb || company.site_web || "",
          description: company.description || "",
        });
        setEntrepriseIntrouvable(false);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          setEntrepriseIntrouvable(true);
          setCompanyId("");
          try {
            const res = await companiesApi.getSupervised();
            const items = Array.isArray(res) ? res : res?.data || [];
            setSocietesEncadrees(items);
          } catch {
            setSocietesEncadrees([]);
          }
        } else {
          console.error("Erreur chargement entreprise:", err);
          toast.error(
            getApiErrorMessage(
              err,
              "Erreur lors du chargement de l'entreprise",
            ),
          );
        }
      } finally {
        setChargement(false);
      }
    };
    fetchEntreprise();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "telephone" ? sanitizePhone(value) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nom: formData.nom,
      secteurActivite: formData.domaine,
      adresse: formData.adresse,
      ville: formData.ville,
      telephone: formData.telephone,
      email: formData.email,
      siteWeb: formData.site,
      description: formData.description,
    };
    setLoading(true);
    try {
      if (!companyId) {
        const company = await companiesApi.create({
          ...payload,
          region: formData.ville,
        });
        setCompanyId(company.id || "");
        setEntrepriseIntrouvable(false);
        toast.success("Votre entreprise a été créée avec succès !");
      } else {
        await companiesApi.update(companyId, payload);
        toast.success(
          "Informations de l'entreprise mises à jour avec succès !",
        );
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Erreur enregistrement entreprise:", err);
      toast.error(
        getApiErrorMessage(
          err,
          "Erreur lors de l'enregistrement de l'entreprise",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  if (chargement) {
    return (
      <div className="encadreur-entreprise-page">
        <div className="page-header">
          <div>
            <h1>Mon entreprise</h1>
            <p className="text-muted">Chargement des informations...</p>
          </div>
        </div>
        <div className="form-card">
          <div className="entreprise-empty">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="encadreur-entreprise-page">
      {/* ===== HEADER SANS BOUTON RETOUR ===== */}
      <div className="page-header">
        <div>
          <h1>Mon entreprise</h1>
          <p className="text-muted">
            {entrepriseIntrouvable
              ? "Ajoutez les informations de votre entreprise"
              : isEditing
                ? "Modifiez les informations de votre entreprise"
                : "Consultez les informations de votre entreprise"}
          </p>
        </div>
        {!isEditing && !entrepriseIntrouvable && (
          <button
            className="btn-edit-entreprise"
            onClick={() => setIsEditing(true)}
          >
            <FaEdit /> Modifier
          </button>
        )}
      </div>

      {entrepriseIntrouvable && societesEncadrees.length > 0 && (
        <div className="form-card societes-encadrees-card">
          <h3 className="societes-encadrees-title">
            <FaBuilding /> Sociétés de vos stages encadrés
          </h3>
          <ul className="societes-encadrees-list">
            {societesEncadrees.map((ent, idx) => (
              <li key={ent.id || idx} className="societe-encadree-item">
                <strong>{ent.nom}</strong>
                {ent.adresse && <span> · {ent.adresse}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-card">
        {!entrepriseIntrouvable && !isEditing ? (
          <div className="entreprise-display">
            <div className="display-row">
              <span className="display-label">
                <FaBuilding /> Nom
              </span>
              <span className="display-value">
                <strong>{formData.nom}</strong>
              </span>
            </div>
            <div className="display-row">
              <span className="display-label">
                <FaInfoCircle /> Domaine
              </span>
              <span className="display-value">{formData.domaine}</span>
            </div>
            <div className="display-row">
              <span className="display-label">
                <FaMapMarkerAlt /> Adresse
              </span>
              <span className="display-value">{formData.adresse}</span>
            </div>
            <div className="display-row">
              <span className="display-label">
                <FaMapMarkerAlt /> Ville
              </span>
              <span className="display-value">{formData.ville}</span>
            </div>
            <div className="display-row">
              <span className="display-label">
                <FaPhone /> Téléphone
              </span>
              <span className="display-value">{formData.telephone}</span>
            </div>
            <div className="display-row">
              <span className="display-label">
                <FaEnvelope /> Email
              </span>
              <span className="display-value">{formData.email}</span>
            </div>
            <div className="display-row">
              <span className="display-label">
                <FaGlobe /> Site web
              </span>
              <span className="display-value">{formData.site}</span>
            </div>
            <div className="display-row display-description">
              <span className="display-label">
                <FaInfoCircle /> Description
              </span>
              <span className="display-value">{formData.description}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="form-section-title">
                <FaBuilding /> Informations générales
              </h3>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>
                    <FaBuilding /> Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Nom de l'entreprise"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaInfoCircle /> Domaine d'activité
                  </label>
                  <input
                    type="text"
                    name="domaine"
                    value={formData.domaine}
                    onChange={handleChange}
                    placeholder="Domaine d'activité"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FaMapMarkerAlt /> Ville
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
                  <label>
                    <FaMapMarkerAlt /> Adresse
                  </label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    placeholder="Adresse complète"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <FaPhone /> Contact
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaPhone /> Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="+261 34 12 345 67"
                    maxLength={14}
                    inputMode="tel"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FaEnvelope /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@entreprise.mg"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaGlobe /> Site web
                  </label>
                  <input
                    type="text"
                    name="site"
                    value={formData.site}
                    onChange={handleChange}
                    placeholder="www.entreprise.mg"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <FaInfoCircle /> Description
              </h3>

              <div className="form-row">
                <div className="form-group full-width">
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description de l'entreprise..."
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                <FaSave />{" "}
                {loading
                  ? "Enregistrement..."
                  : entrepriseIntrouvable
                    ? "Créer mon entreprise"
                    : "Enregistrer les modifications"}
              </button>
              <button
                type="button"
                className="btn-reset"
                onClick={() => setIsEditing(false)}
              >
                <FaTimes /> Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EncadreurEntreprise;
