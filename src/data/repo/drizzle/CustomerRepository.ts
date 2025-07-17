import { inject, injectable } from "inversify";
import "reflect-metadata";
import { customerTable } from "@/data/orm/drizzle/mysql/schema";
import { Repository } from "./Repository";
import { TYPES } from "@/lib/types";
import { type IDatabase } from "@/data/db/IDatabase";
import ICustomerRepository from "../ICustomerRepository";
import Customer from "@/domain/models/Customer";


@injectable()
export default class CustomerRepository extends Repository<Customer, typeof customerTable> implements ICustomerRepository {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, customerTable);
    }

    

}