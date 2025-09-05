import { describe, expect, it, vi, beforeEach } from 'vitest';
import { userTable } from '@/data/orm/drizzle/mysql/schema';
import RoomRateEngine, { MonthDetail } from '@/domain/engines/RoomRateEngine';
import Reservation from '@/domain/models/Reservation';
import RoomReservation from '@/domain/models/RoomReservation';
import RoomType from '@/domain/models/RoomType';
import RoomRate from '@/domain/models/RoomRate';
import { reservationCheckIn } from '@/app/(private)/console/checkin/actions';

describe('RoomRateEngine', () => {
  let engine: RoomRateEngine;
  let roomTypes: RoomType[];
  let roomRates: RoomRate[];

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new RoomRateEngine();
    roomTypes = [];
    roomRates = [];

    let roomType = new RoomType();
    roomType.id = '1';
    roomType.roomType = 'STANDARD';
    roomTypes.push(roomType);

    roomType = new RoomType();
    roomType.id = '2';
    roomType.roomType = 'MODERN';
    roomTypes.push(roomType);

    let roomRate = new RoomRate();
    roomRate.month = 0;
    roomRate.roomRate = 65000;
    roomRate.singleRate = 20000;
    roomRate.roomSurcharge = 0;
    roomRate.seasonSurcharge = 0;
    roomRate.roomTypeId = '1';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 0;
    roomRate.roomRate = 75000;
    roomRate.singleRate = 20000;
    roomRate.roomSurcharge = 5000;
    roomRate.seasonSurcharge = 0;
    roomRate.roomTypeId = '2';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 1;
    roomRate.roomRate = 65000;
    roomRate.singleRate = 20000;
    roomRate.roomSurcharge = 0;
    roomRate.seasonSurcharge = 0;
    roomRate.roomTypeId = '1';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 1;
    roomRate.roomRate = 75000;
    roomRate.singleRate = 20000;
    roomRate.roomSurcharge = 5000;
    roomRate.seasonSurcharge = 0;
    roomRate.roomTypeId = '2';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 2;
    roomRate.roomRate = 105000;
    roomRate.singleRate = 30000;
    roomRate.roomSurcharge = 0;
    roomRate.seasonSurcharge = 40000;
    roomRate.roomTypeId = '1';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 2;
    roomRate.roomRate = 115000;
    roomRate.singleRate = 30000;
    roomRate.roomSurcharge = 5000;
    roomRate.seasonSurcharge = 40000;
    roomRate.roomTypeId = '2';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 3;
    roomRate.roomRate = 105000;
    roomRate.singleRate = 30000;
    roomRate.roomSurcharge = 0;
    roomRate.seasonSurcharge = 40000;
    roomRate.roomTypeId = '1';
    roomRates.push(roomRate);

    roomRate = new RoomRate();
    roomRate.month = 3;
    roomRate.roomRate = 115000;
    roomRate.singleRate = 30000;
    roomRate.roomSurcharge = 5000;
    roomRate.seasonSurcharge = 40000;
    roomRate.roomTypeId = '2';
    roomRates.push(roomRate);

  });

  describe('Date range calculation', () => {
    it('Simple date.', async () => {
        const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
        reservation.checkInDate = new Date('2025-01-01T00:00:00.000Z');
        reservation.checkOutDate = new Date('2025-01-10T00:00:00.000Z');

        const roomCharges : MonthDetail[] = RoomRateEngine.getMonthlyDateSegments(reservation.checkInDate, reservation.checkOutDate);
        // console.log(roomCharges);

        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].noOfDays).toEqual(10);
    });

    it('Mixed month date.', async () => {
        const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
        reservation.checkInDate = new Date('2025-02-24T00:00:00.000Z');
        reservation.checkOutDate = new Date('2025-03-05T00:00:00.000Z');

        const roomCharges = RoomRateEngine.getMonthlyDateSegments(reservation.checkInDate, reservation.checkOutDate);
        // console.log(roomCharges);

        expect(roomCharges.length).toEqual(2);
        expect(roomCharges[0].noOfDays).toEqual(5);
        expect(roomCharges[1].noOfDays).toEqual(5);
    });
  });

  describe('Normal Reservation Calculation', () => {
    it('Normal Reservation, Single Rate, Normal Room, Double Occupancy.', async () => {
        const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
        reservation.checkInDate = new Date('2025-01-01T00:00:00.000Z');
        reservation.checkOutDate = new Date('2025-01-10T00:00:00.000Z');

        const roomReservation = new RoomReservation();
        roomReservation.checkInDate = reservation.checkInDate;
        roomReservation.checkOutDate = reservation.checkOutDate;
        roomReservation.roomTypeId = "1";
        reservation.noOfGuests = 2;
        roomReservation.isSingleOccupancy = false;
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        // console.log(roomCharges);

        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].totalRate).toEqual(65000);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].totalAmount).toEqual(1300000);

        expect(roomCharges[0].seasonSurcharge).toEqual(0);
        expect(roomCharges[0].roomSurcharge).toEqual(0);
        expect(roomCharges[0].singleRate).toEqual(0);
    });

    it('Normal Reservation, Single Rate, Normal Room, Single Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
      reservation.checkInDate = new Date('2025-01-01T00:00:00.000Z');
      reservation.checkOutDate = new Date('2025-01-10T00:00:00.000Z');

      const roomReservation = new RoomReservation();
      roomReservation.checkInDate = reservation.checkInDate;
      roomReservation.checkOutDate = reservation.checkOutDate;
      roomReservation.roomTypeId = "1";
      reservation.noOfGuests = 1;
      roomReservation.isSingleOccupancy = true;
      roomReservations.push(roomReservation);

      const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
      // console.log(roomCharges);

      expect(roomCharges.length).toEqual(1);
      expect(roomCharges[0].totalRate).toEqual(85000);
      expect(roomCharges[0].noOfDays).toEqual(10);
      expect(roomCharges[0].totalAmount).toEqual(850000);

      expect(roomCharges[0].seasonSurcharge).toEqual(0);
      expect(roomCharges[0].roomSurcharge).toEqual(0);
      expect(roomCharges[0].singleRate).toEqual(20000);
    });

    it('Normal Reservation, Single Rate, Modern Room, Double Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
      reservation.checkInDate = new Date('2025-01-01T00:00:00.000Z');
      reservation.checkOutDate = new Date('2025-01-10T00:00:00.000Z');

      const roomReservation = new RoomReservation();
      roomReservation.checkInDate = reservation.checkInDate;
      roomReservation.checkOutDate = reservation.checkOutDate;
      roomReservation.roomTypeId = "2";
      reservation.noOfGuests = 2;
      roomReservation.isSingleOccupancy = false;
      roomReservations.push(roomReservation);

      const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
      // console.log(roomCharges);

      expect(roomCharges.length).toEqual(1);
      expect(roomCharges[0].totalRate).toEqual(75000);
      expect(roomCharges[0].noOfDays).toEqual(10);
      expect(roomCharges[0].totalAmount).toEqual(1500000);

      expect(roomCharges[0].seasonSurcharge).toEqual(0);
      expect(roomCharges[0].roomSurcharge).toEqual(0);
      expect(roomCharges[0].singleRate).toEqual(0);
    });

    it('Normal Reservation, Single Rate, Modern Room, Single Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
      reservation.checkInDate = new Date('2025-01-01T00:00:00.000Z');
      reservation.checkOutDate = new Date('2025-01-10T00:00:00.000Z');

      const roomReservation = new RoomReservation();
      roomReservation.checkInDate = reservation.checkInDate;
      roomReservation.checkOutDate = reservation.checkOutDate;
      roomReservation.roomTypeId = "2";
      reservation.noOfGuests = 1;
      roomReservation.isSingleOccupancy = true;
      roomReservations.push(roomReservation);

      const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
      // console.log(roomCharges);

      expect(roomCharges.length).toEqual(1);
      expect(roomCharges[0].totalRate).toEqual(95000);
      expect(roomCharges[0].noOfDays).toEqual(10);
      expect(roomCharges[0].totalAmount).toEqual(950000);

      expect(roomCharges[0].seasonSurcharge).toEqual(0);
      expect(roomCharges[0].roomSurcharge).toEqual(0);
      expect(roomCharges[0].singleRate).toEqual(20000);
    });

    it('Normal Reservation, Single Rate, Mixed Month, Normal Room, Double Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
        reservation.checkInDate = new Date('2025-01-27T00:00:00.000Z');
        reservation.checkOutDate = new Date('2025-02-05T00:00:00.000Z');

        const roomReservation = new RoomReservation();
        roomReservation.checkInDate = reservation.checkInDate;
        roomReservation.checkOutDate = reservation.checkOutDate;
        roomReservation.roomTypeId = "1";
        reservation.noOfGuests = 2;
        roomReservation.isSingleOccupancy = false;
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        // console.log(roomCharges);

        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].totalRate).toEqual(65000);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].totalAmount).toEqual(1300000);

        expect(roomCharges[0].seasonSurcharge).toEqual(0);
        expect(roomCharges[0].roomSurcharge).toEqual(0);
        expect(roomCharges[0].singleRate).toEqual(0);
    });

    it('Normal Reservation, Mixed Rate, Mixed Month, Normal Room, Double Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
        reservation.checkInDate = new Date('2025-02-24T00:00:00.000Z');
        reservation.checkOutDate = new Date('2025-03-05T00:00:00.000Z');

        const roomReservation = new RoomReservation();
        roomReservation.checkInDate = reservation.checkInDate;
        roomReservation.checkOutDate = reservation.checkOutDate;
        roomReservation.roomTypeId = "1";
        reservation.noOfGuests = 2;
        roomReservation.isSingleOccupancy = false;
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        // console.log(roomCharges);

        expect(roomCharges.length).toEqual(2);

        expect(roomCharges[0].totalRate).toEqual(65000);
        expect(roomCharges[0].noOfDays).toEqual(5);
        expect(roomCharges[0].totalAmount).toEqual(650000);

        expect(roomCharges[0].seasonSurcharge).toEqual(0);
        expect(roomCharges[0].roomSurcharge).toEqual(0);
        expect(roomCharges[0].singleRate).toEqual(0);

        expect(roomCharges[1].totalRate).toEqual(105000);
        expect(roomCharges[1].noOfDays).toEqual(5);
        expect(roomCharges[1].totalAmount).toEqual(1050000);

        expect(roomCharges[1].seasonSurcharge).toEqual(0);
        expect(roomCharges[1].roomSurcharge).toEqual(0);
        expect(roomCharges[1].singleRate).toEqual(0);
    });
  });



  describe('Prepaid Reservation Calculation', () => {
    it('Prepaid Reservation, Single Rate, Normal Room, Double Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
        reservation.checkInDate = new Date('2025-01-01T00:00:00.000Z');
        reservation.checkOutDate = new Date('2025-01-10T00:00:00.000Z');
        reservation.prepaidPackageId = 'dummy';

        const roomReservation = new RoomReservation();
        roomReservation.checkInDate = reservation.checkInDate;
        roomReservation.checkOutDate = reservation.checkOutDate;
        roomReservation.roomTypeId = "1";
        reservation.noOfGuests = 2;
        roomReservation.isSingleOccupancy = false;
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        // console.log(roomCharges);

        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].totalRate).toEqual(0);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].totalAmount).toEqual(0);

        expect(roomCharges[0].seasonSurcharge).toEqual(0);
        expect(roomCharges[0].roomSurcharge).toEqual(0);
        expect(roomCharges[0].singleRate).toEqual(0);
    });

    it('Prepaid Reservation, Single Rate, Normal Room, Single Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
      reservation.checkInDate = new Date('2025-01-01T00:00:00.000Z');
      reservation.checkOutDate = new Date('2025-01-10T00:00:00.000Z');
      reservation.prepaidPackageId = 'dummy';

      const roomReservation = new RoomReservation();
      roomReservation.checkInDate = reservation.checkInDate;
      roomReservation.checkOutDate = reservation.checkOutDate;
      roomReservation.roomTypeId = "1";
      reservation.noOfGuests = 1;
      roomReservation.isSingleOccupancy = true;
      roomReservations.push(roomReservation);

      const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
      // console.log(roomCharges);

      expect(roomCharges.length).toEqual(1);
      expect(roomCharges[0].totalRate).toEqual(20000);
      expect(roomCharges[0].noOfDays).toEqual(10);
      expect(roomCharges[0].totalAmount).toEqual(200000);

      expect(roomCharges[0].seasonSurcharge).toEqual(0);
      expect(roomCharges[0].roomSurcharge).toEqual(0);
      expect(roomCharges[0].singleRate).toEqual(20000);
    });

    it('Prepaid Reservation, Single Rate, Modern Room, Double Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
      reservation.checkInDate = new Date('2025-01-01T00:00:00.000Z');
      reservation.checkOutDate = new Date('2025-01-10T00:00:00.000Z');
      reservation.prepaidPackageId = 'dummy';

      const roomReservation = new RoomReservation();
      roomReservation.checkInDate = reservation.checkInDate;
      roomReservation.checkOutDate = reservation.checkOutDate;
      roomReservation.roomTypeId = "2";
      reservation.noOfGuests = 2;
      roomReservation.isSingleOccupancy = false;
      roomReservations.push(roomReservation);

      const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
      // console.log(roomCharges);

      expect(roomCharges.length).toEqual(1);
      expect(roomCharges[0].totalRate).toEqual(5000);
      expect(roomCharges[0].noOfDays).toEqual(10);
      expect(roomCharges[0].totalAmount).toEqual(100000);

      expect(roomCharges[0].seasonSurcharge).toEqual(0);
      expect(roomCharges[0].roomSurcharge).toEqual(5000);
      expect(roomCharges[0].singleRate).toEqual(0);
    });

    it('Prepaid Reservation, Single Rate, Modern Room, Single Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
      reservation.checkInDate = new Date('2025-01-01T00:00:00.000Z');
      reservation.checkOutDate = new Date('2025-01-10T00:00:00.000Z');
      reservation.prepaidPackageId = 'dummy';

      const roomReservation = new RoomReservation();
      roomReservation.checkInDate = reservation.checkInDate;
      roomReservation.checkOutDate = reservation.checkOutDate;
      roomReservation.roomTypeId = "2";
      reservation.noOfGuests = 1;
      roomReservation.isSingleOccupancy = true;
      roomReservations.push(roomReservation);

      const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
      // console.log(roomCharges);

      expect(roomCharges.length).toEqual(1);
      expect(roomCharges[0].totalRate).toEqual(25000);
      expect(roomCharges[0].noOfDays).toEqual(10);
      expect(roomCharges[0].totalAmount).toEqual(250000);

      expect(roomCharges[0].seasonSurcharge).toEqual(0);
      expect(roomCharges[0].roomSurcharge).toEqual(5000);
      expect(roomCharges[0].singleRate).toEqual(20000);
    });

    it('Prepaid Reservation, Single Rate, Mixed Month, Normal Room, Double Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
        reservation.checkInDate = new Date('2025-01-27T00:00:00.000Z');
        reservation.checkOutDate = new Date('2025-02-05T00:00:00.000Z');
        reservation.prepaidPackageId = 'dummy';

        const roomReservation = new RoomReservation();
        roomReservation.checkInDate = reservation.checkInDate;
        roomReservation.checkOutDate = reservation.checkOutDate;
        roomReservation.roomTypeId = "1";
        reservation.noOfGuests = 2;
        roomReservation.isSingleOccupancy = false;
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        // console.log(roomCharges);

        expect(roomCharges.length).toEqual(1);
        expect(roomCharges[0].totalRate).toEqual(0);
        expect(roomCharges[0].noOfDays).toEqual(10);
        expect(roomCharges[0].totalAmount).toEqual(0);

        expect(roomCharges[0].seasonSurcharge).toEqual(0);
        expect(roomCharges[0].roomSurcharge).toEqual(0);
        expect(roomCharges[0].singleRate).toEqual(0);
    });

    it('Prepaid Reservation, Mixed Rate, Mixed Month, Normal Room, Double Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
        reservation.checkInDate = new Date('2025-02-24T00:00:00.000Z');
        reservation.checkOutDate = new Date('2025-03-05T00:00:00.000Z');
        reservation.prepaidPackageId = 'dummy';

        const roomReservation = new RoomReservation();
        roomReservation.checkInDate = reservation.checkInDate;
        roomReservation.checkOutDate = reservation.checkOutDate;
        roomReservation.roomTypeId = "1";
        reservation.noOfGuests = 2;
        roomReservation.isSingleOccupancy = false;
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        // console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx')
        // console.log(roomCharges);

        expect(roomCharges.length).toEqual(2);

        expect(roomCharges[0].totalRate).toEqual(0);
        expect(roomCharges[0].noOfDays).toEqual(5);
        expect(roomCharges[0].totalAmount).toEqual(0);

        expect(roomCharges[0].seasonSurcharge).toEqual(0);
        expect(roomCharges[0].roomSurcharge).toEqual(0);
        expect(roomCharges[0].singleRate).toEqual(0);

        expect(roomCharges[1].totalRate).toEqual(40000);
        expect(roomCharges[1].noOfDays).toEqual(5);
        expect(roomCharges[1].totalAmount).toEqual(400000);

        expect(roomCharges[1].seasonSurcharge).toEqual(40000);
        expect(roomCharges[1].roomSurcharge).toEqual(0);
        expect(roomCharges[1].singleRate).toEqual(0);
    });

    it('Prepaid Reservation, Mixed Rate, Mixed Month, Normal Room, Single Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
        reservation.checkInDate = new Date('2025-02-24T00:00:00.000Z');
        reservation.checkOutDate = new Date('2025-03-05T00:00:00.000Z');
        reservation.prepaidPackageId = 'dummy';

        const roomReservation = new RoomReservation();
        roomReservation.checkInDate = reservation.checkInDate;
        roomReservation.checkOutDate = reservation.checkOutDate;
        roomReservation.roomTypeId = "1";
        reservation.noOfGuests = 1;
        roomReservation.isSingleOccupancy = true;
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        // console.log(roomCharges);

        expect(roomCharges.length).toEqual(2);

        expect(roomCharges[0].totalRate).toEqual(20000);
        expect(roomCharges[0].noOfDays).toEqual(5);
        expect(roomCharges[0].totalAmount).toEqual(100000);

        expect(roomCharges[0].seasonSurcharge).toEqual(0);
        expect(roomCharges[0].roomSurcharge).toEqual(0);
        expect(roomCharges[0].singleRate).toEqual(20000);

        expect(roomCharges[1].totalRate).toEqual(70000);
        expect(roomCharges[1].noOfDays).toEqual(5);
        expect(roomCharges[1].totalAmount).toEqual(350000);

        expect(roomCharges[1].seasonSurcharge).toEqual(40000);
        expect(roomCharges[1].roomSurcharge).toEqual(0);
        expect(roomCharges[1].singleRate).toEqual(30000);
    });

    it('Prepaid Reservation, Mixed Rate, Mixed Month, Modern Room, Double Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
        reservation.checkInDate = new Date('2025-02-24T00:00:00.000Z');
        reservation.checkOutDate = new Date('2025-03-05T00:00:00.000Z');
        reservation.prepaidPackageId = 'dummy';

        const roomReservation = new RoomReservation();
        roomReservation.checkInDate = reservation.checkInDate;
        roomReservation.checkOutDate = reservation.checkOutDate;
        roomReservation.roomTypeId = "2";
        reservation.noOfGuests = 2;
        roomReservation.isSingleOccupancy = false;
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        // console.log(roomCharges);

        expect(roomCharges.length).toEqual(2);

        expect(roomCharges[0].totalRate).toEqual(5000);
        expect(roomCharges[0].noOfDays).toEqual(5);
        expect(roomCharges[0].totalAmount).toEqual(50000);

        expect(roomCharges[0].seasonSurcharge).toEqual(0);
        expect(roomCharges[0].roomSurcharge).toEqual(5000);
        expect(roomCharges[0].singleRate).toEqual(0);

        expect(roomCharges[1].totalRate).toEqual(45000);
        expect(roomCharges[1].noOfDays).toEqual(5);
        expect(roomCharges[1].totalAmount).toEqual(450000);

        expect(roomCharges[1].seasonSurcharge).toEqual(40000);
        expect(roomCharges[1].roomSurcharge).toEqual(5000);
        expect(roomCharges[1].singleRate).toEqual(0);
    });

    it('Prepaid Reservation, Mixed Rate, Mixed Month, Modern Room, Single Occupancy.', async () => {
      const reservation = new Reservation();
        const roomReservations : RoomReservation[] = [];
        reservation.checkInDate = new Date('2025-02-24T00:00:00.000Z');
        reservation.checkOutDate = new Date('2025-03-05T00:00:00.000Z');
        reservation.prepaidPackageId = 'dummy';

        const roomReservation = new RoomReservation();
        roomReservation.checkInDate = reservation.checkInDate;
        roomReservation.checkOutDate = reservation.checkOutDate;
        roomReservation.roomTypeId = "2";
        reservation.noOfGuests = 1;
        roomReservation.isSingleOccupancy = true;
        roomReservations.push(roomReservation);

        const roomCharges = RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
        // console.log('OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO')
        // console.log(roomReservations)
        // console.log(roomCharges);

        expect(roomCharges.length).toEqual(2);

        expect(roomCharges[0].totalRate).toEqual(25000);
        expect(roomCharges[0].noOfDays).toEqual(5);
        expect(roomCharges[0].totalAmount).toEqual(125000);

        expect(roomCharges[0].seasonSurcharge).toEqual(0);
        expect(roomCharges[0].roomSurcharge).toEqual(5000);
        expect(roomCharges[0].singleRate).toEqual(20000);

        expect(roomCharges[1].totalRate).toEqual(75000);
        expect(roomCharges[1].noOfDays).toEqual(5);
        expect(roomCharges[1].totalAmount).toEqual(375000);

        expect(roomCharges[1].seasonSurcharge).toEqual(40000);
        expect(roomCharges[1].roomSurcharge).toEqual(5000);
        expect(roomCharges[1].singleRate).toEqual(30000);
    });
  });


});