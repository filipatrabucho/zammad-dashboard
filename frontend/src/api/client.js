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
  if (!account) throw new Error('Sem sessão ativa.');

  try {
    const result = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
    return result.accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      await msalInstance.acquireTokenRedirect(loginRequest);
    }
    throw err;
  }
}

apiClient.interceptors.request.use(async (config) => {
  const token = await acquireToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Sessão inválida/expirada — força novo login.
      msalInstance.loginRedirect(loginRequest);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
