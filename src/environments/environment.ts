// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { EnvironmentInterface } from './environment.interface';

export const environment: EnvironmentInterface = {
  soeUrl: 'https://api.gmf-aeroasia.co.id/th/soe/v1/employee/',
  role: 'user',
  production: false,
  httpUrl: 'http://localhost:3000',
  apiUrl: 'http://172.16.41.107:8012',
  keycloakUrl: 'https://dev-auth.gmf-aeroasia.co.id/auth',
  baseUrl: 'http://localhost:4200',
  logger: ['error', 'log', 'warn', 'debug'],
  localKey: '',
  realm: 'nex-corporate',
  keycloakClientId: 'nex-web',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
