import { IDatabaseClient } from '@/lib/db/IDatabase';
import { billTable, configTable, customerTable, logErrorTable, reservationCustomerTable, reservationTable, roomChargeTable, roomReservationTable, roomTable } from '@/core/orms/drizzle/mysql/schema';
import IRepository from '@/lib/repositories/IRepository';
import RoomReservation from '@/core/models/domain/RoomReservation';
import { TYPES } from '@/core/types';
import { calculateDayDifference } from '@/lib/utils';
import { container } from '@/core/di/dicontainer';
import { eq } from 'drizzle-orm';
import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('Utils', () => {


  describe('calculateDayDifference', () => {
    it('Just two days difference.', async () => {
        //const db = container.get<IDatabaseClient<any>>(TYPES.IDatabase);
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

        // const result = await db.db.select().from(roomReservationTable)
        // .limit(10);

        // console.log(result); 

        // const repo = container.get<IRepository<RoomReservation>>(TYPES.IRoomReservationRepository);

        // const result2 = await repo.findMany(null, null, 0, 10);
        // console.log(result2);
        const symbols = Object.getOwnPropertySymbols(logErrorTable);
    const nameSymbol = symbols.find(sym => sym.toString() === 'Symbol(drizzle:Name)');
        console.log(logErrorTable[nameSymbol]);

        expect(2).toEqual(2);
    });
  });
});