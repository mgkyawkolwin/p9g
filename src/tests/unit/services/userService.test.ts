import { describe, expect, it, vi } from 'vitest';
import UserService from '../../../services/UserService';
import UserRepository from '../../../data/repo/drizzle/UserRepository';

// Mock repository
const mockRepo = {
  findById: vi.fn().mockResolvedValue({ id: 1, name: 'Test User' })
} as unknown as UserRepository;

describe('UserService', () => {
  it('getUserProfile formats data correctly', async () => {
    const service = new UserService(mockRepo);
    const result = await service.userFindById(1);
    
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(result).toMatchObject({ 
      id: 1, 
      name: 'Test User' 
    });
  });
});