import { describe, expect, it, vi, beforeEach } from 'vitest';
import { userTable } from '@/data/orm/drizzle/mysql/schema';
import RoomRateEngine from '@/domain/engines/RoomRateEngine';
import Reservation from '@/domain/models/Reservation';
import RoomReservation from '@/domain/dtos/RoomReservation';
import RoomType from '@/domain/models/RoomType';
import RoomRate from '@/domain/models/RoomRate';

describe('RoomRateEngine', () => {
  let engine: RoomRateEngine;
  let reservation : Reservation;
  let roomReservations: RoomReservation[];
  let roomTypes: RoomType[];
  let roomRates: RoomRate[];

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new RoomRateEngine();
    roomTypes = [];
    roomRates = [];
    reservation = new Reservation();
    roomReservations = [];
  });

  describe('Normal rate calculation', () => {
    it('Engine can calculate on base room rate.', async () => {
        reservation.checkInDateUTC = new Date('2025-01-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-01-10T00:00:00.000Z');

        const roomType = new RoomType();
        roomType.id = '1';
        roomTypes.push(roomType);

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservations.push(roomReservation);

        const roomRate = new RoomRate();
        roomRate.month = 0;
        roomRate.roomRate = 200;
        roomRate.singleRate = 1;
        roomRate.roomTypeId = '1';
        roomRates.push(roomRate);

        const roomCharges = engine.calculate(reservation, roomReservations, roomTypes, roomRates);
        console.log(roomCharges);

        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].totalRate).toEqual(200);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].totalAmount).toEqual(2000);
    });

    it('Engine can calculate single charge rate.', async () => {
        reservation.checkInDateUTC = new Date('2025-01-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-01-10T00:00:00.000Z');

        const roomType = new RoomType();
        roomType.id = '1';
        roomTypes.push(roomType);

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservation.isSingleOccupancy = true;
        roomReservations.push(roomReservation);

        const roomRate = new RoomRate();
        roomRate.month = 0;
        roomRate.roomRate = 200;
        roomRate.singleRate = 100;
        roomRate.roomTypeId = '1';
        roomRates.push(roomRate);

        const roomCharges = engine.calculate(reservation, roomReservations, roomTypes, roomRates);
        console.log(roomCharges);
      
        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].totalRate).toEqual(200);
        expect(roomCharges[0].singleRate).toEqual(100);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].totalAmount).toEqual(3000);
    });
  });



  describe('Mixed rates calculation', () => {
    it('Same rate will combine into one room charge.', async () => {
      reservation.checkInDateUTC = new Date('2025-01-26T00:00:00.000Z');
      reservation.checkOutDateUTC = new Date('2025-02-05T00:00:00.000Z');

      const roomType = new RoomType();
      roomType.id = '1';
      roomTypes.push(roomType);

      const roomReservation = new RoomReservation();
      roomReservation.checkInDateUTC = reservation.checkInDateUTC;
      roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
      roomReservation.roomTypeId = "1";
      roomReservations.push(roomReservation);

      let roomRate = new RoomRate();
      roomRate.month = 0;
      roomRate.roomRate = 100;
      roomRate.singleRate = 1;
      roomRate.roomTypeId = '1';
      roomRates.push(roomRate);

      roomRate = new RoomRate();
      roomRate.month = 1;
      roomRate.roomRate = 100;
      roomRate.singleRate = 1;
      roomRate.roomTypeId = '1';
      roomRates.push(roomRate);

      const roomCharges = engine.calculate(reservation, roomReservations, roomTypes, roomRates);
      console.log(roomCharges);

      expect(roomCharges.length).toEqual(1);

      expect(roomCharges[0].totalRate).toEqual(100);
      expect(roomCharges[0].noOfDays).toEqual(10);
      expect(roomCharges[0].totalAmount).toEqual(1000);
  });

    it('Engine can calculate on mixed room rate.', async () => {
        reservation.checkInDateUTC = new Date('2025-01-26T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-02-05T00:00:00.000Z');

        const roomType = new RoomType();
        roomType.id = '1';
        roomTypes.push(roomType);

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservations.push(roomReservation);

        let roomRate = new RoomRate();
        roomRate.month = 0;
        roomRate.roomRate = 100;
        roomRate.singleRate = 1;
        roomRate.roomTypeId = '1';
        roomRates.push(roomRate);

        roomRate = new RoomRate();
        roomRate.month = 1;
        roomRate.roomRate = 200;
        roomRate.singleRate = 1;
        roomRate.roomTypeId = '1';
        roomRates.push(roomRate);

        const roomCharges = engine.calculate(reservation, roomReservations, roomTypes, roomRates);
        console.log(roomCharges);

        expect(roomCharges.length).toEqual(2);

        expect(roomCharges[0].totalRate).toEqual(100);
        expect(roomCharges[0].noOfDays).toEqual(5);
        expect(roomCharges[0].totalAmount).toEqual(500);

        expect(roomCharges[1].totalRate).toEqual(200);
        expect(roomCharges[1].noOfDays).toEqual(5);
        expect(roomCharges[1].totalAmount).toEqual(1000);
    });

    it('Engine can calculate single charge mixed rate.', async () => {
        reservation.checkInDateUTC = new Date('2025-01-26T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-02-05T00:00:00.000Z');

        const roomType = new RoomType();
        roomType.id = '1';
        roomTypes.push(roomType);

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservation.isSingleOccupancy = true;
        roomReservations.push(roomReservation);

        let roomRate = new RoomRate();
        roomRate.month = 0;
        roomRate.roomRate = 100;
        roomRate.singleRate = 50;
        roomRate.roomTypeId = '1';
        roomRates.push(roomRate);

        roomRate = new RoomRate();
        roomRate.month = 1;
        roomRate.roomRate = 200;
        roomRate.singleRate = 100;
        roomRate.roomTypeId = '1';
        roomRates.push(roomRate);

        const roomCharges = engine.calculate(reservation, roomReservations, roomTypes, roomRates);
        console.log(roomCharges);

        expect(roomCharges.length).toEqual(2);

        expect(roomCharges[0].totalRate).toEqual(100);
        expect(roomCharges[0].singleRate).toEqual(50);
        expect(roomCharges[0].noOfDays).toEqual(5);
        expect(roomCharges[0].totalAmount).toEqual(750);

        expect(roomCharges[1].totalRate).toEqual(200);
        expect(roomCharges[1].singleRate).toEqual(100);
        expect(roomCharges[1].noOfDays).toEqual(5);
        expect(roomCharges[1].totalAmount).toEqual(1500);
    });
  });


});