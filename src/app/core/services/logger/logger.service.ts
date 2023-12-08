// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { EnvironmentInterface } from 'src/environments/environment.interface';
import {
  LoggerServiceInterface,
  LoggerType,
} from '../../interfaces/logger.service.interface';

export class LoggerService implements LoggerServiceInterface {
  context: string = LoggerService.name;
  environment: EnvironmentInterface;

  constructor(ctx: string) {
    this.context = ctx;
    this.environment = environment;
  }

  log(message: string, stack?: any): void {
    if (!this.environment.logger.includes('log')) return;
    this.printLog('log', message, stack);
  }

  warn(message: string, stack?: any): void {
    if (!this.environment.logger.includes('warn')) return;
    this.printLog('warn', message, stack);
  }

  error(message: string, stack?: any): void {
    if (!this.environment.logger.includes('error')) return;
    this.printLog('error', message, stack);
  }

  debug(message: string, stack?: any): void {
    if (!this.environment.logger.includes('debug')) return;
    this.printLog('debug', message, stack);
  }

  getLogDate(): string {
    const date = new Date();
    return (
      '[' +
      date.getUTCFullYear() +
      '/' +
      (date.getUTCMonth() + 1) +
      '/' +
      date.getUTCDate() +
      ' ' +
      date.getUTCHours() +
      ':' +
      date.getUTCMinutes() +
      ':' +
      date.getUTCSeconds() +
      '.' +
      date.getMilliseconds() +
      ']'
    );
  }

  printLog(level: LoggerType, message: any, stack: any): void {
    const _stack = stack === undefined || stack === null ? false : true;
    switch (level) {
      default:
        console.log(message, _stack);
        break;

      case 'log':
        // console.info(this.setMessage(message, 'log'), 'color:#6495ED');
        if (_stack) console.log(stack);
        break;

      case 'warn':
        console.warn(this.setMessage(message, 'warn'), 'color:#FF8C00');
        if (_stack) console.log(stack);
        break;

      case 'error':
        console.error(this.setMessage(message, 'error'), 'color:#DC143C');
        if (_stack) console.error(stack);
        break;

      case 'debug':
        console.log(this.setMessage(message, 'debug'), 'color:#ad0cf2');
        if (_stack) console.log(stack);
        break;
    }
  }

  private setMessage(message: any, level: LoggerType): string {
    return `%c XLOGS >> ${this.getLogDate()} ${level
      .toUpperCase()
      .slice(0, 3)}  [${this.context}] ${message}`;
  }

  setContext(name: string): void {
    this.context = name;
  }
}
