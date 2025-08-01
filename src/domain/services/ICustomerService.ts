import { injectable, inject } from 'inversify';

import c from '@/lib/core/logger/ConsoleLogger';
import type ICustomerRepository from '@/data/repo/ICustomerRepository';
import type ICustomerService from "./contracts/ICustomerService";
import { CustomerEntity } from "@/data/orm/drizzle/mysql/schema"
import { PagerParams, SearchParam, TYPES } from '@/lib/types';


@injectable()
export default class CustomerService implements ICustomerService{

    constructor(@inject(TYPES.ICustomerRepository) private CustomerRepository : ICustomerRepository){

    }


    async customerCreate(CustomerPosted: CustomerEntity): Promise<CustomerEntity> {
        c.i('CustomerService > CustomerCreate');
        const result = await this.CustomerRepository.create(CustomerPosted);
        return result;
    }


    async customerDelete(id: number): Promise<boolean> {
        c.i('CustomerService > CustomerDelete');
        const result = await this.CustomerRepository.delete(id);
        return result;
    }


    async customerFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[CustomerEntity[], PagerParams]> {
      c.i('CustomerService > CustomerFindMany');
      const result = await this.CustomerRepository.findMany(searchParams, pagerParams);
      return result;
    }

    
    // async customerFindByCustomerName(CustomerName: string): Promise<Customer | null> {
    //   consoleLogger.logInfo('CustomerService > CustomerFindByCustomerName');
    //   const result = await this.CustomerRepository.findByCustomerName(CustomerName);
    //   return result;
    // }


    async customerFindById(id: number): Promise<CustomerEntity | null> {
      c.i('CustomerService > CustomerFindById');
      c.d(String(id));
      const result = await this.CustomerRepository.findById(id);
      return result;
    }


    async customerUpdate(id:number, CustomerPosted: CustomerEntity): Promise<CustomerEntity> {
      c.i('CustomerService > CustomerUpdate');
      const result = await this.CustomerRepository.update(id, CustomerPosted);
      return result;
    }

}