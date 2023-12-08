import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(
  keycloak: KeycloakService
): () => Promise<boolean> {
  return () =>
    keycloak.init({
      // config: {
      //   url: 'http://localhost:8080',
      //   realm: 'nex-km',
      //   clientId: 'nex-km',
      // },
      config: {
        url: 'https://dev-auth.gmf-aeroasia.co.id/auth',
        realm: 'next-km',
        clientId: 'next-km-web',
      },
      initOptions: {
        checkLoginIframe: true,
        checkLoginIframeInterval: 2592000000,
      },
      loadUserProfileAtStartUp: true,
    });
}
