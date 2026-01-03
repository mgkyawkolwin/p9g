import { injectable, inject } from 'inversify';

import c from '@/lib/loggers/console/ConsoleLogger';
import type ICustomerService from "./contracts/ICustomerService";
import { PagerParams, SearchFormFields, TYPES } from '@/core/types';
import Customer from '../models/domain/Customer';
import SessionUser from '../models/dto/SessionUser';
import { CustomError } from '@/lib/errors';
import type IRepository from '@/lib/repositories/IRepository';
import { buildAnyCondition } from '@/core/helpers';
import { and, asc, eq } from '@/lib/transformers/types';
import ReservationCustomer from '../models/domain/ReservationCustomer';
import { sql } from 'drizzle-orm/sql';


@injectable()
export default class CustomerService implements ICustomerService {

  constructor(
    @inject(TYPES.ICustomerRepository) private customerRepository: IRepository<Customer>,
    @inject(TYPES.IReservationCustomerRepository) private reservationCustomerRepository: IRepository<ReservationCustomer>
  ) {

  }


  async customerCreate(customer: Customer, sessionUser: SessionUser): Promise<Customer> {
    c.fs('CustomerService > customerCreate');

    customer.createdAtUTC = new Date();
    customer.createdBy = sessionUser.id;
    customer.updatedAtUTC = new Date();
    customer.updatedBy = sessionUser.id;

    return await this.customerRepository.create(customer);
  }


  async customerDelete(id: string, sessionUser: SessionUser): Promise<void> {
    c.fs('CustomerService > customerDelete');
    await this.customerRepository.delete(id);
  }


  async customerDeleteTdac(reservationId: string, customerId: string, sessionUser: SessionUser): Promise<void> {
    c.fs('CustomerService > customerDeleteTdac');
    const updateObject = {
      tdacFileUrl: sql`NULL`,
      updatedAtUTC: new Date(),
      updatedBy: sessionUser.id
    };
    await this.reservationCustomerRepository.updateWhere(and(eq("reservationId", reservationId), eq("customerId", customerId)), updateObject as unknown as ReservationCustomer);
  }


  async customerFindMany(searchFormFields: SearchFormFields, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Customer[], number]> {
    c.fs('CustomerService > customerFindMany');
    const anyCondition = buildAnyCondition(searchFormFields);
    return await this.customerRepository.findMany(anyCondition, asc("name"), (pagerParams.pageIndex - 1) * pagerParams.pageSize, pagerParams.pageSize);
  }


  async customerFindById(id: string, sessionUser: SessionUser): Promise<Customer | null> {
    c.fs('CustomerService > customerFindById');
    c.d(String(id));
    return await this.customerRepository.findById(id);
  }


  async customerUpdate(id: string, customer: Customer, sessionUser: SessionUser): Promise<void> {
    c.fs('CustomerService > customerUpdate');
    customer.updatedAtUTC = new Date();
    customer.updatedBy = sessionUser.id;

    await this.customerRepository.update(id, customer);
  }

  async customerUpdateTdac(reservationId: string, customerId: string, tdacFileUrl: string, sessionUser: SessionUser): Promise<void> {
    const partialObject = {
      tdacFileUrl: tdacFileUrl,
      updatedAtUTC: new Date(),
      updatedBy: sessionUser.id
    };

    await this.reservationCustomerRepository.updateWhere(
      and(eq("reservationId", reservationId), eq("customerId", customerId)), 
      { tdacFileUrl } as unknown as ReservationCustomer);
  }

}