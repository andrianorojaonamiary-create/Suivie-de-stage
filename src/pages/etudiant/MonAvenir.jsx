import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { 
  FaGraduationCap, FaBriefcase, FaBuilding, FaMapMarkerAlt,
  FaCalendarAlt, FaEdit, FaSave, FaTimes, FaPlus,
  FaTrash, FaUserTie, FaClock,
  FaInfoCircle, FaPlusCircle,
  FaUserGraduate, FaChartLine, FaCalendarCheck
} from 'react-icons/fa';

function MonAvenir() {
  // const navigate = useNavigate();
  
  // ===== ÉTATS =====
  const [isEditingEmploi, setIsEditingEmploi] = useState(false);
  const [isEditingSituation, setIsEditingSituation] = useState(false);
  const [isEditingHistorique, setIsEditingHistorique] = useState(false);
  const [editingHistoriqueId, setEditingHistoriqueId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);

  // ===== SITUATION PROFESSIONNELLE =====
  const [situation, setSituation] = useState({
    statut: 'Diplômé',
    dateDiplome: '2028-07-12',
    situationPro: 'En emploi',
    dateMiseAJour: '2025-04-20'
  });

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

  // ===== EMPLOI ACTUEL =====
  const [emploiActuel, setEmploiActuel] = useState({
    entreprise: 'ABC Informatique',
    poste: 'Développeur Web',
    domaine: 'Informatique / Développement',
    localisation: 'Fianarantsoa, Madagascar',
    dateDebut: '2028-11-15',
    dateFin: '',
    typeContrat: 'CDI',
    description: ''
  });

  // ===== HISTORIQUE =====
  const [historiqueEmplois, setHistoriqueEmplois] = useState([
    {
      id: 1,
      entreprise: 'ABC Informatique',
      poste: 'Développeur Web',
      localisation: 'Fianarantsoa, Madagascar',
      dateDebut: '2028-01-01',
      dateFin: '2030-12-31'
    },
    {
      id: 2,
      entreprise: 'XYZ Tech',
      poste: 'Développeur Full-Stack',
      localisation: 'Antananarivo, Madagascar',
      dateDebut: '2028-01-01',
      dateFin: '2030-12-31'
    },
    {
      id: 3,
      entreprise: 'EMIT - Étudiant',
      poste: 'Licence en Informatique',
      localisation: 'Fianarantsoa, Madagascar',
      dateDebut: '2023-09-01',
      dateFin: '2028-07-31'
    }
  ]);

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

  const handleSituationSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsEditingSituation(false);
      alert('✅ Situation mise à jour avec succès !');
    }, 1500);
  };

  const handleSituationCancel = () => {
    setIsEditingSituation(false);
  };

  // ===== GESTION EMPLOI =====
  const handleEmploiChange = (e) => {
    const { name, value } = e.target;
    setEmploiActuel(prev => ({ ...prev, [name]: value }));
  };

  const handleEmploiSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsEditingEmploi(false);
      alert('✅ Emploi mis à jour avec succès !');
    }, 1500);
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

  const handleAddJob = () => {
    if (!newJob.entreprise || !newJob.poste) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }
    const newEntry = {
      id: Date.now(),
      ...newJob
    };
    setHistoriqueEmplois([...historiqueEmplois, newEntry]);
    setNewJob({ entreprise: '', poste: '', localisation: '', dateDebut: '', dateFin: '' });
    setShowAddJob(false);
    alert('✅ Expérience ajoutée avec succès !');
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

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setHistoriqueEmplois(prev => prev.map(job => 
      job.id === editingHistoriqueId ? { ...job, ...editJob } : job
    ));
    setIsEditingHistorique(false);
    setEditingHistoriqueId(null);
    setEditJob({ entreprise: '', poste: '', localisation: '', dateDebut: '', dateFin: '' });
    alert('✅ Expérience modifiée avec succès !');
  };

  const handleEditCancel = () => {
    setIsEditingHistorique(false);
    setEditingHistoriqueId(null);
  };

  const handleDeleteJob = (id, entreprise) => {
    if (window.confirm(`Supprimer l'expérience chez "${entreprise}" ?`)) {
      setHistoriqueEmplois(historiqueEmplois.filter(j => j.id !== id));
      alert(`🗑️ Expérience chez "${entreprise}" supprimée !`);
    }
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
          <h1><FaGraduationCap /> Mon avenir</h1>
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
                  <select
                    name="statut"
                    value={situation.statut}
                    onChange={handleSituationChange}
                    className="form-control"
                  >
                    <option value="Diplômé">Diplômé</option>
                    <option value="En cours">En cours</option>
                  </select>
                </div>
                <div className="form-group">
                  <label><FaCalendarAlt /> Date de diplôme</label>
                  <input
                    type="date"
                    name="dateDiplome"
                    value={situation.dateDiplome}
                    onChange={handleSituationChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label><FaChartLine /> Situation professionnelle</label>
                  <select
                    name="situationPro"
                    value={situation.situationPro}
                    onChange={handleSituationChange}
                    className="form-control"
                  >
                    <option value="En emploi">En emploi</option>
                    <option value="En recherche">En recherche</option>
                    <option value="Études supérieures">Études supérieures</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label><FaCalendarCheck /> Date de mise à jour</label>
                  <input
                    type="date"
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
                  <input
                    type="date"
                    name="dateDebut"
                    value={emploiActuel.dateDebut}
                    onChange={handleEmploiChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label><FaCalendarAlt /> Date de fin</label>
                  <input
                    type="date"
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
                  <select
                    name="typeContrat"
                    value={emploiActuel.typeContrat}
                    onChange={handleEmploiChange}
                    className="form-control"
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Alternance">Alternance</option>
                    <option value="Freelance">Freelance</option>
                  </select>
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
                                <input
                                  type="date"
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
                                <input
                                  type="date"
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
                                onClick={() => handleDeleteJob(job.id, job.entreprise)}
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
                      <input
                        type="date"
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
                      <input
                        type="date"
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