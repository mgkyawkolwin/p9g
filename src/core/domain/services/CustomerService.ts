import { injectable, inject } from 'inversify';

import c from '@/core/loggers/console/ConsoleLogger';
import type ICustomerRepository from '@/core/data/repo/contracts/ICustomerRepository';
import type ICustomerService from "./contracts/ICustomerService";
import { PagerParams, SearchParam, TYPES } from '@/core/lib/types';
import Customer from '../models/Customer';
import { customerTable } from '@/core/data/orm/drizzle/mysql/schema';
import { eq, like, SQL } from 'drizzle-orm';
import type IQueryObjectTranformer from '@/core/lib/transformers/IQueryObjectTransformer';
import SessionUser from '../dtos/SessionUser';
import { CustomError } from '@/core/lib/errors';


@injectable()
export default class CustomerService implements ICustomerService {

  constructor(
    @inject(TYPES.ICustomerRepository) private customerRepository: ICustomerRepository,
    @inject(TYPES.IQueryObjectTransformer) private readonly queryObjectTransformer: IQueryObjectTranformer
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


  async customerFindMany(searchParams: object, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Customer[], Number]> {
    c.fs('CustomerService > customerFindMany');
    let condition = null;
    if (searchParams)
      condition = await this.queryObjectTransformer.transform<SQL, object>(searchParams);
    return await this.customerRepository.findMany(condition, null, pagerParams.pageIndex * pagerParams.pageSize, pagerParams.pageSize);
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