import { describe, expect, it, vi, beforeEach } from 'vitest';
import { userTable } from '@/data/orm/drizzle/mysql/schema';
import RoomRateEngine from '@/domain/engines/RoomRateEngine';
import Reservation from '@/domain/models/Reservation';
import RoomReservation from '@/domain/dtos/RoomReservation';
import RoomType from '@/domain/models/RoomType';
import RoomSeasonRate from '@/domain/models/RoomSeasonRate';

describe('RoomRateEngine', () => {
  let engine: RoomRateEngine;
  let reservation : Reservation;
  let roomReservations: RoomReservation[];
  let roomTypes: RoomType[];
  let seasonRates: RoomSeasonRate[];

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new RoomRateEngine();
    roomTypes = [];
    seasonRates = [];
    reservation = new Reservation();
    roomReservations = [];
  });

  describe('Normal rate calculation', () => {
    it('Engine can calculate on base room rate.', async () => {
        reservation.checkInDateUTC = new Date('2025-01-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-01-10T00:00:00.000Z');

        const roomType = new RoomType();
        roomType.id = '1';
        roomType.roomRate = 100;
        roomType.singleRate = 50;
        roomTypes.push(roomType);

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservations.push(roomReservation);

        const seasonRate = new RoomSeasonRate();
        seasonRate.startDateUTC = new Date('2025-02-01T00:00:00.000Z');
        seasonRate.endDateUTC = new Date('2025-02-28T00:00:00.000Z');
        seasonRate.roomRate = 200;
        seasonRate.roomTypeId = '1';
        seasonRates.push(seasonRate);

        const roomCharges = engine.calculate(reservation, roomReservations, roomTypes, seasonRates);
      
        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].rate).toEqual(100);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].total).toEqual(1000);
    });

    it('Engine can calculate single charge rate.', async () => {
        reservation.checkInDateUTC = new Date('2025-01-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-01-10T00:00:00.000Z');

        const roomType = new RoomType();
        roomType.id = '1';
        roomType.roomRate = 100;
        roomType.singleRate = 50;
        roomTypes.push(roomType);

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservation.isSingleOccupancy = true;
        roomReservations.push(roomReservation);

        const seasonRate = new RoomSeasonRate();
        seasonRate.startDateUTC = new Date('2025-02-01T00:00:00.000Z');
        seasonRate.endDateUTC = new Date('2025-02-28T00:00:00.000Z');
        seasonRate.roomRate = 200;
        seasonRate.roomTypeId = '1';
        seasonRates.push(seasonRate);

        const roomCharges = engine.calculate(reservation, roomReservations, roomTypes, seasonRates);
      
        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].rate).toEqual(150);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].total).toEqual(1500);
    });
  });


  describe('Seasonal rate calculation', () => {
    it('Engine can calculate on seasonal room rate.', async () => {
        reservation.checkInDateUTC = new Date('2025-02-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-02-10T00:00:00.000Z');

        const roomType = new RoomType();
        roomType.id = '1';
        roomType.roomRate = 100;
        roomType.singleRate = 50;
        roomTypes.push(roomType);

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservations.push(roomReservation);

        const seasonRate = new RoomSeasonRate();
        seasonRate.startDateUTC = new Date('2025-02-01T00:00:00.000Z');
        seasonRate.endDateUTC = new Date('2025-02-28T00:00:00.000Z');
        seasonRate.roomRate = 200;
        seasonRate.singleRate = 100;
        seasonRate.roomTypeId = '1';
        seasonRates.push(seasonRate);

        const roomCharges = engine.calculate(reservation, roomReservations, roomTypes, seasonRates);
        console.log(roomCharges);
        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].rate).toEqual(200);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].total).toEqual(2000);
    });

    it('Engine can calculate single charge rate.', async () => {
        reservation.checkInDateUTC = new Date('2025-02-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-02-10T00:00:00.000Z');

        const roomType = new RoomType();
        roomType.id = '1';
        roomType.roomRate = 100;
        roomType.singleRate = 50;
        roomTypes.push(roomType);

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservation.isSingleOccupancy = true;
        roomReservations.push(roomReservation);

        const seasonRate = new RoomSeasonRate();
        seasonRate.startDateUTC = new Date('2025-02-01T00:00:00.000Z');
        seasonRate.endDateUTC = new Date('2025-02-28T00:00:00.000Z');
        seasonRate.roomRate = 200;
        seasonRate.singleRate = 100;
        seasonRate.roomTypeId = '1';
        seasonRates.push(seasonRate);

        const roomCharges = engine.calculate(reservation, roomReservations, roomTypes, seasonRates);
      
        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].rate).toEqual(300);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].total).toEqual(3000);
    });
  });


});