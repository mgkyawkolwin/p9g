import { logErrorTable } from "@/data/orm/drizzle/mysql/schema";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/data/db/IDatabase";
import { PagerParams, SearchParam, TYPES } from "@/lib/types";
import { Repository } from "./Repository";
import { SQL, and, count, asc, desc, eq, ne, gte, between, lte, or, like, isNull, sum } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { auth } from "@/app/auth";
import { CustomError } from "@/lib/errors";
import ILogRepository from "../contracts/ILogRepository";
import LogError from "@/domain/models/LogError";


@injectable()
export default class LogRepository extends Repository<LogError, typeof logErrorTable> implements ILogRepository {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, logErrorTable);
    }


    async logError(logError: LogError): Promise<void> {
        this.create(logError);
    }
}