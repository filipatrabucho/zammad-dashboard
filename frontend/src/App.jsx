import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Login from './pages/Login';
import Wallboard from './pages/Wallboard';
import Insights from './pages/Insights';
import Backoffice from './pages/Backoffice';

export default function App() {
  return (
    <>
      <UnauthenticatedTemplate>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </UnauthenticatedTemplate>

      <AuthenticatedTemplate>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Wallboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />

          <Route
            path="/backoffice"
            element={
              <ProtectedRoute adminOnly>
                <Backoffice />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthenticatedTemplate>
    </>
  );
}
