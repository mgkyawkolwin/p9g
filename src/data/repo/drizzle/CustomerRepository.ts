import { and, eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import "reflect-metadata";

import { customer, Customer, User, user } from "@/data/orm/drizzle/mysql/schema";
import { Repository } from "./Repository";
import IUserRepository from "../IUserRepository";

import { TYPES } from "@/lib/types";
import { type IDatabase } from "@/data/db/IDatabase";
import ICustomerRepository from "../ICustomerRepository";


@injectable()
export default class CustomerRepository extends Repository<Customer, typeof customer> implements ICustomerRepository {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, customer);
    }

    

}