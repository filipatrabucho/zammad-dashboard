const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI || window.location.origin;

export const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// openid/profile/email garantem que o idToken tem os claims que o backend
// precisa (nomeadamente o email, usado em getRole()). Não precisamos de um
// scope de API customizado — o backend valida o idToken diretamente, com
// audience = AZURE_CLIENT_ID (ver backend/src/middleware/auth.js), por isso
// não é preciso configurar "Expose an API" no Azure AD.
export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};
