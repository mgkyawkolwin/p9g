import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerRepository from '@/core/data/repo/drizzle/CustomerRepository';
import { MySqlDatabaseClient } from '@/core/data/db/mysql/MySqlDatabase';
import * as schema from '@/core/data/orm/drizzle/mysql/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/app/auth';  // Adjust the import path
import Customer from '@/core/models/domain/Customer';

// Mock the auth() function
vi.mock('@/app/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'mock-user-id' }
  })
}));

// Mock the drizzle and mysql2 modules
vi.mock('mysql2/promise');
vi.mock('drizzle-orm/mysql2');

describe('CustomerRepository', () => {
  let repository: CustomerRepository;
  let mockDb: any;
  let mockUpdate: any;
  let mockQuery: any;

  beforeEach(() => {

    mockQuery = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue([{ id: '1', name: 'John Doe' }]),
      update: vi.fn().mockReturnThis(),
      toSQL: vi.fn().mockReturnValue({
        sql: 'UPDATE `users` SET `name` = ?, `updatedBy` = ? WHERE `id` = ?',
        params: ['John Doe', 'mock-user-id', '1']
      })
    };

    // Mock the database instance
    mockDb = {
      update: vi.fn().mockReturnValue(mockQuery)
    };
    // Mock the MySqlDatabase to return our mock db
    const mockMySqlDatabase = {
      db: mockDb
    } as unknown as MySqlDatabaseClient;

    repository = new CustomerRepository(mockMySqlDatabase);
  });

  it('should execute correct update operation', async () => {
    const customer = new Customer();
    customer.id = "1";
    customer.name = "mock name";

    // Call the update method
    const result = await repository.update(customer.id, customer);

    // Verify the result
    expect(result).toEqual(customer);

    // Verify the Drizzle ORM method calls
    expect(mockDb.update).toHaveBeenCalledWith(schema.customerTable);
    expect(mockQuery.set).toHaveBeenCalledWith(customer);
    expect(mockQuery.where).toHaveBeenCalledWith(eq(schema.customerTable.id, customer.id));
  });


  // it('should set updatedBy from auth() and execute correct update', async () => {
  //   const result = await repository.update("1", { name: 'John Doe' });

  //   // Verify auth() was called
  //   expect(auth).toHaveBeenCalled();

  //   // Verify the final data includes updatedBy
  //   expect(mockDb.set).toHaveBeenCalledWith({
  //     name: 'John Doe',
  //     updatedBy: 'mock-user-id'  // Should be set by auth().user.id
  //   });

  //   // Verify the query was executed
  //   expect(mockDb.execute).toHaveBeenCalled();

  //   // Verify the returned data
  //   expect(result).toEqual({
  //     id: '1',
  //     name: 'John Doe',
  //     updatedBy: 'mock-user-id'
  //   });
  // });
});