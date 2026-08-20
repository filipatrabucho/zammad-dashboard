import { Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import { useAuthProfile } from '../../auth/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import AccessDenied from '../../pages/AccessDenied';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const isAuthenticated = useIsAuthenticated();
  const { status, isAdmin } = useAuthProfile();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="page-loading">
        <LoadingSpinner label="A verificar permissões…" />
      </div>
    );
  }
  if (status === 'denied') return <AccessDenied />;
  if (status === 'error') {
    return (
      <div className="page-loading">
        <p>Não foi possível verificar as tuas permissões. Tenta recarregar a página.</p>
      </div>
    );
  }
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
}
