import { injectable, inject } from 'inversify';

import c from '@/core/loggers/console/ConsoleLogger';
import type ICustomerService from "./contracts/ICustomerService";
import { PagerParams, TYPES } from '@/core/lib/types';
import Customer from '../models/Customer';
import SessionUser from '../dtos/SessionUser';
import { CustomError } from '@/core/lib/errors';
import type IRepository from '@/core/data/repo/contracts/IRepository';


@injectable()
export default class CustomerService implements ICustomerService {

  constructor(
    @inject(TYPES.ICustomerRepository) private customerRepository: IRepository<Customer>
  ) {

  }


  async customerCreate(customer: Customer, sessionUser: SessionUser): Promise<Customer> {
    c.fs('CustomerService > customerCreate');
    customer.createdBy = sessionUser.id;
    customer.updatedBy = sessionUser.id;
    return await this.customerRepository.create(customer);
  }


  async customerDelete(id: string, sessionUser: SessionUser): Promise<void> {
    c.fs('CustomerService > customerDelete');
    await this.customerRepository.delete(id);
  }


  async customerFindMany(searchParams: Record<string,any>, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Customer[], Number]> {
    c.fs('CustomerService > customerFindMany');
    return await this.customerRepository.findMany(searchParams, null, pagerParams.pageIndex * pagerParams.pageSize, pagerParams.pageSize);
  }


  async customerFindById(id: string, sessionUser: SessionUser): Promise<Customer | null> {
    c.fs('CustomerService > customerFindById');
    c.d(String(id));
    return await this.customerRepository.findById(id);
  }


  async customerUpdate(id: string, customer: Customer, sessionUser: SessionUser): Promise<void> {
    c.fs('CustomerService > customerUpdate');
    customer.updatedBy = sessionUser.id;
    await this.customerRepository.update(id, customer);
  }

}