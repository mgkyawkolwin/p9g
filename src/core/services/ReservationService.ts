import IReservationService from "./contracts/IReservationService";
import { inject, injectable } from "inversify";
import type IReservationRepository from "@/core/repositories/contracts/IReservationRepository";
import { PagerParams, SearchFormFields, TYPES } from "@/core/types";
import Reservation from "@/core/models/domain/Reservation";
import c from "@/lib/loggers/console/ConsoleLogger";
import Room from "../models/domain/Room";
import { ConfigGroup } from "@/core/constants";
import Bill from "../models/domain/Bill";
import Invoice from "../models/dto/Invoice";
import CurrencyTotal from "../models/dto/CurrencyTotal";
import Payment from "../models/domain/Payment";
import RoomCharge from "../models/domain/RoomCharge";
import RoomRateEngine from "@/core/engines/RoomRateEngine";
import { CustomError } from "@/lib/errors";
import RoomReservation from "../models/domain/RoomReservation";
import type IUserService from "./contracts/IUserService";
import type { IDatabaseClient } from "@/lib/db/IDatabase";
import { TransactionType } from "@/core/db/mysql/MySqlDatabase";
import type IRepository from "@/lib/repositories/IRepository";
import User from "../models/domain/User";
import Config from "../models/domain/Config";
import SessionUser from "../models/dto/SessionUser";
import RoomRate from "../models/domain/RoomRate";
import RoomType from "../models/domain/RoomType";
import ReservationCustomer from "../models/domain/ReservationCustomer";
import PrepaidEntity from "@/core/models/entity/PrepaidEntity";
import PromotionEntity from "@/core/models/entity/PromotionEntity";
import { and, asc, desc, eq, ne } from "@/lib/transformers/types";
import RoomReservationDto from "../models/dto/RoomReservationDto";
import { check } from "drizzle-orm/pg-core";

@injectable()
export default class ReservationService implements IReservationService {


    constructor(
        @inject(TYPES.IBillRepository) private billRepository: IRepository<Bill>,
        @inject(TYPES.IConfigRepository) protected readonly configRepository: IRepository<Config>,
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>,
        @inject(TYPES.IPaymentRepository) private paymentRepository: IRepository<Payment>,
        @inject(TYPES.IPrepaidRepository) private prepaidRepository: IRepository<PrepaidEntity>,
        @inject(TYPES.IPromotionRepository) private promotionRepository: IRepository<PromotionEntity>,
        @inject(TYPES.IReservationRepository) private reservationRepository: IReservationRepository,
        @inject(TYPES.IReservationCustomerRepository) private reservationCustomerRepository: IRepository<ReservationCustomer>,
        @inject(TYPES.IRoomRateRepository) private roomRateRepository: IRepository<RoomRate>,
        @inject(TYPES.IRoomRepository) private roomRepository: IRepository<Room>,
        @inject(TYPES.IRoomChargeRepository) private roomChargeRepository: IRepository<RoomCharge>,
        @inject(TYPES.IRoomReservationRepository) private roomReservationRepository: IRepository<RoomReservation>,
        @inject(TYPES.IRoomTypeRepository) private roomTypeRepository: IRepository<RoomType>,
        @inject(TYPES.IUserRepository) private userRepository: IRepository<User>,
        @inject(TYPES.IUserService) private userService: IUserService) {

    }


    async billDeleteById(reservationId: string, billId: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > billDeleteById');
        if (!reservationId) throw new CustomError('Service: Reservation id is required.');
        if (!billId) throw new CustomError('Service: Reservation id is required.');

        return await this.billRepository.delete(billId);
    }


    async billGetListById(reservationId: string, sessionUser: SessionUser): Promise<[Bill[], number]> {
        c.fs('ReservationService > billGetListById');
        return await this.billRepository.findMany(eq("reservationId", reservationId));
    }


