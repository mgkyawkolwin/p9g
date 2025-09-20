import CustomerService from '@/core/services/CustomerService';
import CustomerRepository from '@/core/data/repo/drizzle/CustomerRepository';
import { vi } from 'vitest';
import Customer from '@/core/models/domain/Customer';


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
  let service: CustomerService;
  let customerRepository: CustomerRepository;

  beforeEach(() => {
    // Create a new instance of the mocked repository
    customerRepository = new CustomerRepository({} as any);
    service = new CustomerService(customerRepository);
  });

  it('should update user via repository', async () => {
    const testCustomer = { id: '1', name: 'John Doe' } as Customer;
    
    // Call the service method
    const result = await service.customerUpdate(testCustomer.id, testCustomer);
    
    // Verify the repository's update method was called
    expect(customerRepository.update).toHaveBeenCalledWith(
      testCustomer.id, 
      testCustomer
    );
    expect(result).toEqual(testCustomer);
  });
});