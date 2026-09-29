/**
 * Mise en forme d'un stage pour les écrans.
 *
 * Le mapping était dupliqué dans une dizaine de pages, avec des noms de champs
 * qui ne correspondaient à rien côté API : `item.title` au lieu de `intitule`,
 * `company.name` au lieu de `company.nom`, `student.firstName` au lieu de
 * `student.user.prenom`, et des statuts comparés en minuscules alors que
 * internships_status_enum est en majuscules. Résultat : des tableaux vides et
 * des colonnes à « undefined ».
 *
 * Une seule fonction évite que les copies divergent à nouveau. Les pages
 *-importent STATUT_LABELS pour leurs filtres et leurs badges.
 */

export const STATUT_LABELS = {
  A_VENIR: 'À venir',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  SUSPENDU: 'Suspendu',
  ANNULE: 'Annulé'
};

export const formatDateFr = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR');
};

export const fullName = (person) => {
  if (!person) return null;
  if (person.user) {
    const name = `${person.user.prenom ?? ''} ${person.user.nom ?? ''}`.trim();
    if (name) return name;
  }
  return `${person.prenom ?? ''} ${person.nom ?? ''}`.trim() || null;
};

/** Progression dérivée du statut : la table internships n'a pas de colonne. */
const progressFromStatus = (statut) => {
  if (statut === 'TERMINE' || statut === 'ANNULE') return 100;
  if (statut === 'EN_COURS') return 50;
  return 0;
};

const daysBetween = (from, to) =>
  Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000));

/**
 * Vue riche, adaptée aux pages qui affichent un détail de stage.
 * Toutes les valeurs proviennent de la réponse réelle de l'API.
 */
export const mapInternship = (item) => {
  const dateDebut = item?.dateDebut ?? null;
  const dateFin = item?.dateFin ?? null;
  const joursTotal =
    dateDebut && dateFin ? daysBetween(dateDebut, dateFin) : 0;
  const joursEcoules =
    dateDebut && new Date() > new Date(dateDebut) && new Date() < new Date(dateFin ?? dateDebut)
      ? daysBetween(dateDebut, new Date())
      : 0;

  return {
    id: item?.id,
    titre: item?.intitule || 'Sans intitulé',
    entreprise: item?.company?.nom || '',
    entrepriseId: item?.companyId,
    studentId: item?.studentId,
    supervisorId: item?.supervisorId,
    ville: item?.ville || item?.company?.ville || '',
    adresse: item?.lieu || item?.company?.adresse || '',
    domaine: item?.domaine || '',
    description: item?.description || '',
    observations: item?.observations || '',
    latitude: item?.latitude ?? null,
    longitude: item?.longitude ?? null,
    dateDebut,
    dateFin,
    dateDebutFr: formatDateFr(dateDebut),
    dateFinFr: formatDateFr(dateFin),
    // Statut enum en majuscules -> libellé d'affichage
    statut: STATUT_LABELS[item?.statut] || item?.statut || '',
    statutApi: item?.statut,
    etudiant: fullName(item?.student) || item?.student?.matricule || '',
    encadreur: fullName(item?.supervisor) || item?.supervisor?.fonction || '',
    tuteur: 'Non renseigné',
    progression: progressFromStatus(item?.statut),
    duree: joursTotal ? `${Math.round(joursTotal / 30)} mois` : '',
    joursRestants: Math.max(0, joursTotal - joursEcoules),
    joursTotal,
    joursEcoules
  };
};

/** Vue compacte pour les listes. */
export const mapInternshipSummary = (item) => ({
  id: item?.id,
  titre: item?.intitule || 'Sans intitulé',
  entreprise: item?.company?.nom || '',
  entrepriseId: item?.companyId,
  studentId: item?.studentId,
  supervisorId: item?.supervisorId,
  ville: item?.ville || item?.company?.ville || '',
  domaine: item?.domaine || '',
  dateDebut: item?.dateDebut ?? null,
  dateFin: item?.dateFin ?? null,
  dateDebutFr: formatDateFr(item?.dateDebut),
  dateFinFr: formatDateFr(item?.dateFin),
  statut: STATUT_LABELS[item?.statut] || item?.statut || '',
  statutApi: item?.statut,
  etudiant: fullName(item?.student) || item?.student?.matricule || '',
  encadreur: fullName(item?.supervisor) || item?.supervisor?.fonction || '',
  progression: progressFromStatus(item?.statut)
});
