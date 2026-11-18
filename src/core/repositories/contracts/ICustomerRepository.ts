import { PagerParams, SearchFormFields } from "@/core/types";
import SessionUser from "@/core/models/dto/SessionUser";
import Customer from "@/core/models/domain/Customer";
import IRepository from "@/lib/repositories/IRepository";

export default interface ICustomerRepository extends IRepository<Customer> {
  customerFindManyWithReservationCounts(
    searchFormFields: SearchFormFields,
    pagerParams: PagerParams,
    sessionUser: SessionUser
  ): Promise<[Customer[], number]>;
}
