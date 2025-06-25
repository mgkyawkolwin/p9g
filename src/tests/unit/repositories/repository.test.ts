import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Repository } from '@/data/repo/drizzle/Repository';
import { createTestContainer } from '@/tests/utils/testContainer';
import { IDatabase } from '@/data/db/IDatabase';
import { user } from '@/data/orm/drizzle/mysql/schema';
import { TYPES } from '@/lib/types';
import UserRepository from '@/data/repo/drizzle/UserRepository';
import { MySqlDatabase } from '@/data/db/mysql/MySqlDatabase';
import IUserRepository from '@/data/repo/IUserRepository';

class TestableRepository extends Repository<any, typeof user> {
  // Expose protected methods for testing if needed
  public testCreate(data: any) {
    return this.create(data);
  }
}

describe('Repository', () => {
  let container: ReturnType<typeof createTestContainer>;
  let repo: TestableRepository;
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    container = createTestContainer();
    mockDb = container.get<IDatabase<any>>(TYPES.IDatabase).db;
    repo = new TestableRepository(
      container.get<IUserRepository>(TYPES.IUserRepository),
      user
    );
  });

  describe('create', () => {
    it('inserts and returns new record', async () => {
      const mockInsertId = 123;
      const mockRecord = { id: mockInsertId, name: 'Test' };
      
      // Mock the chain
      mockDb.insert.mockReturnThis();
      mockDb.values.mockReturnThis();
      mockDb.execute.mockResolvedValueOnce([{ insertId: mockInsertId }]);
      
      // Mock the subsequent select
      mockDb.select.mockReturnThis();
      mockDb.from.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.limit.mockResolvedValueOnce([mockRecord]);

      const result = await repo.testCreate({ name: 'Test' });
      
      expect(result).toEqual(mockRecord);
      expect(mockDb.insert).toHaveBeenCalledWith(user);
    });
  });
});