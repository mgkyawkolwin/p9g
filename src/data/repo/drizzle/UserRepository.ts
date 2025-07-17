import { and, eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import "reflect-metadata";

import { UserEntity, userTable } from "@/data/orm/drizzle/mysql/schema";
import { Repository } from "./Repository";
import IUserRepository from "../IUserRepository";

import { TYPES } from "@/lib/types";
import { type IDatabase } from "@/data/db/IDatabase";


@injectable()
export default class UserRepository extends Repository<UserEntity, typeof userTable> implements IUserRepository {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, userTable);
    }

    async findByEmailAndPassword(email: string, password: string): Promise<UserEntity> {
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

        return user as UserEntity;
    }

    async findByUserName(userName: string): Promise<UserEntity> {
        const [user] = await this.dbClient.db
            .select()
            .from(userTable)
            .where(
                eq(userTable.userName, userName)
            )
            .limit(1);

        return user as UserEntity;
    }

    async findByUserNameAndPassword(userName: string, password: string): Promise<UserEntity> {
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

        return user as UserEntity;
    }

}