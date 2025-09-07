import Customer from "@/core/domain/models/Customer";
import { PagerParams, SearchParam } from "@/core/lib/types";


export default interface ICustomerService {

    customerDelete(id : string) : Promise<boolean>;

    customerFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Customer[],PagerParams]>;

    customerFindById(id : string) : Promise<Customer | null>;

    customerCreate(customer : Customer) : Promise<Customer>;

    customerUpdate(id:string, user : Customer) : Promise<Customer>;
    
}