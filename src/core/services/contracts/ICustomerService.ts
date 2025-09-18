import Customer from "@/core/models/domain/Customer";
import { PagerParams, SearchParam } from "@/lib/types";
import SessionUser from "../../models/dto/SessionUser";


export default interface ICustomerService {

    customerCreate(customer: Customer, sessionUser: SessionUser): Promise<Customer>;
    customerDelete(id: string, sessionUser: SessionUser): Promise<void>;
    customerFindById(id: string, sessionUser: SessionUser): Promise<Customer | null>;
    customerFindMany(searchParams: Record<string, any>, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Customer[], number]>;
    customerUpdate(id: string, user: Customer, sessionUser: SessionUser): Promise<void>;

}