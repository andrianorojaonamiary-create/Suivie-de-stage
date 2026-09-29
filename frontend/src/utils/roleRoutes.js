/**
 * Source unique du mapping rôle → dashboard.
 *
 * Ce mapping était recopié dans PrivateRoute, App et Sidebar. Les trois
 * versions divergeaient : Sidebar ne reconnaissait que ROLE_ADMIN, alors que
 * l'API renvoie le rôle ADMINISTRATEUR, si bien qu'un administrateur passait
 * la garde de route mais retombait sur le menu par défaut du drawer.
 */

/** Rôles acceptés par l'API et par le front, sans préfixe. */
export const ADMIN_ROLES = ['ADMIN', 'ADMINISTRATEUR'];

export const isAdmin = (role) => {
  const bare = normalizeRole(role);
  return ADMIN_ROLES.includes(bare);
};

/**
 * Retire le préfixe ROLE_ et normalise la casse pour que ROLE_Admin,
 * ROLE_ADMINISTRATEUR et ADMINISTRATEUR soient tous reconnus.
 */
export const normalizeRole = (role) =>
  typeof role === 'string'
    ? role.replace(/^ROLE_/, '').trim().toUpperCase()
    : '';

export const getDashboardPath = (role) => {
  switch (normalizeRole(role)) {
    case 'ADMIN':
    case 'ADMINISTRATEUR':
      return '/admin/dashboard';
    case 'ENSEIGNANT':
      return '/enseignant/dashboard';
    case 'ETUDIANT':
      return '/etudiant/dashboard';
    case 'ENCADREUR':
      return '/encadreur/dashboard';
    // Sans ce cas, un compte entreprise retombait sur '/dashboard', que
    // DynamicDashboardRedirect redirigeait vers lui-même : boucle de
    // navigation infinie, l'utilisateur restait sur un chargement éternel.
    case 'ENTREPRISE':
      return '/entreprise';
    default:
      return '/dashboard';
  }
};
