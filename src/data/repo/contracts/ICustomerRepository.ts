import IRepository from "./IRepository";
import Customer from "@/domain/models/Customer";

export default interface ICustomerRepository extends IRepository<Customer>{

}