    async billUpdateList(reservationId: string, bills: Bill[], sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > billUpdateList');
        c.d(`Bills: ${bills.length}`);
        c.d(bills);

        c.i('Preparing data based on model state.');
        const updateList = bills.filter(b => b.modelState == 'updated');
        const insertList = bills.filter(b => b.modelState == "inserted");
        const deleteList = bills.filter(b => b.modelState == "deleted");
        c.i(`Update counts: ${updateList.length}`);
        c.i(`Insert counts: ${insertList.length}`);
        c.i(`Delete counts: ${deleteList.length}`);

        c.i('Updating update information.');
        updateList.forEach(bill => {
            bill.updatedAtUTC = new Date();
            bill.updatedBy = sessionUser.id;
        });

        insertList.forEach(bill => {
            bill.createdAtUTC = new Date();
            bill.createdBy = sessionUser.id;
            bill.updatedAtUTC = new Date();
            bill.updatedBy = sessionUser.id;
        });

        await this.dbClient.db.transaction(async (tx: any) => {
            c.i('Deleting bills');
            for (const bill of deleteList) {
                await this.billRepository.delete(bill.id);
            }

            c.i('Updating bills.');
            for (const bill of updateList) {
                await this.billRepository.update(bill.id, bill, tx);
            };

            c.i('Inserting bills.');
            for (const bill of insertList) {
                await this.billRepository.create(bill, tx);
            };
        });
        c.fe('ReservationService > billUpdateList');
    }


    private calculateAllAmount(reservation: Reservation): Reservation {
        reservation.taxAmount = Number(reservation.totalAmount ?? 0) * Number(reservation.tax ?? 0) / 100;
        reservation.netAmount = Number(reservation.totalAmount ?? 0) + Number(reservation.taxAmount ?? 0) - Number(reservation.discountAmount ?? 0) - Number(reservation.depositAmount ?? 0);
        reservation.dueAmount = Number(reservation.netAmount ?? 0) - Number(reservation.paidAmount ?? 0);
        return reservation;
    }


    async invoiceGet(reservationId: string, sessionUser: SessionUser): Promise<Invoice> {
        c.fs('ReservationService > invoiceGet');
        const invoice = new Invoice();
        const [paidBills, paidBillsCount] = await this.billRepository.findMany(and(eq("reservationId", reservationId), eq("isPaid", true)));
        invoice.PaidBills = paidBills;
        invoice.PaidTotals = Object.entries(
            paidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({ total: total, currency: currency }) as CurrencyTotal);

        const [unPaidBills, unPaidBillsCount] = await this.billRepository.findMany(and(eq("reservationId", reservationId), eq("isPaid", false)));
        invoice.UnPaidBills = unPaidBills;
        invoice.UnPaidTotals = Object.entries(
            unPaidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({ total: total, currency: currency }) as CurrencyTotal);
        c.fe('ReservationService > invoiceGet');
        return invoice;
    }


