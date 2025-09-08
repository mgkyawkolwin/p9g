import { injectable, inject } from 'inversify';

import c from '@/core/logger/console/ConsoleLogger';
import type ICustomerRepository from '@/core/data/repo/contracts/ICustomerRepository';
import type ICustomerService from "./contracts/ICustomerService";
import { PagerParams, SearchParam, TYPES } from '@/core/lib/types';
import Customer from '../models/Customer';


@injectable()
export default class CustomerService implements ICustomerService{

    constructor(@inject(TYPES.ICustomerRepository) private CustomerRepository : ICustomerRepository){

    }


    async customerCreate(customer: Customer, sessionUser: SessionUser): Promise<Customer> {
        c.fs('CustomerService > customerCreate');
        customer.createdBy = sessionUser.id;
        customer.updatedBy = sessionUser.id;
        return await this.CustomerRepository.create(customer);
    }


    async customerDelete(id: string, sessionUser: SessionUser): Promise<boolean> {
        c.fs('CustomerService > customerDelete');
        return await this.CustomerRepository.delete(id);
    }


    async customerFindMany(searchParams:SearchParam[], pagerParams : PagerParams, sessionUser: SessionUser): Promise<[Customer[], PagerParams]> {
      c.fs('CustomerService > customerFindMany');
      return await this.CustomerRepository.findMany(searchParams, pagerParams);
    }


    async customerFindById(id: string, sessionUser: SessionUser): Promise<Customer | null> {
      c.fs('CustomerService > customerFindById');
      c.d(String(id));
      return await this.CustomerRepository.findById(id);
    }


    async customerUpdate(id:string, customer: Customer, sessionUser: SessionUser): Promise<Customer> {
      c.fs('CustomerService > customerUpdate');
      customer.updatedBy = sessionUser.id;
      return await this.CustomerRepository.update(id, customer);
    }

}