import { calculateDayDifference } from '@/core/lib/utils';
import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('Utils', () => {


  describe('calculateDayDifference', () => {
    it('Just two days difference.', async () => {
        const start = new Date('2025-01-01T00:00:00.000Z');
        const end = new Date('2025-01-02T00:00:00.000Z');

        const days = calculateDayDifference(start, end);

        expect(days).toEqual(2);
    });

    it('31 days difference.', async () => {
        const start = new Date('2025-01-01T00:00:00.000Z');
        const end = new Date('2025-01-31T00:00:00.000Z');

        const days = calculateDayDifference(start, end);

        expect(days).toEqual(31);
    });

    it('Two months, 2 days difference.', async () => {
        const start = new Date('2025-01-31T00:00:00.000Z');
        const end = new Date('2025-02-01T00:00:00.000Z');

        const days = calculateDayDifference(start, end);

        expect(days).toEqual(2);
    });
  });
});