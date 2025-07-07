import IRepository from "./IRepository";
import { CustomerEntity } from "../orm/drizzle/mysql/schema";

export default interface ICustomerRepository extends IRepository<CustomerEntity>{

}