import { Container } from 'inversify';
import { IDatabase } from '@/data/db/IDatabase';
import { MySqlDatabase, MySqlDbType } from '@/data/db/mysql/MySqlDatabase';
import UserRepository from '@/data/repo/drizzle/UserRepository';
import { TYPES } from '@/lib/types';
import { vi } from 'vitest';
import UserService from '@/services/UserService';
import IUserService from '@/services/contracts/IUserService';

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
    
    container.bind<IDatabase<MySqlDbType>>(TYPES.IDatabase).to(MySqlDatabase).inSingletonScope();


    container.bind<IUserService>(TYPES.IUserServce).to(UserService);
    
    container.bind<UserRepository>(TYPES.IUserRepository).to(UserRepository);
    
    return { container, mockDb }; // Return both for test access
  }