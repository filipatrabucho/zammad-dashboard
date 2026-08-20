import axios from 'axios';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalInstance } from '../auth/msalInstance';
import { loginRequest } from '../auth/authConfig';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 20000,
});

async function acquireToken() {
  const account = msalInstance.getActiveAccount();
  console.log('[api] a adquirir token, conta ativa:', account?.username || null);

  if (!account) {
    console.error('[api] sem conta ativa no MSAL — a sessão não foi reconhecida após o login.');
    throw new Error('Sem sessão ativa.');
  }

  try {
    const result = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
    console.log('[api] token adquirido em silêncio, scopes:', result.scopes);
    // Usamos o idToken (não o accessToken): não pedimos nenhum scope de API
    // customizado, só openid/profile/email — o backend valida o idToken
    // diretamente (aud = AZURE_CLIENT_ID). Ver authConfig.js.
    return result.idToken;
  } catch (err) {
    console.error('[api] acquireTokenSilent() ERRO:', err.errorCode, err.errorMessage, err);
    if (err instanceof InteractionRequiredAuthError) {
      console.warn('[api] a redirecionar para interação (acquireTokenRedirect)…');
      await msalInstance.acquireTokenRedirect(loginRequest);
    }
    throw err;
  }
}

apiClient.interceptors.request.use(async (config) => {
  console.log('[api] pedido →', config.method?.toUpperCase(), config.url);
  const token = await acquireToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      '[api] resposta com erro ←',
      error.config?.url,
      error.response?.status,
      error.response?.data || error.message
    );
    if (error.response?.status === 401) {
      // Sessão inválida/expirada — força novo login.
      console.warn('[api] 401 do backend — a forçar novo login.');
      msalInstance.loginRedirect(loginRequest);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
