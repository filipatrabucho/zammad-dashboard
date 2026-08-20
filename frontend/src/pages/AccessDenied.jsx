import { useMsal } from '@azure/msal-react';

export default function AccessDenied() {
  const { instance } = useMsal();

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Acesso negado</h1>
        <p className="login-subtitle">
          A tua conta não está autorizada a aceder a este dashboard. Contacta um administrador para
          adicionar o teu email à lista de acesso.
        </p>
        <button type="button" className="btn-secondary" onClick={() => instance.logoutRedirect()}>
          Sair
        </button>
      </div>
    </div>
  );
}
