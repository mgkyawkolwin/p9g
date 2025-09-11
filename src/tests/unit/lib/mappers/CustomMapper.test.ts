import RoomChargeEntity from '@/core/data/entity/RoomChargeEntity';
import RoomCharge from '@/core/domain/models/RoomCharge';
import CustomMapper from '@/core/lib/mappers/custommapper/CustomMapper';
import { describe, expect, it } from 'vitest';

describe('CustomMapper', () => {
    const customMapper = new CustomMapper();

  describe('Map Domain To Entity', () => {
    it('Room Charge.', async () => {
        const domain = new RoomCharge();
        domain.endDate = new Date();
        domain.createdAtUTC = new Date();
        domain.createdBy = 'createdBy';
        domain.extraBedRate = 1.0;
        domain.id = 'id';
        domain.modelState = 'inserted';
        domain.reservationId = 'reservationId';
        domain.roomSurcharge = 10.0;
        domain.roomType = 'roomType';
        domain.roomTypeId = 'roomTypeId';
        domain.roomTypeText = 'roomTypeText';
        domain.roomId = 'roomId';
        domain.roomNo = 'roomNo';
        domain.roomRate = 65000.0;
        domain.seasonSurcharge = 10.0;
        domain.singleRate = 1.0;
        domain.totalAmount = 10.0;
        domain.totalRate = 1.0;
        domain.updatedAtUTC = new Date();
        domain.updatedBy = 'updatedBy';
        domain.startDate = new Date();
        domain.noOfDays = 1;
        const entity = await customMapper.map(domain,RoomChargeEntity);
        
        expect(entity.noOfDays).toEqual(domain.noOfDays);
        expect(entity.roomTypeId).toEqual(domain.roomTypeId);
        expect(entity.startDate).toEqual(domain.startDate);
        expect(entity.singleRate).toEqual(`${domain.singleRate}`);
    });
});


    describe('Map Entity To Domain', () => {
        it('Room Charge.', async () => {
            const entity = new RoomChargeEntity();
            entity.endDate = new Date();
            entity.createdAtUTC = new Date();
            entity.createdBy = 'createdBy';
            entity.extraBedRate = '1.0';
            entity.id = 'id';
            entity.reservationId = 'reservationId';
            entity.roomSurcharge = '10.0';
            entity.roomTypeId = 'roomTypeId';
            entity.roomId = 'roomId';
            entity.roomRate = '65000.0';
            entity.seasonSurcharge = '10.0';
            entity.singleRate = '1.0';
            entity.totalAmount = '10.0';
            entity.totalRate = '1.0';
            entity.updatedAtUTC = new Date();
            entity.updatedBy = 'updatedBy';
            entity.startDate = new Date();
            entity.noOfDays = 1;
            const domain = await customMapper.map(entity, RoomCharge);
            
            expect(domain.noOfDays).toEqual(entity.noOfDays);
            expect(domain.roomTypeId).toEqual(entity.roomTypeId);
            expect(domain.startDate).toEqual(entity.startDate);
            expect(domain.singleRate).toEqual(Number(entity.singleRate));
            expect(typeof domain.singleRate).toBe('number');
        });
  });
});