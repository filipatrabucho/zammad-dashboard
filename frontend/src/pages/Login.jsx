import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../auth/authConfig';
import { msalInitError } from '../auth/msalInstance';
import ErrorBanner from '../components/Common/ErrorBanner';
import BrandMark from '../components/Common/BrandMark';

export default function Login() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <BrandMark size={40} />
          <h1>PKF Helpdesk</h1>
        </div>
        <p className="login-subtitle">Acesso restrito. Inicia sessão com a tua conta Microsoft.</p>
        {msalInitError && (
          <ErrorBanner
            message={`Falha no login Microsoft: ${msalInitError.errorMessage || msalInitError.message}`}
          />
        )}
        <button type="button" className="btn-primary btn-microsoft" onClick={handleLogin}>
          <MicrosoftLogo />
          Login com Microsoft
        </button>
      </div>
    </div>
  );
}

function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}
