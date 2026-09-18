import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import { 
  FaGraduationCap, FaBriefcase, FaBuilding, FaMapMarkerAlt,
  FaCalendarAlt, FaEdit, FaSave, FaTimes, FaPlus,
  FaTrash, FaUserTie, FaClock,
  FaInfoCircle, FaPlusCircle,
  FaUserGraduate, FaChartLine, FaCalendarCheck
} from 'react-icons/fa';
import { professionalSituationsApi } from '../../api';
import { getApiErrorMessage } from '../../api/apiClient';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import DateField from '../../components/Common/DateField';
import { toast } from 'react-toastify';

const SITUATION_TO_API = {
  'En emploi': 'EMPLOYE',
  'En recherche': 'EN_RECHERCHE_EMPLOI',
  'Études supérieures': 'POURSUITE_ETUDES',
  'Entrepreneur': 'ENTREPRENEUR',
  'Autre': 'AUTRE',
};

function MonAvenir() {
  const [situation, setSituation] = useState({
    statut: '',
    dateDiplome: '',
    situationPro: '',
    dateMiseAJour: '',
    statutAcademique: ''
  });
  const [isEditingEmploi, setIsEditingEmploi] = useState(false);
  const [isEditingSituation, setIsEditingSituation] = useState(false);
  const [isEditingHistorique, setIsEditingHistorique] = useState(false);
  const [editingHistoriqueId, setEditingHistoriqueId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  // ===== EMPLOI ACTUEL =====
  const [emploiActuel, setEmploiActuel] = useState({
    entreprise: '',
    poste: '',
    domaine: '',
    localisation: '',
    dateDebut: '',
    dateFin: '',
    typeContrat: '',
    description: ''
  });

  // ===== HISTORIQUE =====
  const [historiqueEmplois, setHistoriqueEmplois] = useState([]);

  const [situationApiId, setSituationApiId] = useState(null);

  const loadAvenir = useCallback(async () => {
    try {
      setLoading(true);
      const res = await professionalSituationsApi.getMe();
      const list = Array.isArray(res) ? res : [];
      if (list.length > 0) {
        const current = list[0];
        setSituationApiId(current.id || null);
        setEmploiActuel({
          entreprise: current.entreprise || '',
          poste: current.poste || '',
          domaine: current.domaine || '',
          localisation: [current.ville, current.pays].filter(Boolean).join(', '),
          dateDebut: current.dateDebut ? String(current.dateDebut).split('T')[0] : '',
          dateFin: current.dateFin ? String(current.dateFin).split('T')[0] : '',
          typeContrat: current.typeContrat || 'CDI',
          description: current.description || ''
        });

        setSituation(prev => ({
          ...prev,
          situationPro: current.situation || 'Autre',
          statutAcademique: current.statutAcademique || '',
          statut: current.statutAcademique || prev.statut,
          dateDiplome: current.dateDiplome ? String(current.dateDiplome).split('T')[0] : prev.dateDiplome,
          dateMiseAJour: current.dateModification ? String(current.dateModification).split('T')[0] : prev.dateMiseAJour
        }));

        setHistoriqueEmplois(list.slice(1).map((item) => ({
          id: item.id,
          entreprise: item.entreprise || 'Entreprise',
          poste: item.poste || 'Poste',
          localisation: [item.ville, item.pays].filter(Boolean).join(', '),
          dateDebut: item.dateDebut ? String(item.dateDebut).split('T')[0] : '',
          dateFin: item.dateFin ? String(item.dateFin).split('T')[0] : ''
        })));
      }
    } catch (err) {
      console.error('Erreur chargement mon avenir:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvenir();
  }, [loadAvenir]);

  // ===== TEXTE AUTOMATIQUE =====
  const getSituationDetail = () => {
    switch(situation.situationPro) {
      case 'En emploi':
        return 'Vous exercez actuellement une activité professionnelle.';
      case 'En recherche':
        return 'Vous êtes actuellement en recherche d\'emploi.';
      case 'Études supérieures':
        return 'Vous poursuivez actuellement des études supérieures.';
      case 'Autre':
        return 'Vous êtes dans une autre situation professionnelle.';
      default:
        return '';
    }
  };



  // ===== FORMULAIRE HISTORIQUE =====
  const [newJob, setNewJob] = useState({
    entreprise: '',
    poste: '',
    localisation: '',
    dateDebut: '',
    dateFin: ''
  });

  const [editJob, setEditJob] = useState({
    entreprise: '',
    poste: '',
    localisation: '',
    dateDebut: '',
    dateFin: ''
  });

  // ===== FORMAT DATE =====
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Présent';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // ===== GESTION SITUATION =====
  const handleSituationChange = (e) => {
    const { name, value } = e.target;
    setSituation(prev => ({ ...prev, [name]: value }));
  };

  const emploiPayload = (job) => {
    const [ville = '', pays = ''] = (job.localisation || '').split(',').map((s) => s.trim());
    return {
      entreprise: job.entreprise || undefined,
      poste: job.poste || undefined,
      domaine: job.domaine || undefined,
      ville: ville || undefined,
      pays: pays || undefined,
      dateDebut: job.dateDebut || undefined,
      dateFin: job.dateFin || undefined,
      typeContrat: job.typeContrat || undefined,
      description: job.description || undefined,
    };
  };

  const handleSituationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      situation: SITUATION_TO_API[situation.situationPro] || 'AUTRE',
      statutAcademique: situation.statutAcademique || undefined,
      dateDiplome: situation.dateDiplome || undefined,
    };
    try {
      if (situationApiId) {
        await professionalSituationsApi.update(situationApiId, payload);
      } else {
        const created = await professionalSituationsApi.create(payload);
        setSituationApiId(created?.id || null);
      }
      setIsEditingSituation(false);
      toast.success('Situation mise à jour avec succès !');
      await loadAvenir();
    } catch (err) {
      console.error('Erreur mise à jour situation:', err);
      toast.error(getApiErrorMessage(err, 'Erreur lors de la mise à jour de la situation'));
      setLoading(false);
    }
  };

  const handleSituationCancel = () => {
    setIsEditingSituation(false);
  };

  // ===== GESTION EMPLOI =====
  const handleEmploiChange = (e) => {
    const { name, value } = e.target;
    setEmploiActuel(prev => ({ ...prev, [name]: value }));
  };

  const handleEmploiSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...emploiPayload(emploiActuel),
      situation: SITUATION_TO_API[situation.situationPro] || 'EMPLOYE',
    };
    try {
      if (situationApiId) {
        await professionalSituationsApi.update(situationApiId, payload);
      } else {
        const created = await professionalSituationsApi.create(payload);
        setSituationApiId(created?.id || null);
        await loadAvenir();
      }
      setIsEditingEmploi(false);
      toast.success('Emploi mis à jour avec succès !');
      if (situationApiId) await loadAvenir();
    } catch (err) {
      console.error('Erreur mise à jour emploi:', err);
      toast.error(getApiErrorMessage(err, 'Erreur lors de la mise à jour de l\u2019emploi'));
      setLoading(false);
    }
  };

  const handleEmploiCancel = () => {
    setIsEditingEmploi(false);
  };

  // ===== GESTION HISTORIQUE =====
  const handleNewJobChange = (e) => {
    const { name, value } = e.target;
    setNewJob(prev => ({ ...prev, [name]: value }));
  };

  const handleEditJobChange = (e) => {
    const { name, value } = e.target;
    setEditJob(prev => ({ ...prev, [name]: value }));
  };

  const handleAddJob = async () => {
    if (!newJob.entreprise || !newJob.poste) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }
    try {
      await professionalSituationsApi.create({
        ...emploiPayload(newJob),
        situation: SITUATION_TO_API[situation.situationPro] || 'EMPLOYE',
      });
      setNewJob({ entreprise: '', poste: '', localisation: '', dateDebut: '', dateFin: '' });
      setShowAddJob(false);
      toast.success('Expérience ajoutée avec succès !');
      await loadAvenir();
    } catch (err) {
      console.error('Erreur ajout expérience:', err);
      toast.error(getApiErrorMessage(err, 'Erreur lors de l\u2019ajout de l\u2019expérience'));
    }
  };

  const handleEditClick = (job) => {
    setIsEditingHistorique(true);
    setEditingHistoriqueId(job.id);
    setEditJob({
      entreprise: job.entreprise,
      poste: job.poste,
      localisation: job.localisation,
      dateDebut: job.dateDebut,
      dateFin: job.dateFin
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await professionalSituationsApi.update(editingHistoriqueId, emploiPayload(editJob));
      setIsEditingHistorique(false);
      setEditingHistoriqueId(null);
      setEditJob({ entreprise: '', poste: '', localisation: '', dateDebut: '', dateFin: '' });
      toast.success('Expérience modifiée avec succès !');
      await loadAvenir();
    } catch (err) {
      console.error('Erreur modification expérience:', err);
      toast.error(getApiErrorMessage(err, 'Erreur lors de la modification de l\u2019expérience'));
    }
  };

  const handleEditCancel = () => {
    setIsEditingHistorique(false);
    setEditingHistoriqueId(null);
  };

  const handleDeleteClick = (id, entreprise) => {
    setJobToDelete({ id, entreprise });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (jobToDelete?.id) {
        await professionalSituationsApi.delete(jobToDelete.id);
      }
      toast.success(`Expérience chez "${jobToDelete?.entreprise}" supprimée !`);
      await loadAvenir();
    } catch (err) {
      console.error('Erreur suppression expérience:', err);
      toast.error(getApiErrorMessage(err, 'Erreur lors de la suppression de l\u2019expérience'));
    } finally {
      setShowDeleteModal(false);
      setJobToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  // ===== REGROUPER PAR ANNÉE =====
  const groupedJobs = historiqueEmplois.reduce((acc, job) => {
    const year = job.dateDebut ? new Date(job.dateDebut).getFullYear() : 'Année inconnue';
    const key = String(year);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(job);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedJobs).sort((a, b) => b - a);

  const hasEmploi = emploiActuel.entreprise || emploiActuel.poste;
  const hasHistorique = historiqueEmplois.length > 0;
  const situationDetail = getSituationDetail();

  return (
    <div className="etudiant-avenir">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div className="header-content">
          <h1>Mon avenir</h1>
          <p className="text-muted">Votre parcours professionnel</p>
        </div>
      </div>

      {/* ===== SITUATION PROFESSIONNELLE ===== */}
      <div className="avenir-card">
        <div className="avenir-card-header">
          <h3><FaUserGraduate /> Ma situation professionnelle</h3>
          {!isEditingSituation && (
            <button className="btn-edit-header" onClick={() => setIsEditingSituation(true)}>
              <FaEdit /> Modifier
            </button>
          )}
        </div>
        <div className="avenir-card-body">
          {isEditingSituation ? (
            <form onSubmit={handleSituationSubmit}>
              <div className="situation-edit-grid">
                <div className="form-group">
                  <label><FaUserGraduate /> Statut</label>
                  <SelectPersonnalise
                    value={situation.statut}
                    onChange={(v) => handleSituationChange({ target: { name: 'statut', value: v } })}
                    className="form-control"
                    options={[
                      { value: 'Diplômé', label: 'Diplômé' },
                      { value: 'En cours', label: 'En cours' }
                    ]}
                  />
                </div>
                <div className="form-group">
                  <label><FaCalendarAlt /> Date de diplôme</label>
                  <DateField
                    name="dateDiplome"
                    value={situation.dateDiplome}
                    onChange={handleSituationChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label><FaChartLine /> Situation professionnelle</label>
                  <SelectPersonnalise
                    value={situation.situationPro}
                    onChange={(v) => handleSituationChange({ target: { name: 'situationPro', value: v } })}
                    className="form-control"
                    options={[
                      { value: 'En emploi', label: 'En emploi' },
                      { value: 'En recherche', label: 'En recherche' },
                      { value: 'Études supérieures', label: 'Études supérieures' },
                      { value: 'Autre', label: 'Autre' }
                    ]}
                  />
                </div>
                <div className="form-group">
                  <label><FaCalendarCheck /> Date de mise à jour</label>
                  <DateField
                    name="dateMiseAJour"
                    value={situation.dateMiseAJour}
                    onChange={handleSituationChange}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  <FaSave /> {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
                <button type="button" className="btn-reset" onClick={handleSituationCancel}>
                  <FaTimes /> Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="situation-cards">
              <div className="situation-card">
                <div className="situation-card-header">
                  <FaUserGraduate className="card-icon" />
                  <h4>Statut</h4>
                </div>
                <div className="situation-card-body">
                  <span className="situation-value">{situation.statut}</span>
                  <span className="situation-detail">Diplômé le {formatDate(situation.dateDiplome)}</span>
                </div>
              </div>
              <div className="situation-card">
                <div className="situation-card-header">
                  <FaChartLine className="card-icon" />
                  <h4>Situation professionnelle</h4>
                </div>
                <div className="situation-card-body">
                  <span className="situation-value">{situation.situationPro}</span>
                  <span className="situation-detail">{situationDetail}</span>
                </div>
              </div>
              <div className="situation-card">
                <div className="situation-card-header">
                  <FaCalendarCheck className="card-icon" />
                  <h4>Dates</h4>
                </div>
                <div className="situation-card-body">
                  <span className="situation-value">Mis à jour</span>
                  <span className="situation-detail">le {formatDate(situation.dateMiseAJour)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== EMPLOI ACTUEL ===== */}
      <div className="avenir-card">
        <div className="avenir-card-header">
          <h3><FaBriefcase /> Mon emploi actuel</h3>
          {!isEditingEmploi && (
            <button className="btn-edit-header" onClick={() => setIsEditingEmploi(true)}>
              <FaEdit /> {hasEmploi ? 'Modifier' : 'Ajouter un emploi'}
            </button>
          )}
        </div>
        <div className="avenir-card-body">
          {!hasEmploi && !isEditingEmploi ? (
            <div className="empty-state-avenir">
              <div className="empty-icon"><FaPlusCircle /></div>
              <p>Vous n'avez pas encore renseigné votre emploi actuel</p>
              <p className="empty-sub">Cliquez sur "Ajouter un emploi" pour commencer</p>
            </div>
          ) : isEditingEmploi ? (
            <form onSubmit={handleEmploiSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label><FaBuilding /> Entreprise *</label>
                  <input
                    type="text"
                    name="entreprise"
                    value={emploiActuel.entreprise}
                    onChange={handleEmploiChange}
                    placeholder="Nom de l'entreprise"
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label><FaUserTie /> Poste occupé *</label>
                  <input
                    type="text"
                    name="poste"
                    value={emploiActuel.poste}
                    onChange={handleEmploiChange}
                    placeholder="Votre poste"
                    className="form-control"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label><FaInfoCircle /> Domaine d'activité</label>
                  <input
                    type="text"
                    name="domaine"
                    value={emploiActuel.domaine}
                    onChange={handleEmploiChange}
                    placeholder="Informatique / Développement"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label><FaMapMarkerAlt /> Localisation</label>
                  <input
                    type="text"
                    name="localisation"
                    value={emploiActuel.localisation}
                    onChange={handleEmploiChange}
                    placeholder="Fianarantsoa, Madagascar"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label><FaCalendarAlt /> Date d'embauche</label>
                  <DateField
                    name="dateDebut"
                    value={emploiActuel.dateDebut}
                    onChange={handleEmploiChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label><FaCalendarAlt /> Date de fin</label>
                  <DateField
                    name="dateFin"
                    value={emploiActuel.dateFin}
                    onChange={handleEmploiChange}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type de contrat</label>
                  <SelectPersonnalise
                    value={emploiActuel.typeContrat}
                    onChange={(v) => handleEmploiChange({ target: { name: 'typeContrat', value: v } })}
                    placeholder="Sélectionnez un type"
                    className="form-control"
                    options={[
                      { value: 'CDI', label: 'CDI' },
                      { value: 'CDD', label: 'CDD' },
                      { value: 'Stage', label: 'Stage' },
                      { value: 'Alternance', label: 'Alternance' },
                      { value: 'Freelance', label: 'Freelance' }
                    ]}
                  />
                </div>
                <div className="form-group">
                  <label>Description (optionnel)</label>
                  <input
                    type="text"
                    name="description"
                    value={emploiActuel.description}
                    onChange={handleEmploiChange}
                    placeholder="Description du poste"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  <FaSave /> {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
                <button type="button" className="btn-reset" onClick={handleEmploiCancel}>
                  <FaTimes /> Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="emploi-display">
              <div className="emploi-item">
                <span className="emploi-label"><FaBuilding /> Entreprise</span>
                <span className="emploi-value">{emploiActuel.entreprise}</span>
              </div>
              <div className="emploi-item">
                <span className="emploi-label"><FaUserTie /> Poste occupé</span>
                <span className="emploi-value">{emploiActuel.poste}</span>
              </div>
              <div className="emploi-item">
                <span className="emploi-label"><FaInfoCircle /> Domaine d'activité</span>
                <span className="emploi-value">{emploiActuel.domaine}</span>
              </div>
              <div className="emploi-item">
                <span className="emploi-label"><FaMapMarkerAlt /> Localisation</span>
                <span className="emploi-value">{emploiActuel.localisation}</span>
              </div>
              <div className="emploi-item">
                <span className="emploi-label"><FaCalendarAlt /> Date d'embauche</span>
                <span className="emploi-value">{formatDate(emploiActuel.dateDebut)} – {emploiActuel.dateFin ? formatDate(emploiActuel.dateFin) : 'Présent'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

 {/* ===== PARCOURS PROFESSIONNEL ===== */}
      <div className="avenir-card">
        <div className="avenir-card-header">
          <h3><FaClock /> Mon parcours professionnel</h3>
          <button className="btn-add" onClick={() => setShowAddJob(!showAddJob)}>
            <FaPlus /> Ajouter une expérience
          </button>
        </div>
        <div className="avenir-card-body">
          {!hasHistorique && !showAddJob ? (
            <div className="empty-state-avenir">
              <div className="empty-icon"><FaPlusCircle /></div>
              <p>Aucune expérience enregistrée</p>
              <p className="empty-sub">Cliquez sur "Ajouter une expérience" pour commencer</p>
            </div>
          ) : (
            <div className="parcours-timeline">
              {sortedYears.map((year) => (
                <div key={year} className="parcours-year-group">
                  {/* ===== CONTENEUR CERCLE + LIGNE ===== */}
                  <div className="parcours-left-col">
                    <div className="parcours-year-circle">{year}</div>
                    <div className="parcours-year-line"></div>
                  </div>

                  {/* ===== EXPÉRIENCES ===== */}
                  <div className="parcours-year-items">
                    {groupedJobs[year].map((job) => (
                      <div key={job.id} className="parcours-item">
                        {isEditingHistorique && editingHistoriqueId === job.id ? (
                          <form onSubmit={handleEditSubmit} className="edit-parcours-form">
                            <div className="form-row">
                              <div className="form-group">
                                <label><FaBuilding /> Entreprise *</label>
                                <input
                                  type="text"
                                  name="entreprise"
                                  value={editJob.entreprise}
                                  onChange={handleEditJobChange}
                                  className="form-control"
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label><FaUserTie /> Poste *</label>
                                <input
                                  type="text"
                                  name="poste"
                                  value={editJob.poste}
                                  onChange={handleEditJobChange}
                                  className="form-control"
                                  required
                                />
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="form-group">
                                <label><FaMapMarkerAlt /> Localisation</label>
                                <input
                                  type="text"
                                  name="localisation"
                                  value={editJob.localisation}
                                  onChange={handleEditJobChange}
                                  className="form-control"
                                />
                              </div>
                              <div className="form-group">
                                <label><FaCalendarAlt /> Date début</label>
                                <DateField
                                  name="dateDebut"
                                  value={editJob.dateDebut}
                                  onChange={handleEditJobChange}
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="form-group">
                                <label><FaCalendarAlt /> Date fin</label>
                                <DateField
                                  name="dateFin"
                                  value={editJob.dateFin}
                                  onChange={handleEditJobChange}
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="form-actions">
                              <button type="submit" className="btn-primary">
                                <FaSave /> Enregistrer
                              </button>
                              <button type="button" className="btn-reset" onClick={handleEditCancel}>
                                <FaTimes /> Annuler
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="parcours-item-header">
                              <span className="parcours-entreprise"><FaBuilding /> {job.entreprise}</span>
                              <span className="parcours-poste">{job.poste}</span>
                            </div>
                            <div className="parcours-item-dates">
                              <FaCalendarAlt /> {formatDate(job.dateDebut)} → {job.dateFin ? formatDate(job.dateFin) : 'Présent'}
                            </div>
                            <div className="parcours-item-lieu">
                              <FaMapMarkerAlt /> {job.localisation}
                            </div>
                            <div className="parcours-item-actions">
                              <button 
                                className="btn-edit-item" 
                                onClick={() => handleEditClick(job)}
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="btn-delete-item" 
                                onClick={() => handleDeleteClick(job.id, job.entreprise)}
                                title="Supprimer"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {showAddJob && (
                <div className="add-job-form">
                  <h4><FaPlus /> Ajouter une expérience</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label><FaBuilding /> Entreprise *</label>
                      <input
                        type="text"
                        name="entreprise"
                        value={newJob.entreprise}
                        onChange={handleNewJobChange}
                        placeholder="Nom de l'entreprise"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label><FaUserTie /> Poste *</label>
                      <input
                        type="text"
                        name="poste"
                        value={newJob.poste}
                        onChange={handleNewJobChange}
                        placeholder="Votre poste"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label><FaMapMarkerAlt /> Localisation</label>
                      <input
                        type="text"
                        name="localisation"
                        value={newJob.localisation}
                        onChange={handleNewJobChange}
                        placeholder="Fianarantsoa, Madagascar"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label><FaCalendarAlt /> Date début</label>
                      <DateField
                        name="dateDebut"
                        value={newJob.dateDebut}
                        onChange={handleNewJobChange}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label><FaCalendarAlt /> Date fin</label>
                      <DateField
                        name="dateFin"
                        value={newJob.dateFin}
                        onChange={handleNewJobChange}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn-primary" onClick={handleAddJob}>
                      <FaSave /> Ajouter
                    </button>
                    <button type="button" className="btn-reset" onClick={() => setShowAddJob(false)}>
                      <FaTimes /> Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL DE CONFIRMATION SUPPRESSION ===== */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmer la suppression</h3>
            <p>Voulez-vous vraiment supprimer cette expérience chez "{jobToDelete?.entreprise}" ? Cette action est irréversible.</p>
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

      {/* ===== FOOTER ===== */}
      <div className="avenir-footer">
        <div className="footer-icon">
          <FaGraduationCap />
        </div>
        <h3>Votre avenir commence maintenant !</h3>
        <p>
          Tenez à jour vos informations pour que l'EMIT puisse suivre votre parcours professionnel 
          et vous accompagner au mieux dans votre évolution.
        </p>
      </div>
    </div>
  );
}

export default MonAvenir;