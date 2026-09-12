/**
 * Nettoie une saisie de numéro de téléphone :
 * - seuls les chiffres et le signe « + » sont conservés
 * - le « + » n'est autorisé qu'en première position
 * - maximum 14 caractères au total (signe « + » inclus)
 */
export const sanitizePhone = (value = '') => {
  const cleaned = String(value).replace(/[^\d+]/g, '');
  const plus = cleaned.startsWith('+');
  const digits = cleaned.replace(/\+/g, '');
  return `${plus ? '+' : ''}${digits}`.slice(0, 14);
};