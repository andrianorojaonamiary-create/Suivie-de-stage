import { useState, useEffect } from 'react';
import {
  FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaGlobe, FaUserTie, FaExclamationTriangle
} from 'react-icons/fa';
import { companiesApi } from '../../api';
import { getApiErrorMessage } from '../../api/apiClient';

/**
 * Espace d'un compte ENTREPRISE.
 *
 * L'interface n'existait pas : roleRoutes renvoyait '/dashboard' pour ce rôle,
 * et DynamicDashboardRedirect redirigeait '/dashboard' vers lui-même, ce qui
 * produisait une boucle de navigation infinie. La page n'existait pas non plus
 * dans App.jsx, faute de quoi le correctif du mapping aurait simplement déplacé
 * la boucle.
 *
 * Elle reste volontairement réduite : elle affiche l'entreprise rattache au
 * compte via GET /companies/me, sans écran de gestion complet. Un compte
 * entreprise sans entreprise rattache, ce qui est le cas tant que
 * l'inscription ne le créé pas automatiquement, reçoit un message explicite
 * plutôt qu'un écran vide.
 */
function EntrepriseEspace() {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await companiesApi.getMe();
      setCompany(data ?? null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erreur de chargement de votre entreprise'));
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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

  if (!company) {
    return (
      <div className="etudiant-encadreur-page">
        <div className="page-header">
          <div>
            <h1>Mon entreprise</h1>
            <p className="text-muted">Espace entreprise</p>
          </div>
        </div>
        <div className="empty-state">
          <FaExclamationTriangle className="empty-icon" />
          <p>Aucune entreprise n'est encore rattachée à ce compte</p>
          <p className="empty-sub">
            L'administration doit créér la fiche entreprise et la rattacher à
            votre compte. Contactez-la pour finaliser votre accès.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="etudiant-encadreur-page">
      <div className="page-header">
        <div>
          <h1>{company.nom || 'Mon entreprise'}</h1>
          <p className="text-muted">Espace entreprise</p>
        </div>
      </div>

      <div className="encadreur-grid">
        <div className="encadreur-card">
          <div className="encadreur-card-top">
            <div className="encadreur-avatar">
              <FaBuilding />
            </div>
            <div className="encadreur-info">
              <h3>{company.nom}</h3>
              <span className="encadreur-fonction">
                {company.secteurActivite || company.secteur || 'Secteur non renseigné'}
              </span>
            </div>
          </div>
          <div className="encadreur-card-middle">
            {company.ville && <p><FaMapMarkerAlt /> {company.ville}</p>}
            {company.adresse && <p><FaBuilding /> {company.adresse}</p>}
            {company.telephone && <p><FaPhone /> {company.telephone}</p>}
            {company.email && <p><FaEnvelope /> {company.email}</p>}
            {company.siteWeb && <p><FaGlobe /> {company.siteWeb}</p>}
            {company.user?.nom && (
              <p><FaUserTie /> {company.user.prenom} {company.user.nom}</p>
            )}
          </div>
          {company.description && (
            <div className="encadreur-card-middle">
              <p>{company.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EntrepriseEspace;
