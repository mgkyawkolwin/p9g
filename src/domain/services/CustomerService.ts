import { injectable, inject } from 'inversify';

import c from '@/lib/core/logger/ConsoleLogger';
import type ICustomerRepository from '@/data/repo/ICustomerRepository';
import type ICustomerService from "./contracts/ICustomerService";
import { PagerParams, SearchParam, TYPES } from '@/lib/types';
import Customer from '../models/Customer';


@injectable()
export default class CustomerService implements ICustomerService{

    constructor(@inject(TYPES.ICustomerRepository) private CustomerRepository : ICustomerRepository){

    }


    async customerCreate(CustomerPosted: Customer): Promise<Customer> {
        c.i('CustomerService > CustomerCreate');
        const result = this.CustomerRepository.create(CustomerPosted);
        return result;
    }


    async customerDelete(id: number): Promise<boolean> {
        c.i('CustomerService > CustomerDelete');
        const result = this.CustomerRepository.delete(id);
        return result;
    }


    async customerFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Customer[], PagerParams]> {
      c.i('CustomerService > CustomerFindMany');
      const result = this.CustomerRepository.findMany(searchParams, pagerParams);
      return result;
    }

    
    // async customerFindByCustomerName(CustomerName: string): Promise<Customer | null> {
    //   consoleLogger.logInfo('CustomerService > CustomerFindByCustomerName');
    //   const result = await this.CustomerRepository.findByCustomerName(CustomerName);
    //   return result;
    // }


    async customerFindById(id: number): Promise<Customer | null> {
      c.i('CustomerService > CustomerFindById');
      c.d(String(id));
      const result = this.CustomerRepository.findById(id);
      return result;
    }


    async customerUpdate(id:number, CustomerPosted: Customer): Promise<Customer> {
      c.i('CustomerService > CustomerUpdate');
      const result = this.CustomerRepository.update(id, CustomerPosted);
      return result;
    }

}