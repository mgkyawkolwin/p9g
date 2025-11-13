import { inject, injectable } from 'inversify';

import { auth } from '@/app/auth';
import { TYPES } from '@/core/types';
import c from '@/lib/loggers/console/ConsoleLogger';
import type IRepository from '@/lib/repositories/IRepository';
import LogError from '../models/domain/LogError';
import ILogService from './contracts/ILogService';

@injectable()
export default class LogService implements ILogService {

    constructor(@inject(TYPES.ILogRepository) private logRepository: IRepository<LogError>) {

    }

    async logError(error: any): Promise<void> {
        c.fs('LogService > logError');
        const session = await auth();
        const logError = new LogError();
        if (session?.user?.id)
            logError.userId = session.user.id;
        logError.datetime = new Date();
        logError.detail = JSON.stringify(error).substring(0, 500);
        if (error instanceof Error) {
            logError.detail = String(error.name + " " + error.cause + " " + error.message + " " + error.stack).substring(0, 500);
        }
        this.logRepository.create(logError);
        c.fe('LogService > logError');
    }

}