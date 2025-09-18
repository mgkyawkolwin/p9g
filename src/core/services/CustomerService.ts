import { injectable, inject } from 'inversify';

import c from '@/lib/loggers/console/ConsoleLogger';
import type ICustomerService from "./contracts/ICustomerService";
import { PagerParams, SearchFormFields, TYPES } from '@/lib/types';
import Customer from '../models/domain/Customer';
import SessionUser from '../models/dto/SessionUser';
import { CustomError } from '@/lib/errors';
import type IRepository from '@/core/data/repo/contracts/IRepository';
import { buildAnyCondition } from '@/lib/helpers';


@injectable()
export default class CustomerService implements ICustomerService {

  constructor(
    @inject(TYPES.ICustomerRepository) private customerRepository: IRepository<Customer>
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


  async customerFindMany(searchFormFields: SearchFormFields, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Customer[], number]> {
    c.fs('CustomerService > customerFindMany');
    const anyCondition = buildAnyCondition(searchFormFields);
    return await this.customerRepository.findMany(anyCondition, null, (pagerParams.pageIndex - 1) * pagerParams.pageSize, pagerParams.pageSize);
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

}