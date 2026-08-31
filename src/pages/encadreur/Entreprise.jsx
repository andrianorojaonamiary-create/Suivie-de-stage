import { useEffect, useState } from 'react';
import { FaBuilding, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import apiClient, { getApiErrorMessage } from '../../api/apiClient';

function EncadreurEntreprise() {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { const loadCompany = async () => { try { setLoading(true); const { data } = await apiClient.get(`/companies/${companyId}`); setCompany(data); setError(''); } catch (loadError) { setError(getApiErrorMessage(loadError, 'Impossible de consulter cette entreprise.')); } finally { setLoading(false); } }; if (companyId) void Promise.resolve().then(loadCompany); }, [companyId]);
  if (loading) return <div className="encadreur-entreprise-page"><div className="empty-state"><p>Chargement de l’entreprise…</p></div></div>;
  if (error || !company) return <div className="encadreur-entreprise-page"><div className="alert alert-danger">{error || 'Entreprise introuvable.'}</div></div>;
  return <div className="encadreur-entreprise-page"><div className="page-header"><div><h1><FaBuilding /> {company.nom}</h1><p className="text-muted">Entreprise d’un étudiant dont vous assurez le suivi.</p></div></div><div className="form-card entreprise-display"><div className="display-row"><span className="display-label"><FaBuilding /> Secteur</span><span className="display-value">{company.secteurActivite || 'Non renseigné'}</span></div><div className="display-row"><span className="display-label"><FaMapMarkerAlt /> Adresse</span><span className="display-value">{[company.adresse, company.ville, company.region].filter(Boolean).join(', ') || 'Non renseignée'}</span></div><div className="display-row"><span className="display-label"><FaPhone /> Téléphone</span><span className="display-value">{company.telephone || 'Non renseigné'}</span></div><div className="display-row"><span className="display-label"><FaEnvelope /> E-mail</span><span className="display-value">{company.email || 'Non renseigné'}</span></div><div className="display-row"><span className="display-label"><FaGlobe /> Site web</span><span className="display-value">{company.siteWeb || 'Non renseigné'}</span></div><div className="display-row display-description"><span className="display-label">Description</span><span className="display-value">{company.description || 'Non renseignée'}</span></div></div></div>;
}
export default EncadreurEntreprise;
