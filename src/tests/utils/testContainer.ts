import { Container } from 'inversify';
import { IDatabaseClient } from '@/lib/db/IDatabase';
import { MySqlDatabaseClient, MySqlDbType } from '@/core/data/db/mysql/MySqlDatabase';
import { TYPES } from '@/lib/types';
import { vi } from 'vitest';
import ICustomerService from '@/core/services/contracts/ICustomerService';
import CustomerService from '@/core/services/CustomerService';

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
    
    
    return { container, mockDb }; // Return both for test access
  }