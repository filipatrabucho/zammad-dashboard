import { Routes, Route } from 'react-router-dom';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketsPage from './pages/TicketsPage';
import GroupsPage from './pages/GroupsPage';
import LogsPage from './pages/LogsPage';

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
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
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
          <Route path="/login" element={<Dashboard />} />
        </Routes>
      </AuthenticatedTemplate>
    </>
  );
}
