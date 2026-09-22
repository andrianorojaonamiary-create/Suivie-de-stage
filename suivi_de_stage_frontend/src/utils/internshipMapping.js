export const STATUT_LABELS = {
  EN_ATTENTE: "En attente de validation",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  SUSPENDU: "Suspendu",
  ANNULE: "Annulé",
  REFUSE: "Refusé",
  A_VENIR: "À venir",
};

export const STATUT_BADGE = {
  "En attente de validation": "badge-en-attente",
  "En attente": "badge-en-attente",
  "En cours": "badge-en-cours",
  Terminé: "badge-termine",
  "À venir": "badge-termine",
  Suspendu: "badge-refuse",
  Annulé: "badge-refuse",
  Refusé: "badge-refuse",
  Validé: "badge-valide",
};

export const getStatutBadge = (statut) =>
  STATUT_BADGE[statut] || "badge-en-attente";

const MS_PER_DAY = 86_400_000;

const formatDateStr = (value) => {
  if (!value) return null;
  const normalized =
    String(value).length <= 10 ? String(value) : String(value).split("T")[0];
  return normalized;
};

const dateToMs = (value) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

export function computeStageProgress(dateDebut, dateFin) {
  const start = dateToMs(dateDebut);
  const end = dateToMs(dateFin);
  if (start == null || end == null || end <= start) return 0;
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export function computeStageDays(dateDebut, dateFin) {
  const start = dateToMs(dateDebut);
  const end = dateToMs(dateFin);
  if (start == null || end == null) {
    return { joursEcoules: 0, joursTotal: 0, joursRestants: 0, duree: "" };
  }
  const now = Date.now();
  const totalDays = Math.max(1, Math.round((end - start) / MS_PER_DAY));
  const joursEcoules =
    now <= start ? 0 : Math.max(0, Math.floor((now - start) / MS_PER_DAY));
  const joursRestants = Math.max(0, totalDays - joursEcoules);
  const months = Math.max(1, Math.round(totalDays / 30));
  const duree =
    months >= 12
      ? `${(months / 12).toFixed(1).replace(".", ",")} an${months >= 24 ? "s" : ""}`
      : `${months} mois`;
  return { joursEcoules, joursTotal: totalDays, joursRestants, duree };
}

const formatSupervisor = (supervisor, fallback = "Non renseigné") => {
  if (!supervisor) return fallback;
  const name = [
    supervisor.user?.nom,
    supervisor.user?.prenom,
    supervisor.nom,
    supervisor.prenom,
  ]
    .filter(Boolean)
    .join(" ");
  if (name) return name;
  // Pas de nom : afficher fonction + spécialité si dispo
  const detail = [supervisor.fonction, supervisor.specialite]
    .filter(Boolean)
    .join(" - ");
  return detail || fallback;
};

const formatUser = (user, fallback = "Non renseigné") => {
  if (!user) return fallback;
  if (user.user) {
    return [user.user.nom, user.user.prenom].filter(Boolean).join(" ") || fallback;
  }
  return [user.nom, user.prenom].filter(Boolean).join(" ") || fallback;
};

export const toApiUpdatePayload = (formData) => ({
  intitule: formData.titre,
  description: formData.description,
  domaine: formData.domaine,
  lieu: formData.adresse,
  ville: formData.ville,
  dateDebut: formData.dateDebut,
  dateFin: formData.dateFin,
});

export function mapInternship(item = {}) {
  const dateDebut = formatDateStr(item.dateDebut);
  const dateFin = formatDateStr(item.dateFin);
  const progression = computeStageProgress(item.dateDebut, item.dateFin);
  const days = computeStageDays(item.dateDebut, item.dateFin);
  const statut = STATUT_LABELS[item.statut] || "En attente";

  return {
    id: item.id,
    etudiant: item.student?.user
      ? `${item.student.user.prenom ?? ""} ${item.student.user.nom ?? ""}`.trim()
      : "Étudiant",
    intitule: item.intitule || "",
    titre: item.intitule || "Stage sans titre",
    description: item.description || "",
    domaine: item.domaine || "",
    lieu: item.lieu || "",
    adresse: item.lieu || "",
    ville: item.ville || item.company?.ville || "Antananarivo",
    entreprise: item.company?.nom || item.companyName || "Entreprise",
    companyId: item.company?.id || null,
    supervisorId: item.supervisor?.id || null,
    tuteurId: item.tuteur?.id || null,
    tuteur: formatUser(item.tuteur),
    encadreur:
      item.encadreurProfessionnelNom || formatSupervisor(item.supervisor),
    encadreurId: item.supervisor?.id || null,
    encadreurProfessionnelNom: item.encadreurProfessionnelNom || null,
    dateDebut,
    dateFin,
    statut,
    statutApi: item.statut,
    observations: item.observations || "",
    commentaireValidation: item.observations || null,
    convention: item.convention || null,
    conventionNom: item.conventionNom || null,
    latitude: item.latitude,
    longitude: item.longitude,
    dateCreation: item.dateCreation || null,
    dateModification: item.dateModification || null,
    progression,
    ...days,
  };
}

export function mapInternshipList(list = []) {
  return list.map((item) => mapInternship(item));
}

export default mapInternship;
