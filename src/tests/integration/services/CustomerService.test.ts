import { vi } from 'vitest';
import Customer from '@/core/models/domain/Customer';
import { container } from '@/dicontainer';
import ICustomerService from '@/core/services/contracts/ICustomerService';
import { PagerParams, TYPES } from '@/lib/types';
import SessionUser from '@/core/models/dto/SessionUser';
import IRepository from '@/core/data/repo/contracts/IRepository';


vi.mock('@/data/repo/drizzle/CustomerRepository', () => {
  const mockUpdate = vi.fn((id: string, customer: Customer) => 
    Promise.resolve({ ...customer, id })
  );

  return {
    default: vi.fn().mockImplementation(() => ({
      update: mockUpdate,
    })),
    mockUpdate,//allow direct call to this mock func
  };
});

describe('CustomerService Tests:', () => {
  let service: ICustomerService;
  let customerRepository: IRepository<Customer>;
  let sessionUser = new SessionUser();

  beforeEach(() => {
    // Create a new instance of the mocked repository
    service = container.get<ICustomerService>(TYPES.ICustomerService);
    sessionUser.id = '00000000-0000-0000-0000-000000000000';
  });

  it('should return customer list', async () => {
    const pagerParams : PagerParams = {pageIndex: 0, pageSize: 10, orderBy: 'id', orderDirection: 'asc'};
    
    // Call the service method
    const result = await service.customerFindMany(null, pagerParams, sessionUser);
    
    
    expect(result.length).toEqual(2);
    expect(result[0].length).toEqual(10);
  });


  it('should handle insert/update/delete customer', async () => {
    const pagerParams : PagerParams = {pageIndex: 0, pageSize: 10, orderBy: 'id', orderDirection: 'asc'};
    
    let customer = new Customer();
    customer.name = 'New Name';
    customer.createdBy = '00000000-0000-0000-0000-000000000000';
    sessionUser.id = '00000000-0000-0000-0000-000000000000';
    const newCustomer = await service.customerCreate(customer, sessionUser);
    console.log(newCustomer);
    expect(newCustomer.id).toBeDefined();

    const findCustomer = await service.customerFindById(newCustomer.id, sessionUser);
    expect(findCustomer).toBeDefined();

    findCustomer.name = "Updated Name";
    await service.customerUpdate(newCustomer.id, {name: 'Updated Name'} as Customer, sessionUser);

    const updatedCustomer = await service.customerFindById(newCustomer.id, sessionUser);
    expect(updatedCustomer.name).toEqual('Updated Name');

    // await service.customerDelete(newCustomer.id, sessionUser);

    // const deletedCustomer = await service.customerFindById(newCustomer.id, sessionUser);
    // expect(deletedCustomer).toBeNull();
    
  });

});