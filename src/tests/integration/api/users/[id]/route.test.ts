import { describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/users/[id]/route';
import { createMocks } from 'node-mocks-http';
import consoleLogger from '@/lib/core/logger/ConsoleLogger';
import { Container } from 'inversify';
import { createTestContainer } from '@/tests/utils/testContainer';

describe('GET /api/users/:id', () => {
  let container: any;
  
  beforeAll(() => {
    container = createTestContainer();
    // Enable logs just for these tests
    vi.spyOn(consoleLogger, 'logInfo').mockImplementation(console.log)
    vi.spyOn(consoleLogger, 'logDebug').mockImplementation(console.log)
    vi.spyOn(consoleLogger, 'logError').mockImplementation(console.log)
  })

  afterAll(() => {
    container.unbindAll();
    vi.restoreAllMocks()
  })

  it('returns 200 with user data', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/users/1',
      params: { id: '1' }
    });

    console.log('XXXXXXXXXXXXXXXXXXXXXXx');
    const response = await GET(req as any, { params: { id: '1' } });
    const data = await response.json();
    console.log(JSON.stringify(data));

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('email');
  });
});