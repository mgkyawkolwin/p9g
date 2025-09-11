// import { and, eq } from "drizzle-orm";
// import { inject, injectable } from "inversify";
// import "reflect-metadata";

// import { UserEntity, userTable } from "@/core/data/orm/drizzle/mysql/schema";
// import { Repository } from "./Repository";
// import IUserRepository from "../contracts/IUserRepository";

// import { TYPES } from "@/core/lib/types";
// import { type IDatabaseClient } from "@/core/data/db/IDatabase";
// import c from "@/core/loggers/console/ConsoleLogger";
// import User from "@/core/domain/models/User";


// @injectable()
// export default class UserRepository extends Repository<User, typeof userTable> implements IUserRepository {

//     constructor(
//         @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>
//     ) {
//         super(dbClient, userTable);
//     }

//     // async findByEmailAndPassword(email: string, password: string): Promise<User> {
//     //     c.fs('UserRepository > findByEmailAndPassword');
//     //     const [user] = await this.dbClient.db
//     //         .select()
//     //         .from(this.table)
//     //         .where(
//     //         and(
//     //             eq(this.table.email, email),
//     //             eq(this.table.password, password)
//     //         )
//     //         )
//     //         .limit(1);

//     //     c.fe('UserRepository > findByEmailAndPassword');
//     //     return user as User;
//     // }

//     // async findByUserName(userName: string): Promise<User> {
//     //     c.fs('UserRepository > findByUserName');
//     //     const [user] = await this.dbClient.db
//     //         .select()
//     //         .from(userTable)
//     //         .where(
//     //             eq(userTable.userName, userName)
//     //         )
//     //         .limit(1);

//     //     c.fe('UserRepository > findByUserName');
//     //     return user as User;
//     // }

//     // async findByUserNameAndPassword(userName: string, password: string): Promise<User> {
//     //     c.fs('UserRepository > findByUserNameAndPassword');
//     //     const [user] = await this.dbClient.db
//     //         .select()
//     //         .from(this.table)
//     //         .where(
//     //         and(
//     //             eq(this.table.userName, userName),
//     //             eq(this.table.password, password)
//     //         )
//     //         )
//     //         .limit(1);

//     //     c.fe('UserRepository > findByUserNameAndPassword');
//     //     return user as User;
//     // }

// }