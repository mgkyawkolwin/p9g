import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import UserView from '@/app/(private)/console/users/[id]/userview';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/users/1', () => {
    return HttpResponse.json({ 
      id: 1, 
      userName: 'Mocked User' 
    });
  })
);

describe('UserProfile', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('displays user data', async () => {
    const mockParams = Promise.resolve({ id: 1 });
    //render(<UserView params={mockParams} />);

    await act(async () => {
      render(<UserView params={mockParams} />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Mocked User')).toBeInTheDocument();
    });
  });
});