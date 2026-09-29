/**
 * Les endpoints paginés du backend renvoient { data: [...], meta: {...} }, les
 * endpoints simples renvoient un tableau. Les pages lisaient jusqu'ici
 * `res?.items || []` : la propriété n'existe pas, le résultat était donc
 * systématiquement vide et l'écran restait bloqué sur les données de
 * démonstration codées en dur.
 *
 * extractList centralise la lecture pour que le format de réponse puisse
 * évoluer sans casser les ~20 appelants.
 */
export const extractList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

/** Renseigné uniquement pour les endpoints paginés. */
export const extractMeta = (response) => response?.meta ?? null;
