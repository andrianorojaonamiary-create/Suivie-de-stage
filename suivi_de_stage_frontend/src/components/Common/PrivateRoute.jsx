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
    const dashboardPath = 
      user.role === 'ROLE_ADMIN' ? '/admin/dashboard' :
      user.role === 'ROLE_ENSEIGNANT' ? '/enseignant/dashboard' :
      user.role === 'ROLE_ETUDIANT' ? '/etudiant/dashboard' :
      user.role === 'ROLE_ENCADREUR' ? '/encadreur/dashboard' :
      '/dashboard';
    
    return <Navigate to={dashboardPath} />;
  }

  return <Outlet />;
}

export default PrivateRoute;