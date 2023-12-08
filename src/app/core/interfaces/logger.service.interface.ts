export type LoggerType = 'log' | 'warn' | 'error' | 'debug';

export interface LoggerServiceInterface {
  /**
   * Set context name. It was class name or function name
   * @example const _context: string = AppComponent.name;
   */
  context: string;

  /**
   * Throw log information as log type
   *
   * @param message
   * @param stack
   */
  log(message: string, stack?: any): void;

  /**
   * Throw log information as warning type
   *
   * @param message
   * @param stack
   */
  warn(message: string, stack?: any): void;

  /**
   * Throw log information as error type
   *
   * @param message
   * @param stack
   */
  error(message: string, stack?: any): void;

  /**
   * Throw log information as debug type
   *
   * @param message
   * @param stack
   */
  debug(message: string, stack?: any): void;

  /**
   * Printing log to console
   *
   * @param level This was type of LoggerType
   * @param message This will be printed to console
   * @param stack It could be any or objects
   */
  printLog(level: LoggerType, message: any, stack: any): void;

  /**
   * Set Context name
   *
   * @param name Context object name
   */
  setContext(name: string): void;

  /**
   * Getting log date
   *
   */
  getLogDate(): string;
}
