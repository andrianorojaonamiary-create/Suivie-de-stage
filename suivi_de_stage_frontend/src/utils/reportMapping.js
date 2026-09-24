export const REPORT_STATUS_LABELS = {
  EN_ATTENTE: 'En révision',
  APPROUVE: 'Validé',
  REJETE: 'Refusé',
};

export const REPORT_TYPE_LABELS = {
  PRISE_EN_MAIN: 'Rapport de prise en main',
  INTERMEDIAIRE: 'Rapport intermédiaire',
  FINAL: 'Rapport final',
};

export const REPORT_TYPE_ENUM = {
  'Prise en main': 'PRISE_EN_MAIN',
  Intermédiaire: 'INTERMEDIAIRE',
  Final: 'FINAL',
};

export const mapReportStatus = (statut) =>
  REPORT_STATUS_LABELS[statut] || statut || 'En attente';

export const mapReportType = (type) =>
  REPORT_TYPE_LABELS[type] || type || 'Rapport';

const nf = (value) =>
  String(value).includes('.')
    ? String(value).replace('.', ',')
    : String(value);

export const formatReportSize = (size) => {
  if (size === null || size === undefined || size === '') return '—';
  const bytes = Number(size);
  if (Number.isNaN(bytes) || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${nf((bytes / 1024).toFixed(1))} Ko`;
  return `${nf((bytes / (1024 * 1024)).toFixed(1))} Mo`;
};

export const formatReportDate = (date) => {
  if (!date) return '—';
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? '—'
    : value.toLocaleDateString('fr-FR');
};