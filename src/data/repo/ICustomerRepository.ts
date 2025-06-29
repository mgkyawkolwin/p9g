import IRepository from "./IRepository";
import { Customer } from "../orm/drizzle/mysql/schema";

export default interface ICustomerRepository extends IRepository<Customer>{

}