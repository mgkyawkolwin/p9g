import RoomChargeEntity from '@/core/data/entity/RoomChargeEntity';
import RoomCharge from '@/core/models/domain/RoomCharge';
import CustomMapper from '@/lib/mappers/custommapper/CustomMapper';
import DrizzleQueryObjectTransformer from '@/lib/transformers/QueryObjectTransformer';
import { SQL } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

describe('QueryObjectTrnsformer', () => {
    const transformer = new DrizzleQueryObjectTransformer();

    describe('Transform search fields into conditions', () => {
        it('Room Charge.', async () => {
            const queryObject = {
                searchName: 'name',
                searchCheckInDate: new Date(),
                searchCheckInDateUntil: new Date(),
                searchArrivalDate: new Date()
            };

            const result : SQL = await transformer.transform(queryObject);
            console.log(result.getSQL());
        });
    });

});