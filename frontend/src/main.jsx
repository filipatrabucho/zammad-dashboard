import React from 'react';
import ReactDOM from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import { BrowserRouter } from 'react-router-dom';
import { msalInstance, initializeMsal } from './auth/msalInstance';
import { AuthContextProvider } from './auth/AuthContext';
import App from './App';
import './styles/index.css';

initializeMsal().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <BrowserRouter>
          <AuthContextProvider>
            <App />
          </AuthContextProvider>
        </BrowserRouter>
      </MsalProvider>
    </React.StrictMode>
  );
});
