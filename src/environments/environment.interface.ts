import { LoggerType } from 'src/app/core/interfaces/logger.service.interface';

export interface EnvironmentInterface {
  soeUrl: string;


  role: 'admin' | 'user';

  /**
   * Define API Call for take data
   * @example https://api.hostname.com/api
   */
  apiUrl?: string;

  /**
   * Define API Call for take data thorugh Rest API
   * @example https://api.hostname.com/api
   */
  httpUrl: string;

  /**
   * Define API Call for Authentication Server
   * @example https://api.hostname.com/auth
   */
  keycloakUrl: string;

  /**
   * Define Client ID for OAuth2
   * @example 'pmo-web'
   */
  keycloakClientId: string;

  /**
   * Define base url including protocol, hostname, port
   * @example http://localhost:4200
   */
  baseUrl: string;

  /**
   * Define application mode. set true for production mode
   *
   */
  production: boolean;

  /**
   * Define log type that should be printed
   * @example logger: ['warn','log']
   */
  logger: LoggerType[];

  /**
   * Define local key for encryption
   * @example 'your_s4lt_h3r3'
   */
  localKey: string;

  /**
   * Define realm for your app
   * @example 'pmo'
   */
  realm: string;

  /**
   * Define channel for your app
   * @example 'nex-km'
   */
  channel: string;

  /**
   * Define channel for your app
   * @example 'http://172.16.41.107:8380'
   */
  channelUrlSocketConnect: string;

  /**
   * Define channel for your app
   * @example 'http://172.16.41.107:8322/v1/api/notification'
   */
  channelUrlSocketSend: string;
}
