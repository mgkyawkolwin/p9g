import { injectable, inject } from 'inversify';

import { TYPES } from '@/core/lib/types';
import ILogService from './contracts/ILogService';
import type ILogRepository from '@/core/data/repo/contracts/ILogRepository';
import LogError from '../models/LogError';
import { auth } from '@/app/auth';
import c from '@/core/loggers/console/ConsoleLogger';

@injectable()
export default class LogService implements ILogService {

    constructor(@inject(TYPES.ILogRepository) private logRepository: ILogRepository) {

    }

    async logError(error: any): Promise<void> {
        c.fs('LogService > logError');
        const session = await auth();
        const logError = new LogError();
        if (session.user?.id)
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