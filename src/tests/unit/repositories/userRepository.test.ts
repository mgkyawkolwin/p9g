import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createTestContainer } from '@/tests/utils/testContainer';
import UserRepository from '@/data/repo/drizzle/UserRepository';
import { IDatabase } from '@/data/db/IDatabase';
import { and, eq } from 'drizzle-orm';
import { user } from '@/data/orm/drizzle/mysql/schema';
import { TYPES } from '@/lib/types';

describe('UserRepository', () => {
  let userRepo: UserRepository;
  let mockDb: any;

  beforeEach(() => {
    const { container, mockDb: db } = createTestContainer();
    userRepo = container.get<UserRepository>(TYPES.IUserRepository);
    mockDb = db;
    vi.clearAllMocks();
  });

  it('findByEmailAndPassword returns user', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    mockDb.limit.mockResolvedValue([mockUser]);

    const result = await userRepo.findByEmailAndPassword(
      'test@example.com', 
      'password123'
    );

    expect(result).toEqual(mockUser);
    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.from).toHaveBeenCalled();
  });
});