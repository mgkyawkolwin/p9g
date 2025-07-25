import { describe, expect, it, vi, beforeEach } from 'vitest';
import { userTable } from '@/data/orm/drizzle/mysql/schema';
import RoomRateEngine, { MonthDetail } from '@/domain/engines/RoomRateEngine';
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

    let roomType = new RoomType();
    roomType.id = '1';
    roomTypes.push(roomType);

    roomType = new RoomType();
    roomType.id = '2';
    roomTypes.push(roomType);

    let roomRate = new RoomRate();
    roomRate.month = 0;
    roomRate.roomRate = 100;
    roomRate.singleRate = 50;
    roomRate.roomSurcharge = 0;
    roomRate.seasonSurcharge = 0;
    roomRate.roomTypeId = '1';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 0;
    roomRate.roomRate = 200;
    roomRate.singleRate = 100;
    roomRate.roomSurcharge = 100;
    roomRate.seasonSurcharge = 0;
    roomRate.roomTypeId = '2';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 1;
    roomRate.roomRate = 100;
    roomRate.singleRate = 50;
    roomRate.roomSurcharge = 0;
    roomRate.seasonSurcharge = 0;
    roomRate.roomTypeId = '1';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 1;
    roomRate.roomRate = 200;
    roomRate.singleRate = 100;
    roomRate.roomSurcharge = 100;
    roomRate.seasonSurcharge = 0;
    roomRate.roomTypeId = '2';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 2;
    roomRate.roomRate = 200;
    roomRate.singleRate = 100;
    roomRate.roomSurcharge = 0;
    roomRate.seasonSurcharge = 100;
    roomRate.roomTypeId = '1';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 2;
    roomRate.roomRate = 300;
    roomRate.singleRate = 150;
    roomRate.roomSurcharge = 100;
    roomRate.seasonSurcharge = 100;
    roomRate.roomTypeId = '2';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 3;
    roomRate.roomRate = 200;
    roomRate.singleRate = 100;
    roomRate.roomSurcharge = 0;
    roomRate.seasonSurcharge = 100;
    roomRate.roomTypeId = '1';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 3;
    roomRate.roomRate = 300;
    roomRate.singleRate = 150;
    roomRate.roomSurcharge = 100;
    roomRate.seasonSurcharge = 100;
    roomRate.roomTypeId = '2';
    roomRates.push(roomRate);

  });

  describe('Date range calculation', () => {
    it('Simple date.', async () => {
        reservation.checkInDateUTC = new Date('2025-01-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-01-10T00:00:00.000Z');

        const roomCharges : MonthDetail[] = RoomRateEngine.getMonthlyDateSegments(reservation.checkInDateUTC, reservation.checkOutDateUTC);
        console.log(roomCharges);

        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].noOfDays).toEqual(10);
    });

    it('Mixed month date.', async () => {
      reservation.checkInDateUTC = new Date('2025-02-24T00:00:00.000Z');
      reservation.checkOutDateUTC = new Date('2025-03-05T00:00:00.000Z');

      const roomCharges = RoomRateEngine.getMonthlyDateSegments(reservation.checkInDateUTC, reservation.checkOutDateUTC);
      console.log(roomCharges);

      expect(roomCharges.length).toEqual(2);
      expect(roomCharges[0].noOfDays).toEqual(5);
      expect(roomCharges[1].noOfDays).toEqual(5);
  });
  });

  describe('Normal rate calculation', () => {
    it('Engine can calculate on base room rate.', async () => {
        reservation.checkInDateUTC = new Date('2025-01-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-01-10T00:00:00.000Z');

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        console.log(roomCharges);

        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].totalRate).toEqual(100);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].totalAmount).toEqual(1000);
    });

    it('Engine can calculate single charge rate.', async () => {
        reservation.checkInDateUTC = new Date('2025-01-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-01-10T00:00:00.000Z');

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservation.isSingleOccupancy = true;
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        console.log(roomCharges);
      
        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].totalRate).toEqual(150);
        expect(roomCharges[0].singleRate).toEqual(50);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].totalAmount).toEqual(1500);
    });
  });



  describe('Mixed rates calculation', () => {
    it('Same rate will combine into one room charge.', async () => {
      reservation.checkInDateUTC = new Date('2025-01-27T00:00:00.000Z');
      reservation.checkOutDateUTC = new Date('2025-02-05T00:00:00.000Z');

      const roomReservation = new RoomReservation();
      roomReservation.checkInDateUTC = reservation.checkInDateUTC;
      roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
      roomReservation.roomTypeId = "1";
      roomReservations.push(roomReservation);

      const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
      console.log(roomCharges);

      expect(roomCharges.length).toEqual(1);

      expect(roomCharges[0].totalRate).toEqual(100);
      expect(roomCharges[0].noOfDays).toEqual(10);
      expect(roomCharges[0].totalAmount).toEqual(1000);
  });

    it('Engine can calculate on mixed room rate.', async () => {
        reservation.checkInDateUTC = new Date('2025-02-24T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-03-05T00:00:00.000Z');

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
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
        reservation.checkInDateUTC = new Date('2025-02-24T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-03-05T00:00:00.000Z');

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservation.isSingleOccupancy = true;
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        console.log(roomCharges);

        expect(roomCharges.length).toEqual(2);

        expect(roomCharges[0].totalRate).toEqual(150);
        expect(roomCharges[0].singleRate).toEqual(50);
        expect(roomCharges[0].noOfDays).toEqual(5);
        expect(roomCharges[0].totalAmount).toEqual(750);

        expect(roomCharges[1].totalRate).toEqual(300);
        expect(roomCharges[1].singleRate).toEqual(100);
        expect(roomCharges[1].noOfDays).toEqual(5);
        expect(roomCharges[1].totalAmount).toEqual(1500);
    });
  });


  describe('Prepaid rate calculation', () => {
    it('No extra charge.', async () => {
        reservation.checkInDateUTC = new Date('2025-01-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-01-10T00:00:00.000Z');
        reservation.prepaidPackageId = 'dummy';

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        console.log(roomCharges);

        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].totalRate).toEqual(0);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].totalAmount).toEqual(0);
    });

    it('Room extra charge.', async () => {
        reservation.checkInDateUTC = new Date('2025-01-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-01-10T00:00:00.000Z');
        reservation.prepaidPackageId = 'dummy';

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "2";
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        console.log(roomCharges);

        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].totalRate).toEqual(100);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].totalAmount).toEqual(1000);
    });

    it('Season extra charge.', async () => {
        reservation.checkInDateUTC = new Date('2025-03-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-03-10T00:00:00.000Z');
        reservation.prepaidPackageId = 'dummy';

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        console.log(roomCharges);

        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].totalRate).toEqual(100);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].totalAmount).toEqual(1000);
    });

    it('Room and season extra charge.', async () => {
        reservation.checkInDateUTC = new Date('2025-03-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-03-10T00:00:00.000Z');
        reservation.prepaidPackageId = 'dummy';

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "2";
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        console.log(roomCharges);

        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].totalRate).toEqual(200);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].totalAmount).toEqual(2000);
    });

    it('Single charge rate.', async () => {
        reservation.checkInDateUTC = new Date('2025-01-01T00:00:00.000Z');
        reservation.checkOutDateUTC = new Date('2025-01-10T00:00:00.000Z');
        reservation.prepaidPackageId = 'dummy';

        const roomReservation = new RoomReservation();
        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
        roomReservation.roomTypeId = "1";
        roomReservation.isSingleOccupancy = true;
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        console.log(roomCharges);
      
        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].totalRate).toEqual(50);
        expect(roomCharges[0].singleRate).toEqual(50);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].totalAmount).toEqual(500);
    });

    it('Mixed rate.', async () => {
      reservation.checkInDateUTC = new Date('2025-02-24T00:00:00.000Z');
      reservation.checkOutDateUTC = new Date('2025-03-05T00:00:00.000Z');
      reservation.prepaidPackageId = 'dummy';

      const roomReservation = new RoomReservation();
      roomReservation.checkInDateUTC = reservation.checkInDateUTC;
      roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
      roomReservation.roomTypeId = "2";
      roomReservation.isSingleOccupancy = true;
      roomReservations.push(roomReservation);

      const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
      console.log(roomCharges);

      expect(roomCharges.length).toEqual(2);

      expect(roomCharges[0].totalRate).toEqual(200);
      expect(roomCharges[0].singleRate).toEqual(100);
      expect(roomCharges[0].noOfDays).toEqual(5);
      expect(roomCharges[0].totalAmount).toEqual(1000);

      expect(roomCharges[1].totalRate).toEqual(350);
      expect(roomCharges[1].singleRate).toEqual(150);
      expect(roomCharges[1].noOfDays).toEqual(5);
      expect(roomCharges[1].totalAmount).toEqual(1750);
  });

  });


});