import { EnvironmentInterface } from './environment.interface';

export const environment: EnvironmentInterface = {
  soeUrl: 'https://api.gmf-aeroasia.co.id/th/soe/v1/employee/',
  role: 'user',
  production: true,
  httpUrl: 'http://172.16.41.107:8014',
  //httpUrl: 'http://localhost:3000',
  apiUrl: 'http://172.16.41.107:8014',
  keycloakUrl: 'https://dev-auth.gmf-aeroasia.co.id/auth',
  baseUrl: 'http://localhost:4200',
  logger: ['error', 'log', 'warn', 'debug'],
  localKey: '',
  realm: 'nex-corporate',
  keycloakClientId: 'nex-web',
  channel: 'test/nex-km',
  channelUrlSocketConnect: 'http://172.16.41.107:8380',
  channelUrlSocketSend:
    'https://api-dev.gmf-aeroasia.co.id/innovation/utils/v1/api/notification',
};
