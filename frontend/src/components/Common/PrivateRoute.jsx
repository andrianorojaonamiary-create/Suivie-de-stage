import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath, isAdmin } from '../../utils/roleRoutes';

function PrivateRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const isAllowed =
    allowedRoles.length === 0 ||
    allowedRoles.includes(user.role) ||
    // Les routes admin acceptent ROLE_ADMIN et ROLE_ADMINISTRATEUR ; ne pas
    // rejeter ce second cas puisque c'est la valeur renvoyée par l'API.
    (allowedRoles.includes('ROLE_ADMIN') && isAdmin(user.role));

  if (!isAllowed) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
}

export default PrivateRoute;
