import { Customer } from "@/data/orm/drizzle/mysql/schema"
import { PagerParams, SearchParam } from "@/lib/types";


export default interface ICustomerService {

    customerDelete(id : number) : Promise<boolean>;

    customerFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Customer[],PagerParams]>;

    customerFindById(id : number) : Promise<Customer | null>;

    customerCreate(customer : Customer) : Promise<Customer>;

    customerUpdate(id:number, user : Customer) : Promise<Customer>;
    
}