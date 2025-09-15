import { IDatabaseClient } from '@/core/data/db/IDatabase';
import { configTable, customerTable, reservationCustomerTable, reservationTable, roomChargeTable, roomTable } from '@/core/data/orm/drizzle/mysql/schema';
import { TYPES } from '@/core/lib/types';
import { calculateDayDifference } from '@/core/lib/utils';
import { container } from '@/dicontainer';
import { eq } from 'drizzle-orm';
import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('Utils', () => {


  describe('calculateDayDifference', () => {
    it('Just two days difference.', async () => {
        const db = container.get<IDatabaseClient<any>>(TYPES.IDatabase);
        // const result = await db.db.select({...reservationTable, reservationStatus: configTable.value, reservationStatusId: configTable.id}).from(reservationTable)
        // .innerJoin(configTable, eq(reservationTable.reservationStatusId, configTable.id)).limit(1);

        // const result = await db.db.select().from(reservationTable)
        // .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
        // .leftJoin(customerTable, eq(customerTable.id, reservationCustomerTable.customerId))
        // .limit(10);

        // const result = await db.db.query.reservationTable.findMany(
        //     {
        //         columns: {id:true},
        //         with: {
        //             reservationStatus : true
        //         },
        //         limit:10,
        //     }
        // );

        const result = await db.db.select({}).from(roomChargeTable)
        .innerJoin(roomTable, eq(roomTable.id, roomChargeTable.roomId))
        .limit(10);

        console.log(result);

        expect(2).toEqual(2);
    });
  });
});