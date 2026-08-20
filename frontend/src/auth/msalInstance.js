import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { msalConfig } from './authConfig';

export const msalInstance = new PublicClientApplication(msalConfig);

/**
 * No msal-browser v3, a instância TEM de ser inicializada (async) antes de
 * qualquer outra chamada — getAllAccounts, loginRedirect, acquireTokenSilent,
 * etc. falham/ficam presas silenciosamente sem isto. Chamado uma vez em
 * main.jsx antes do primeiro render.
 */
export async function initializeMsal() {
  console.log('[msal] a inicializar…', { config: msalConfig });

  await msalInstance.initialize();
  console.log('[msal] initialize() concluído');

  // Processa o resultado do redirect (se voltámos da Microsoft agora mesmo).
  // O MsalProvider também trata disto, mas fazemos log aqui para conseguirmos
  // ver o resultado (ou erro) antes de qualquer outra coisa acontecer.
  try {
    const redirectResult = await msalInstance.handleRedirectPromise();
    console.log('[msal] handleRedirectPromise() resultado:', redirectResult);
  } catch (err) {
    console.error('[msal] handleRedirectPromise() ERRO:', err.errorCode, err.errorMessage, err);
  }

  const accounts = msalInstance.getAllAccounts();
  console.log('[msal] contas encontradas:', accounts.length, accounts);

  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
    console.log('[msal] conta ativa definida:', accounts[0].username);
  }

  msalInstance.addEventCallback((event) => {
    console.log('[msal] evento:', event.eventType, event.error || event.payload);

    if (
      (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
      event.payload?.account
    ) {
      msalInstance.setActiveAccount(event.payload.account);
      console.log('[msal] conta ativa atualizada via evento:', event.payload.account.username);
    }

    if (event.eventType === EventType.LOGIN_FAILURE || event.eventType === EventType.ACQUIRE_TOKEN_FAILURE) {
      console.error('[msal] FALHA:', event.error);
    }
  });
}
