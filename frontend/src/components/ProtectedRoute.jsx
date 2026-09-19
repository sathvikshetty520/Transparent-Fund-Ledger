import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';
import Alert from './Alert';

// <ProtectedRoute roles={['ADMIN']}> ... </ProtectedRoute>
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Checking your session" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="container page">
        <Alert type="error">Your account ({user.role.toLowerCase()}) cannot open this page.</Alert>
      </div>
    );
  }
  return children;
}
