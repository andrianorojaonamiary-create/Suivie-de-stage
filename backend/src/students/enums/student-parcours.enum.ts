/**
 * Filières / parcours de l'EMIT.
 *
 * Cet enum est purement TypeScript : il n'existe pas de type PostgreSQL
 * correspondant et students.formation est un varchar(150). Ajouter une filière
 * ne demande donc aucune migration, seulement cette liste et le formulaire.
 */
export enum StudentParcours {
  // Commune aux deux cycles
  DA2I = 'DA2I',
  ICM = 'ICM',
  AES = 'AES',
  CIGSI = 'CIGSI',

  // Licence (L1 à L3)
  CM = 'CM',
  RCPO = 'RCPO',

  // Master (M1 et M2)
  M2I = 'M2I',
  SIGS = 'SIGS',
  SDIA = 'SDIA',
  IGTI = 'IGTI',
  MD = 'MD',
  CMN = 'CMN',
  RPC = 'RPC',
}

export { StudentParcours as Parcours };
