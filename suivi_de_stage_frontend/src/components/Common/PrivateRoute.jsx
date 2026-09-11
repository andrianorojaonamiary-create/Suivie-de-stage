import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

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

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const normalizedRole = user.role?.toUpperCase();
    const dashboardPath =
      normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'ROLE_ADMINISTRATEUR' ? '/admin/dashboard' :
      normalizedRole === 'ROLE_ENSEIGNANT' ? '/enseignant/dashboard' :
      normalizedRole === 'ROLE_ETUDIANT' ? '/etudiant/dashboard' :
      normalizedRole === 'ROLE_ENCADREUR' ? '/encadreur/dashboard' :
      '/dashboard';

    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
}

export default PrivateRoute;