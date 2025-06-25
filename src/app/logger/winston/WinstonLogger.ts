// lib/logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import ILogger from '../ILogger';

const errorTransport = new DailyRotateFile({
  filename: 'logs/log-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d'
});



export class WinstonLoger implements ILogger{
    private logger : winston.Logger;

    constructor(){
        this.logger = winston.createLogger({
            level: 'error',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json()
            ),
            transports: [
              errorTransport
            ]
          });
    }

    logError(log: string): void {
        this.logger.log({level:"ERROR", message:log});
    }
    logInfo(log: string): void {
        throw new Error('Method not implemented.');
    }
    logWarning(log: string): void {
        throw new Error('Method not implemented.');
    }

}