    async paymentDeleteById(reservationId: string, paymentId: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > paymentDeleteById');
        if (!reservationId) throw new CustomError('Service: Reservation id is required.');
        if (!paymentId) throw new CustomError('Service: Reservation id is required.');
        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            c.i('Retrieving existing reservation');
            const reservation = await this.reservationRepository.findById(reservationId);
            if (!reservation) throw new CustomError('Rerservation service cannot find reservation.');

            c.i('Retrieving existing payment');
            const payment = await this.paymentRepository.findById(paymentId);
            if (!payment) throw new CustomError('Reservation service cannot find payment.');

            reservation.paidAmount -= payment.amount;
            reservation.dueAmount += payment.amount;

            c.i('Updating reservation.');
            await this.reservationRepository.update(reservationId, { paidAmount: reservation.paidAmount, dueAmount: reservation.dueAmount } as Reservation, tx as any);

            c.i('Deleting payment.');
            await this.paymentRepository.delete(paymentId, tx as any);
        });
    }


    async paymentGetListById(reservationId: string, sessionUser: SessionUser): Promise<[Payment[], number]> {
        c.fs('ReservationService > paymentGetListById');
        return await this.paymentRepository.findMany(eq('reservationId', reservationId));
    }


    async paymentUpdateList(reservationId: string, payments: Payment[], sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > paymentUpdateList');

        const updateList = payments.filter(p => p.modelState === 'updated');
        const insertList = payments.filter(p => p.modelState === 'inserted');
        const deleteList = payments.filter(p => p.modelState === 'deleted');
        c.i(`Update counts: ${updateList.length}`);
        c.i(`Insert counts: ${insertList.length}`);
        c.i(`Delete counts: ${deleteList.length}`);

        updateList.forEach(payment => {
            payment.updatedAtUTC = new Date();
            payment.updatedBy = sessionUser.id;
        });

        insertList.forEach(payment => {
            payment.createdAtUTC = new Date();
            payment.createdBy = sessionUser.id;
            payment.updatedAtUTC = new Date();
            payment.updatedBy = sessionUser.id;
        });

        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            c.i('Deleting payments');
            for (const payment of deleteList) {
                await this.paymentRepository.delete(payment.id);
            }

            c.i('Updating payments');
            for (const payment of updateList) {
                await this.paymentRepository.update(payment.id, payment);
            }

            c.i('Inserting payments');
            if (insertList && insertList.length >= 1) {
                await this.paymentRepository.createMany(insertList, tx as any);
            }

            const totalPaid = payments.reduce((acc, p) => (acc + p.amount), 0);

            let reservation: Reservation = await this.reservationRepository.findById(reservationId);
            if (!reservation) throw new CustomError('Reservation service cannot find reservation');

            reservation.paidAmount = totalPaid;
            reservation = this.calculateAllAmount(reservation);

            c.i('Updating reservation');
            await this.reservationRepository.update(reservationId, { paidAmount: reservation.paidAmount, dueAmount: reservation.dueAmount } as Reservation, tx as any);
        });
    }


    async paymentsView(reservationId: string, sessionUser: SessionUser): Promise<Invoice> {
        c.fs('ReservationService > paymentsView');
        const invoice = new Invoice();
        const [paidBills, paidBillsCount] = await this.billRepository.findMany(and(eq('reservationId', reservationId), eq("isPaid", true)));
        invoice.PaidBills = paidBills;
        invoice.PaidTotals = Object.entries(
            paidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({ total: total, currency: currency }) as CurrencyTotal);

        const [unPaidBills, unPaidBillsCount] = await this.billRepository.findMany(and(eq('reservationId', reservationId), eq("isPaid", false)));
        invoice.UnPaidBills = unPaidBills;
        invoice.UnPaidTotals = Object.entries(
            unPaidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({ total: total, currency: currency }) as CurrencyTotal);

        return invoice;
    }


    async reservationCancel(id: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationCancel');
        c.d(id);
        const config = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_STATUS), eq("value", "CCL")));
        if (!config) throw new CustomError('Cannot find config in reservation service.');

        await this.reservationRepository.update(id, { reservationStatusId: config.id, updatedBy: sessionUser.id } as Reservation);

    }


    async reservationCheckIn(id: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationCheckIn');
        c.fs('ReservationService > reservationCancel');
        c.d(id);
        const config = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_STATUS), eq("value", "CIN")));
        if (!config) throw new CustomError('Cannot find config in reservation service.');

        await this.reservationRepository.update(id, { reservationStatusId: config.id, updatedBy: sessionUser.id } as Reservation);
    }


    async reservationGetList(searchFormFields: SearchFormFields, pagerParams: PagerParams, list: string, sessionUser: SessionUser): Promise<[Reservation[], number]> {
        c.fs('ReservationService > reservationGetList');
        c.d(searchFormFields);
        c.d(pagerParams);
        c.d(pagerParams);
        pagerParams.orderBy = "checkInDate";
        pagerParams.orderDirection = "desc";
        if (list === 'checkin') {
            return await this.reservationRepository.reservationGetList(searchFormFields, pagerParams, list, sessionUser);
        }
        else if (list === 'checkout') {
            return await this.reservationRepository.reservationGetList(searchFormFields, pagerParams, list, sessionUser);
        }
        else if (list === 'top') {
            pagerParams.orderBy = 'createdAtUTC';
            pagerParams.orderDirection = 'desc';
            pagerParams.pageIndex = 1;
            pagerParams.pageSize = 10;
            return await this.reservationRepository.reservationGetList(searchFormFields, pagerParams, null, sessionUser);
        }
        else {
            return await this.reservationRepository.reservationGetList(searchFormFields, pagerParams, null, sessionUser);
        }
    }


    async reservationCheckOut(id: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationCheckOut');
        c.d(id);
        const config = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_STATUS), eq("value", "OUT")));
        if (!config) throw new CustomError('Cannot find config in reservation service.');

        await this.reservationRepository.update(id, { reservationStatusId: config.id, updatedBy: sessionUser.id } as Reservation);
    }


    async reservationCreate(reservation: Reservation, sessionUser: SessionUser): Promise<Reservation> {
        c.fs('ReservationService > reservationCreate');

        c.i('Preparing reservation to insert');
        reservation.createdAtUTC = new Date();
        reservation.createdBy = sessionUser.id;
        reservation.updatedBy = sessionUser.id;
        reservation.updatedAtUTC = new Date();
        reservation.location = sessionUser.location;

        c.i('Retrieveing reservation status id');
        const reservationStatus = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_STATUS), eq("value", reservation.reservationStatus)));
        if (!reservationStatus) throw new CustomError('Reservation service cannot find reservation status');
        reservation.reservationStatusId = reservationStatus.id;

        c.i('Retrieveing reservation type id');
        const reservationType = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_TYPE), eq("value", reservation.reservationType)));
        if (!reservationType) throw new CustomError('Reservation service cannot find reservation type');
        reservation.reservationTypeId = reservationType.id;

        if (reservation.prepaidPackage) {
            c.i('Retrieveing prepaid package id');
            const prepaidPackage = await this.prepaidRepository.findOne(eq("value", reservation.prepaidPackage));
            if (!prepaidPackage) throw new CustomError('Reservation service cannot find prepaid package');
            reservation.prepaidPackageId = prepaidPackage.id;
        }

        if (reservation.promotionPackage) {
            c.i('Retrieveing promotion package id');
            const prromotionPackage = await this.promotionRepository.findOne(eq("value", reservation.promotionPackage));
            if (!prromotionPackage) throw new CustomError('Reservation service cannot find promotion package');
            reservation.promotionPackageId = prromotionPackage.id;
        }

        if (reservation.pickUpType) {
            c.i('Retrieveing pickup type id');
            const pickupType = await this.configRepository.findOne(and(eq("group", ConfigGroup.RIDE_TYPE), eq("value", reservation.pickUpType)));
            if (!pickupType) throw new CustomError('Reservation service cannot find pickup type.');
            reservation.pickUpTypeId = pickupType.id;
        }

        if (reservation.dropOffType) {
            c.i('Retrieveing pickup type id');
            const dropOffType = await this.configRepository.findOne(and(eq("group", ConfigGroup.RIDE_TYPE), eq("value", reservation.dropOffType)));
            if (!dropOffType) throw new CustomError('Reservation service cannot find drop off type.');
            reservation.dropOffTypeId = dropOffType.id;
        }

        let room: Room;
        if (reservation.roomNo) {
            c.i('Retrieveing room info');
            room = await this.roomRepository.findOne(eq("roomNo", reservation.roomNo));
        }

        const result = this.dbClient.db.transaction(async (tx: any) => {

            c.i('Creating reservation');
            reservation = this.calculateAllAmount(reservation);
            const createdReservation = await this.reservationRepository.create(reservation, tx);
            if (!createdReservation || !createdReservation.id)
                throw new CustomError('Reservation creation failed.');
            c.d(createdReservation);

            if (reservation.customers && reservation.customers.length > 0) {
                c.i('Customers exist. Prepare to insert.');
                const newReservationCustomers = reservation.customers.map((c) => {
                    const rc = new ReservationCustomer();
                    rc.reservationId = createdReservation.id;
                    rc.customerId = c.id;
                    rc.createdAtUTC = new Date();
                    rc.createdBy = sessionUser.id;
                    rc.updatedAtUTC = new Date();
                    rc.updatedBy = sessionUser.id
                    return rc;
                });
                c.d(newReservationCustomers?.length);

                await this.reservationCustomerRepository.createMany(newReservationCustomers, tx);
            }

            if (reservation.roomNo && room) {
                c.i('Creating room reservation');
                const rrResult = await this.roomReservationCreate(createdReservation, sessionUser, tx);
                if (!rrResult)
                    throw new Error('Room reservation creation failed.');

                c.i('Calculating room charges');
                const [roomTypes, trc] = await this.roomTypeRepository.findMany(eq('location', reservation.location));
                const [roomRates, rrc] = await this.roomRateRepository.findMany(eq('location', reservation.location));
                const roomCharges = await RoomRateEngine.calculate(reservation, [rrResult], roomTypes, roomRates);
                if (!roomCharges || roomCharges.length === 0)
                    throw new Error('Invalid room charge calculation.');

                for (const roomCharge of roomCharges) {
                    roomCharge.createdBy = sessionUser.id;
                    roomCharge.updatedBy = sessionUser.id;
                }

                c.i('Creating room charges');
                await this.roomChargeRepository.createMany(roomCharges, tx);

                const totalRoomCharges = roomCharges.reduce((accu, rc) => accu += rc.totalAmount, 0);
                reservation.totalAmount = totalRoomCharges;
                reservation = this.calculateAllAmount(reservation);
                await this.reservationRepository.update(reservation.id, reservation, tx);
            }

            c.fe('ReservationService > reservationCreate');
            return createdReservation;
        }, { isolationLevel: "read committed", accessMode: "read write" });
        return result;
    }


    async reservationGetById(id: string, sessionUser: SessionUser): Promise<Reservation | undefined> {
        c.fs('ReservationService > reservationGetById');
        return this.reservationRepository.reservationGetById(id);
    }


    async reservationMoveRoom(id: string, roomNo: string, date: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationMoveRoom');
        c.d(id);
        c.d(roomNo);

        c.i('retrieve new room info');
        const room: Room = await this.roomRepository.findOne(and(eq("roomNo", roomNo), eq("location", sessionUser.location)));
        if (!room) throw new CustomError('Cannot find room while moving room');

        c.i('Retrieve reservation.');
        let reservation: Reservation = await this.reservationRepository.findById(id);
        if (!reservation) throw new CustomError('Cannot find reservation while moving room');

        let [roomReservations, count]: [RoomReservation[], Number] = await this.roomReservationRepository.findMany(eq('reservationId', id));
        if (!roomReservations) throw new CustomError('Cannot find room reservations.');

        roomReservations = roomReservations.sort((a, b) => a.checkInDate.getTime() - b.checkInDate.getTime());
        const roomReservation = roomReservations[0];

        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            c.i('Inside transaction');
            const newCheckInDate = new Date(date);
            const checkOutDate = new Date(date);
            checkOutDate.setDate(checkOutDate.getDate() - 1);
            c.i('Update current roomReservation record');
            roomReservation.updatedAtUTC = new Date();
            roomReservation.updatedBy = sessionUser.id;
            roomReservation.checkOutDate = checkOutDate;
            await this.roomReservationRepository.update(roomReservation.id, { checkOutDate: checkOutDate, updatedAtUTC: new Date(), updatedBy: sessionUser.id } as RoomReservation, tx as any);

            c.i('Create new roomReservation record');
            const newRoomReservation = new RoomReservation();
            newRoomReservation.reservationId = id;
            newRoomReservation.roomId = room.id;
            newRoomReservation.checkInDate = newCheckInDate;
            newRoomReservation.checkOutDate = reservation.checkOutDate;
            newRoomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
            newRoomReservation.roomTypeId = room.roomTypeId;
            newRoomReservation.createdAtUTC = new Date();
            newRoomReservation.createdBy = sessionUser.id;
            newRoomReservation.updatedAtUTC = new Date();
            newRoomReservation.updatedBy = sessionUser.id;

            roomReservations.push(newRoomReservation);

            await this.roomReservationRepository.create(newRoomReservation, tx as any);

            await this.roomChargeRepository.deleteWhere(eq('reservationId', id), tx as any);

            const [roomTypes, rtc] = await this.roomTypeRepository.findMany(eq("location", reservation.location));
            if (!roomTypes) throw new CustomError('Service cannot find room types.');

            const [roomRates, rrc] = await this.roomRateRepository.findMany(eq("location", reservation.location));
            if (!roomRates) throw new CustomError('Service cannot find room rates.');

            const roomCharges = await RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates);
            if (!roomCharges || roomCharges.length === 0)
                throw new Error('Invalid room charge calculation.');
            console.log(`Room Charges: ${roomCharges.length}`);

            for (const roomCharge of roomCharges) {
                roomCharge.createdAtUTC = new Date();
                roomCharge.createdBy = sessionUser.id;
                roomCharge.updatedAtUTC = new Date();
                roomCharge.updatedBy = sessionUser.id;
            }
            await this.roomChargeRepository.createMany(roomCharges, tx as any);

            const totalRoomCharges = roomCharges.reduce((accu, rc) => accu += rc.totalAmount, 0);
            reservation.roomNo = roomNo;
            reservation.totalAmount = totalRoomCharges;
            reservation = this.calculateAllAmount(reservation);console.log(reservation);
            await this.reservationRepository.update(reservation.id, reservation, tx as any);
        },{
            isolationLevel: "read uncommitted",
            accessMode: "read write",
            withConsistentSnapshot: false,
        });
    }


    async reservationUpdateDropOffInfo(id: string, carNo: string, driver: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationUpdateDropOffInfo');
        if (!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');

        return await this.reservationRepository.update(id, { dropOffCarNo: carNo, dropOffDriver: driver } as Reservation);
    }


    async reservationUpdatePickUpInfo(id: string, carNo: string, driver: string, sessionUser: SessionUser): Promise<void> {
        c.i('ReservationService > reservationUpdatePickUpInfo');
        if (!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');

        return await this.reservationRepository.update(id, { pickUpCarNo: carNo, pickUpDriver: driver } as Reservation);
    }


    async reservationUpdate(id: string, reservation: Reservation, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationUpdate');

        if (!id || id === 'undefined') {
            throw new Error('Reservation update failed. Id is required.');
        }

        if (!reservation) {
            throw new Error('Reservation update failed. Reservation is required.');
        }

        let reCalculate = false;

        c.i('Preparing reservation to update');
        reservation.updatedBy = sessionUser.id;
        reservation.updatedAtUTC = new Date();

        c.i('Retrieveing reservation status id');
        const reservationStatus = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_STATUS), eq("value", reservation.reservationStatus)));
        if (!reservationStatus) throw new CustomError('Reservation service cannot find reservation status');
        reservation.reservationStatusId = reservationStatus.id;

        c.i('Retrieveing reservation type id');
        const reservationType = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_TYPE), eq("value", reservation.reservationType)));
        if (!reservationType) throw new CustomError('Reservation service cannot find reservation type');
        reservation.reservationTypeId = reservationType.id;

        if (reservation.prepaidPackage) {
            c.i('Retrieveing prepaid package id');
            const prepaidPackage = await this.prepaidRepository.findOne(eq("value", reservation.prepaidPackage));
            if (!prepaidPackage) throw new CustomError('Reservation service cannot find prepaid package');
            reservation.prepaidPackageId = prepaidPackage.id;
        } else {
            reservation.prepaidPackageId = null;
        }

        if (reservation.promotionPackage) {
            c.i('Retrieveing promotion package id');
            const prromotionPackage = await this.promotionRepository.findOne(eq("value", reservation.promotionPackage));
            if (!prromotionPackage) throw new CustomError('Reservation service cannot find promotion package');
            reservation.promotionPackageId = prromotionPackage.id;
        } else {
            reservation.promotionPackageId = null;
        }

        if (reservation.pickUpType) {
            c.i('Retrieveing pickup type id');
            const pickupType = await this.configRepository.findOne(and(eq("group", ConfigGroup.RIDE_TYPE), eq("value", reservation.pickUpType)));
            if (!pickupType) throw new CustomError('Reservation service cannot find pickup type.');
            reservation.pickUpTypeId = pickupType.id;
        } else {
            reservation.pickUpTypeId = null;
        }

        if (reservation.dropOffType) {
            c.i('Retrieveing pickup type id');
            const dropOffType = await this.configRepository.findOne(and(eq("group", ConfigGroup.RIDE_TYPE), eq("value", reservation.dropOffType)));
            if (!dropOffType) throw new CustomError('Reservation service cannot find drop off type.');
            reservation.dropOffTypeId = dropOffType.id;
        } else {
            reservation.dropOffTypeId = null;
        }

        c.i('Retrieveing original reservation');
        const originalReservation = await this.reservationRepository.findById(id);
        if (!originalReservation)
            throw new CustomError('Cannot find original reservation.');

        const result = this.dbClient.db.transaction(async (tx: TransactionType) => {

            c.i('Updating reservation');
            reservation.totalAmount = originalReservation.totalAmount;
            reservation.paidAmount = originalReservation.paidAmount;
            reservation = this.calculateAllAmount(reservation);
            await this.reservationRepository.update(id, reservation, tx as any);

            c.i('Deleting existing customer list in reservation.');
            await this.reservationCustomerRepository.deleteWhere(eq("reservationId", id));

            if (reservation.customers && reservation.customers.length > 0) {
                c.i('Customers exist. Prepare to insert.');
                const newReservationCustomers = reservation.customers.map((c) => {
                    const rc = new ReservationCustomer();
                    rc.reservationId = reservation.id;
                    rc.customerId = c.id;
                    rc.createdAtUTC = new Date();
                    rc.createdBy = sessionUser.id;
                    rc.updatedAtUTC = new Date();
                    rc.updatedBy = sessionUser.id;
                    return rc;
                });
                await this.reservationCustomerRepository.createMany(newReservationCustomers, tx as any);
            }


            const room = await this.roomRepository.findOne(eq("roomNo", reservation.roomNo));
            if (room && reservation.roomNo && originalReservation.roomNo !== reservation.roomNo) {
                reCalculate = true; console.log('room no changed');
            } else if (reservation.checkInDate.getTime() !== originalReservation.checkInDate.getTime()) {
                reCalculate = true; console.log('check in date changed');
            } else if (reservation.checkOutDate.getTime() !== originalReservation.checkOutDate.getTime()) {
                reCalculate = true; console.log('check out date changed');
            } else if (reservation.isSingleOccupancy !== originalReservation.isSingleOccupancy) {
                reCalculate = true; console.log('is single occupancy changed');
            } else if (reservation.noOfGuests !== originalReservation.noOfGuests) {
                reCalculate = true; console.log('no of guests changed');
            } else if (reservation.reservationTypeId !== originalReservation.reservationTypeId) {
                reCalculate = true; console.log('reservation type changed');
            } else if (reservation.prepaidPackageId !== originalReservation.prepaidPackageId && ((reservation.prepaidPackageId && originalReservation.prepaidPackageId) || (reservation.prepaidPackageId && !originalReservation.prepaidPackageId) || (!reservation.prepaidPackageId && originalReservation.prepaidPackageId))) {
                reCalculate = true; console.log(`prepaid package changed: ${reservation.prepaidPackageId} - ${originalReservation.prepaidPackageId}`);
            } else if (reservation.promotionPackageId !== originalReservation.promotionPackageId && ((reservation.promotionPackageId && originalReservation.promotionPackageId) || (reservation.promotionPackageId && !originalReservation.promotionPackageId) || (!reservation.promotionPackageId && originalReservation.promotionPackageId))) {
                reCalculate = true; console.log('promotion package changed');
            }


            if (reservation.roomNo && reCalculate) {

                c.i('vital changed, delete all room reservations and room charges');
                await this.roomReservationRepository.deleteWhere(eq("reservationId", reservation.id), tx as any);
                await this.roomChargeRepository.deleteWhere(eq("reservationId", reservation.id), tx as any);

                const room = await this.roomRepository.findOne(and(eq("roomNo", reservation.roomNo), eq("location", sessionUser.location)));
                if (!room) throw new CustomError('Room not found.');

                const roomReservation = new RoomReservation();
                roomReservation.reservationId = reservation.id;
                roomReservation.roomId = room.id;
                roomReservation.roomTypeId = room.roomTypeId;
                roomReservation.roomNo = room.roomNo;
                roomReservation.checkInDate = reservation.checkInDate;
                roomReservation.checkOutDate = reservation.checkOutDate;
                roomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
                roomReservation.createdBy = sessionUser.id;
                roomReservation.updatedAtUTC = new Date();
                roomReservation.updatedBy = sessionUser.id;
                const rrResult = await this.roomReservationRepository.create(roomReservation, tx as any);
                if (!rrResult)
                    throw new Error('Room reservation creation failed.');

                const [roomTypes, rtc] = await this.roomTypeRepository.findMany(eq("location", reservation.location));
                if (!roomTypes) throw new CustomError('Service cannot find room types.');

                const [roomRates, rrc] = await this.roomRateRepository.findMany(eq("location", reservation.location));
                if (!roomRates) throw new CustomError('Service cannot find room rates.');

                const roomCharges = await RoomRateEngine.calculate(reservation, [roomReservation], roomTypes, roomRates);
                if (!roomCharges || roomCharges.length === 0)
                    throw new Error('Invalid room charge calculation.');

                for (const roomCharge of roomCharges) {
                    roomCharge.createdAtUTC = new Date();
                    roomCharge.createdBy = sessionUser.id;
                    roomCharge.updatedAtUTC = new Date();
                    roomCharge.updatedBy = sessionUser.id;
                    const result = await this.roomChargeRepository.create(roomCharge, tx as any);
                    if (!result)
                        throw new Error('Room charges saved failed.');
                }

                const totalRoomCharges = roomCharges.reduce((accu, rc) => accu += rc.totalAmount, 0);
                reservation.totalAmount = totalRoomCharges;
                reservation = this.calculateAllAmount(reservation);
                await this.reservationRepository.update(reservation.id, reservation, tx as any);
            } else if (!reservation.roomNo) {
                c.i('no room number, clear all room reservations and room charges');
                await this.roomReservationRepository.deleteWhere(eq("reservationId", reservation.id), tx as any);
                await this.roomChargeRepository.deleteWhere(eq("reservationId", reservation.id), tx as any);
                reservation.totalAmount = 0;
                reservation = this.calculateAllAmount(reservation);
                await this.reservationRepository.update(reservation.id, reservation, tx as any);
            }
        });

        return result;
    }


    async roomReservationCreate(reservation: Reservation, sessionUser: SessionUser, transaction: TransactionType): Promise<RoomReservation> {
        const room = await this.roomRepository.findOne(and(eq("roomNo", reservation.roomNo), eq("location", sessionUser.location)));
        if (!room) throw new Error('Cannot find room while saving room reservation.');

        const roomReservation = new RoomReservation();
        roomReservation.reservationId = reservation.id;
        roomReservation.roomId = room.id;
        roomReservation.roomTypeId = room.roomTypeId;
        roomReservation.roomNo = room.roomNo;
        roomReservation.checkInDate = reservation.checkInDate;
        roomReservation.checkOutDate = reservation.checkOutDate;
        roomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
        roomReservation.createdBy = sessionUser.id;
        roomReservation.updatedBy = sessionUser.id;
        const rrResult = await this.roomReservationRepository.create(roomReservation, transaction as any);

        if (!rrResult) throw new CustomError('Room reservation creation failed.');

        return rrResult as RoomReservation;
    }


    async roomChargeGetListById(reservationId: string, sessionUser: SessionUser): Promise<RoomCharge[]> {
        c.fs('ReservationService > roomChargeGetListById');
        const [result] = await this.roomChargeRepository.findMany(eq("reservationId", reservationId), asc("startDate"));
        return result;
    }


    async roomReservationGetListById(reservationId: string, includeChildren: boolean, sessionUser: SessionUser): Promise<[RoomReservation[], number]> {
        c.fs('ReservationService > roomReservationGetListById');
        return await this.reservationRepository.roomReservationGetListById(reservationId, includeChildren, sessionUser);
    }


    async roomReservationGetList(searchFormFields: SearchFormFields, sessionUser: SessionUser): Promise<RoomReservationDto[]> {
        c.fs('ReservationService > roomReservationGetList');
        return await this.reservationRepository.roomAndReservationGetList(searchFormFields, sessionUser);
    }


    async roomReservationUpdateList(reservationId: string, roomReservations: RoomReservation[], sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > roomReservationUpdateList');
        if (!reservationId || reservationId === 'undefined')
            throw new Error('Room reservation update failed. Reservation id is required.');
        if (!roomReservations || roomReservations.length === 0)
            throw new Error('Room reservation update failed. No data to process.');
        await this.reservationRepository.roomReservationUpdateList(reservationId, roomReservations, sessionUser);
    }


    async roomScheduleGetList(searchFormFields: SearchFormFields, sessionUser: SessionUser): Promise<[Room[], number]> {
        c.fs('ReservationService > roomScheduleGetList');
        return await this.reservationRepository.roomScheduleGetList(searchFormFields, sessionUser);
    }

}