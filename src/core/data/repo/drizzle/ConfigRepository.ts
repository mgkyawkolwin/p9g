import { and, eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import "reflect-metadata";

import { configTable } from "@/core/data/orm/drizzle/mysql/schema";
import { Repository } from "./Repository";

import { TYPES } from "@/core/lib/types";
import { type IDatabaseClient } from "@/core/data/db/IDatabase";
import c from "@/core/loggers/console/ConsoleLogger";
import Config from "@/core/domain/models/Config";
import IConfigRepository from "../contracts/IConfigRepository";


@injectable()
export default class ConfigRepository extends Repository<Config, typeof configTable> implements IConfigRepository {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>
    ) {
        super(dbClient, configTable);
    }

    async findByGroupAndCode(group: string, value: string): Promise<Config> {
        c.fs('ConfigRepository > findByGroupAndCode');
        const [config] = await this.dbClient.db
            .select()
            .from(this.table)
            .where(
                and(
                    eq(this.table.group, group),
                    eq(this.table.value, value)
                )
            )
            .limit(1);

        c.fe('ConfigRepository > findByGroupAndCode');
        return config as Config;
    }

}