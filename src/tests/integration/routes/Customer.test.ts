// tests/api/users/[id]/route.test.ts
import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { GET } from '@/app/api/customers/[id]/route';
import { NextRequest } from 'next/server';
import { container } from '@/dicontainer';
import CustomerService from '@/core/services/CustomerService';
import CustomerRepository from '@/core/data/repo/drizzle/CustomerRepository';
import { TYPES } from '@/lib/types';
import Customer from '@/core/models/domain/Customer';
import { createMocks } from 'node-mocks-http';

// Mock the auth() function
vi.mock('@/app/auth', () => ({
    auth: vi.fn().mockResolvedValue({
      user: { id: 'mock-user-id' }
    })
  }));



const customer = { id: '1', name: 'Mocked User' } as Customer;
  // Mock the repository
// const mockCustomerRepository = {
//     findById: vi.fn().mockResolvedValue(customer),
//   };

  vi.mock('@/data/repo/drizzle/CustomerRepository', () => {
    const mockUpdate = vi.fn((id: string, customer: Customer) => 
      Promise.resolve({ ...customer, id })
    );

    const mockFindById = vi.fn((id: string) => 
        Promise.resolve({ ...customer })
      );
  
    return {
      default: vi.fn().mockImplementation(() => ({
        findById: mockFindById,
      })),
      mockFindById,
      mockUpdate,//allow direct call to this mock func
    };
  });

//   vi.mock('@/dicontainer', async (importOriginal) => {
//     const actualContainer = await importOriginal(); // Get real container
//     return {
//       ///...actualContainer,
//       // Override bindings for testing
//       get: vi.fn((identifier) => {
//         if (identifier === TYPES.ICustomerService) {
//           return new CustomerService(mockCustomerRepository);
//         }
//         //return actualContainer.get(identifier); // Fallback to original
//       }),
//     };
//   });



describe('GET /api/customers/:id', () => {

  beforeAll(() => {

  });

  afterAll(() => {
    container.unbindAll();
    vi.restoreAllMocks();
  });

  it('returns user data with status 200', async () => {

    const { req } = createMocks({
        method: 'GET',
        url: 'http://localhost/api/customers/1',
        params: { id: '1' }
      });

    // Execute the route handler
    const response = await GET(req, {params:Promise.resolve({id:'1'})});
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual({ data: customer });
    //expect(mockCustomerRepository.findById).toHaveBeenCalledWith('1');
  });
});