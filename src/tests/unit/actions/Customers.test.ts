import { customerCreate } from '@/app/(private)/console/customers/new/actions';
import Customer from '@/core/domain/models/Customer';
import { customerValidator } from '@/core/validators/zodschema';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';


// Mock headers
// import { headers } from 'next/headers';
// const mockHeaders = vi.mocked(headers);
// mockHeaders.mockReturnValue({
//   get: vi.fn((key: string) => key === 'cookie' ? 'mock-cookie-value' : null)
// });

// Mock external dependencies
vi.mock('@/lib/core/logger/ConsoleLogger');
vi.mock('next/navigation');
//vi.mock('@/lib/zodschema');

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((key: string) => key === 'cookie' ? 'mock-cookie-value' : null)
  }))
}));


describe('customerCreate server action', () => {
  const mockCustomer: Customer = new Customer();


  beforeEach(() => {
    vi.clearAllMocks();
  });


  it('should successfully create a customer with valid input', async () => {

    const customer = new Customer();
    customer.name = "mock";

    const fetchMock = createFetchMock(vi);
    fetchMock.enableMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ data: customer }));

    const result = await customerCreate(customer);

    expect(result.error).toEqual(false);
    expect(result.message).toEqual('Customer create successful');
    expect(result.data).toEqual(customer)

    expect(fetchMock).toHaveBeenCalledWith(process.env.API_URL + 'customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': 'mock-cookie-value'
      },
      body: JSON.stringify(customer)
    });
  });


  it('should return validation errors for invalid input', async () => {

    const result = await customerCreate({} as Customer);

    expect(result.error).toEqual(true);
    expect(result.message).toEqual('Failed to create customer.');

  });


  it('should handle API failure', async () => {
    const customer = new Customer();
    customer.name = 'mock';

    const fetchMock = createFetchMock(vi);
    fetchMock.enableMocks();
    fetchMock.mockResolvedValue({...new Response(),
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'API error.' })
    });
    

    const result = await customerCreate(customer);

    expect(result.error).toEqual(true);
    expect(result.message).toEqual('Failed to create customer. API error.');
    expect(fetchMock).toHaveBeenCalledWith(process.env.API_URL + 'customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': 'mock-cookie-value'
      },
      body: JSON.stringify(customer)
    });
  });


  it('should handle unexpected errors', async () => {
    // Mock validator to throw error
    const mockCustomerValidator = vi.mocked(customerValidator);
    mockCustomerValidator.safeParseAsync = vi.fn().mockRejectedValue(new Error('Validation crashed'));

    const result = await customerCreate(mockCustomer);

    expect(result).toEqual({
      error: true,
      message: 'Failed to create customer.',
      data: null,
      formData: null
    });
  });

});