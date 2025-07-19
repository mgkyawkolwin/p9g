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
        return await this.CustomerRepository.create(CustomerPosted);
    }


    async customerDelete(id: number): Promise<boolean> {
        c.i('CustomerService > CustomerDelete');
        return await this.CustomerRepository.delete(id);
    }


    async customerFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Customer[], PagerParams]> {
      c.i('CustomerService > CustomerFindMany');
      return await this.CustomerRepository.findMany(searchParams, pagerParams);
    }

    
    // async customerFindByCustomerName(CustomerName: string): Promise<Customer | null> {
    //   consoleLogger.logInfo('CustomerService > CustomerFindByCustomerName');
    //   const result = await this.CustomerRepository.findByCustomerName(CustomerName);
    //   return result;
    // }


    async customerFindById(id: number): Promise<Customer | null> {
      c.i('CustomerService > CustomerFindById');
      c.d(String(id));
      return await this.CustomerRepository.findById(id);
    }


    async customerUpdate(id:number, CustomerPosted: Customer): Promise<Customer> {
      c.i('CustomerService > CustomerUpdate');
      return await this.CustomerRepository.update(id, CustomerPosted);
    }

}