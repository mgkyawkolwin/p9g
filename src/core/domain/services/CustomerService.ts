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


    async customerCreate(CustomerPosted: Customer): Promise<Customer> {
        c.fs('CustomerService > customerCreate');
        return await this.CustomerRepository.create(CustomerPosted);
    }


    async customerDelete(id: string): Promise<boolean> {
        c.fs('CustomerService > customerDelete');
        return await this.CustomerRepository.delete(id);
    }


    async customerFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Customer[], PagerParams]> {
      c.fs('CustomerService > customerFindMany');
      return await this.CustomerRepository.findMany(searchParams, pagerParams);
    }

    
    // async customerFindByCustomerName(CustomerName: string): Promise<Customer | null> {
    //   consoleLogger.logInfo('CustomerService > CustomerFindByCustomerName');
    //   const result = await this.CustomerRepository.findByCustomerName(CustomerName);
    //   return result;
    // }


    async customerFindById(id: string): Promise<Customer | null> {
      c.fs('CustomerService > customerFindById');
      c.d(String(id));
      return await this.CustomerRepository.findById(id);
    }


    async customerUpdate(id:string, CustomerPosted: Customer): Promise<Customer> {
      c.fs('CustomerService > customerUpdate');
      return await this.CustomerRepository.update(id, CustomerPosted);
    }

}