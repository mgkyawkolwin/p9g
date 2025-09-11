import { Container } from 'inversify';
import { IDatabaseClient } from '@/core/data/db/IDatabase';
import { MySqlDatabaseClient, MySqlDbType } from '@/core/data/db/mysql/MySqlDatabase';
import UserRepository from '@/core/data/repo/drizzle/UserRepository';
import { TYPES } from '@/core/lib/types';
import { vi } from 'vitest';
import UserService from '@/core/domain/services/UserService';
import IUserService from '@/core/domain/services/contracts/IUserService';
import ICustomerService from '@/core/domain/services/contracts/ICustomerService';
import CustomerService from '@/core/domain/services/CustomerService';
import ICustomerRepository from '@/core/data/repo/contracts/ICustomerRepository';
import CustomerRepository from '@/core/data/repo/drizzle/CustomerRepository';

// Mock database implementation
const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    execute: vi.fn()
  };
  
  export function createTestContainer() {
    const container = new Container();
    
    container.bind<IDatabaseClient<MySqlDbType>>(TYPES.IDatabase).to(MySqlDatabaseClient).inSingletonScope();

    container.bind<ICustomerService>(TYPES.IUserService).to(CustomerService);
    
    container.bind<ICustomerRepository>(TYPES.IUserRepository).to(CustomerRepository);
    
    return { container, mockDb }; // Return both for test access
  }