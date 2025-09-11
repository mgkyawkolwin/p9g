import Customer from "@/core/domain/models/Customer";
import { PagerParams, SearchParam } from "@/core/lib/types";
import SessionUser from "../../dtos/SessionUser";


export default interface ICustomerService {

    customerCreate(customer: Customer, sessionUser: SessionUser): Promise<Customer>;
    customerDelete(id: string, sessionUser: SessionUser): Promise<void>;
    customerFindById(id: string, sessionUser: SessionUser): Promise<Customer | null>;
    customerFindMany(searchParams: SearchParam[], pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Customer[], Number]>;
    customerUpdate(id: string, user: Customer, sessionUser: SessionUser): Promise<void>;

}