import { inject, injectable } from "inversify";
import "reflect-metadata";
import { customerTable } from "@/core/data/orm/drizzle/mysql/schema";
import { Repository } from "./Repository";
import { TYPES } from "@/core/lib/types";
import { type IDatabase } from "@/core/data/db/IDatabase";
import ICustomerRepository from "../contracts/ICustomerRepository";
import Customer from "@/core/domain/models/Customer";


@injectable()
export default class CustomerRepository extends Repository<Customer, typeof customerTable> implements ICustomerRepository {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, customerTable);
    }

    

}