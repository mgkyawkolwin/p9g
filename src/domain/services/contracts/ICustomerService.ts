import { CustomerEntity } from "@/data/orm/drizzle/mysql/schema"
import { PagerParams, SearchParam } from "@/lib/types";


export default interface ICustomerService {

    customerDelete(id : number) : Promise<boolean>;

    customerFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[CustomerEntity[],PagerParams]>;

    customerFindById(id : number) : Promise<CustomerEntity | null>;

    customerCreate(customer : CustomerEntity) : Promise<CustomerEntity>;

    customerUpdate(id:number, user : CustomerEntity) : Promise<CustomerEntity>;
    
}