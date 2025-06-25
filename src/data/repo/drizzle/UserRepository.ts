import { and, eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import "reflect-metadata";

import { User, user } from "@/data/orm/drizzle/mysql/schema";
import { Repository } from "./Repository";
import IUserRepository from "../IUserRepository";

import { TYPES } from "@/lib/types";
import { type IDatabase } from "@/data/db/IDatabase";


@injectable()
export default class UserRepository extends Repository<User, typeof user> implements IUserRepository {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, user);
    }

    async findByEmailAndPassword(email: string, password: string): Promise<User> {
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

        return user as User;
    }

    async findByUserNameAndPassword(userName: string, password: string): Promise<User> {
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

        return user as User;
    }

}