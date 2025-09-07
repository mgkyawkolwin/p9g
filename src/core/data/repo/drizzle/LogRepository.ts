import { logErrorTable } from "@/core/data/orm/drizzle/mysql/schema";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/core/data/db/IDatabase";
import { TYPES } from "@/core/lib/types";
import { Repository } from "./Repository";
import ILogRepository from "../contracts/ILogRepository";
import LogError from "@/core/domain/models/LogError";
import c from "@/core/logger/console/ConsoleLogger";


@injectable()
export default class LogRepository extends Repository<LogError, typeof logErrorTable> implements ILogRepository {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, logErrorTable);
    }


    async logError(logError: LogError): Promise<void> {
        c.fs('Repository > logError');
        this.create(logError);
        c.fe('Repository > logError');
    }
}