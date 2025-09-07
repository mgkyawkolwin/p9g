import { and, eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import "reflect-metadata";

import { UserEntity, userTable } from "@/core/data/orm/drizzle/mysql/schema";
import { Repository } from "./Repository";
import IUserRepository from "../contracts/IUserRepository";

import { TYPES } from "@/core/lib/types";
import { type IDatabase } from "@/core/data/db/IDatabase";
import c from "@/core/logger/console/ConsoleLogger";


@injectable()
export default class UserRepository extends Repository<UserEntity, typeof userTable> implements IUserRepository {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, userTable);
    }

    async findByEmailAndPassword(email: string, password: string): Promise<UserEntity> {
        c.fs('UserRepository > findByEmailAndPassword');
        const [user] = await this.dbClient.db
            .select()
            .from(this.table)
            .where(
            and(
                eq(this.table.email, email),
                eq(this.table.password, password)
            )
            )
            .limit(1);

        c.fe('UserRepository > findByEmailAndPassword');
        return user as UserEntity;
    }

    async findByUserName(userName: string): Promise<UserEntity> {
        c.fs('UserRepository > findByUserName');
        const [user] = await this.dbClient.db
            .select()
            .from(userTable)
            .where(
                eq(userTable.userName, userName)
            )
            .limit(1);

        c.fe('UserRepository > findByUserName');
        return user as UserEntity;
    }

    async findByUserNameAndPassword(userName: string, password: string): Promise<UserEntity> {
        c.fs('UserRepository > findByUserNameAndPassword');
        const [user] = await this.dbClient.db
            .select()
            .from(this.table)
            .where(
            and(
                eq(this.table.userName, userName),
                eq(this.table.password, password)
            )
            )
            .limit(1);

        c.fe('UserRepository > findByUserNameAndPassword');
        return user as UserEntity;
    }

}