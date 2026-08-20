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
  await msalInstance.initialize();

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  msalInstance.addEventCallback((event) => {
    if (
      (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
      event.payload?.account
    ) {
      msalInstance.setActiveAccount(event.payload.account);
    }
  });
}
