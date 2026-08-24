import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Login from './pages/Login';
import Wallboard from './pages/Wallboard';
import Backoffice from './pages/Backoffice';

// Modo interativo completo (Tickets/Grupos/Logs) — POSTO EM PAUSA por agora
// enquanto o dashboard é usado como ecrã fixo na Sala IT (só o Wallboard).
// Para reativar: descomenta os imports e o bloco de rotas abaixo.
// import AppLayout from './components/Layout/AppLayout';
// import Dashboard from './pages/Dashboard';
// import TicketsPage from './pages/TicketsPage';
// import GroupsPage from './pages/GroupsPage';
// import LogsPage from './pages/LogsPage';

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
            path="/backoffice"
            element={
              <ProtectedRoute adminOnly>
                <Backoffice />
              </ProtectedRoute>
            }
          />

          {/*
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route
              path="logs"
              element={
                <ProtectedRoute adminOnly>
                  <LogsPage />
                </ProtectedRoute>
              }
            />
          </Route>
          */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthenticatedTemplate>
    </>
  );
}
