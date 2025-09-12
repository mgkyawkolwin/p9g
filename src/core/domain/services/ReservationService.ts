import IReservationService from "./contracts/IReservationService";
import { inject, injectable } from "inversify";
import type IReservationRepository from "@/core/data/repo/contracts/IReservationRepository";
import { PagerParams, SearchParam, TYPES } from "@/core/lib/types";
import Reservation from "@/core/domain/models/Reservation";
import c from "@/core/loggers/console/ConsoleLogger";
import Room from "../models/Room";
import { SearchParams } from "@/core/lib/constants";
import Bill from "../models/Bill";
import Invoice from "../dtos/Invoice";
import CurrencyTotal from "../dtos/CurrencyTotal";
import Payment from "../models/Payment";
import RoomCharge from "../models/RoomCharge";
import RoomRateEngine from "../engines/RoomRateEngine";
import { CustomError } from "@/core/lib/errors";
import RoomReservation from "../models/RoomReservation";
// import type IRoomChargeRepository from "@/core/data/repo/contracts/IRoomChargeRepository";
// import type IRoomRepository from "@/core/data/repo/contracts/IRoomRepository";
// import type IRoomReservationRepository from "@/core/data/repo/contracts/IRoomReservationRepository";
import { auth } from "@/app/auth";
import type IUserService from "./contracts/IUserService";
import type { IDatabaseClient } from "@/core/data/db/IDatabase";
import { TransactionType } from "@/core/data/db/mysql/MySqlDatabase";
import { billTable, reservationTable, roomReservationTable, roomTable, userTable } from "@/core/data/orm/drizzle/mysql/schema";
import { and, desc, eq, SQL } from "drizzle-orm";
import type IRepository from "@/core/data/repo/contracts/IRepository";
import User from "../models/User";
import Config from "../models/Config";
import SessionUser from "../dtos/SessionUser";
import RoomRate from "../models/RoomRate";
import RoomType from "../models/RoomType";
import ReservationCustomer from "../models/ReservationCustomer";

@injectable()
export default class ReservationService implements IReservationService {


    constructor(
        @inject(TYPES.IBillRepository) private billRepository: IRepository<Bill>,
        @inject(TYPES.IConfigRepository) protected readonly configRepository: IRepository<Config>,
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>,
        @inject(TYPES.IPaymentRepository) private paymentRepository: IRepository<Payment>,
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
        //return await this.reservationRepository.billDelete(reservationId, billId);
        return await this.billRepository.delete(reservationId);
    }


    async billGetListById(reservationId: string, sessionUser: SessionUser): Promise<[Bill[], number]> {
        c.fs('ReservationService > billGetListById');
        //return await this.reservationRepository.billGetListById(reservationId);
        return await this.billRepository.findMany({ reservationId });
    }


    async billUpdateList(reservationId: string, bills: Bill[], sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > billUpdateList');
        bills.forEach(bill => bill.updatedBy = sessionUser.id);
        //await this.reservationRepository.billUpdateList(reservationId, bills);
        //get list to update and insert
        const updateList = bills.filter(p => typeof p.id !== 'undefined');
        const insertList = bills.filter(p => typeof p.id === 'undefined');

        updateList.forEach(bill => {
            bill.updatedBy = sessionUser.id;
        });

        insertList.forEach(bill => {
            bill.createdBy = sessionUser.id;
            bill.updatedBy = sessionUser.id;
        });

        await this.dbClient.db.transaction(async (tx: any) => {
            //update existing records
            for (const bill of updateList) {
                await this.billRepository.update(bill.id, bill, tx);
            };

            //insert new records
            for (const bill of insertList) {
                await this.billRepository.create(bill, tx);
            };
        });

    }


    async billsView(reservationId: string, sessionUser: SessionUser): Promise<Invoice> {
        c.fs('ReservationService > billsView');
        const invoice = new Invoice();
        const [paidBills, paidBillsCount] = await this.billRepository.findMany({ reservationId, isPaid: true });
        invoice.PaidBills = paidBills;
        invoice.PaidTotals = Object.entries(
            paidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({ total: total, currency: currency }) as CurrencyTotal);

        const [unPaidBills, unPaidBillsCount] = await this.billRepository.findMany({ reservationId, isPaid: false });
        invoice.UnPaidBills = unPaidBills;
        invoice.UnPaidTotals = Object.entries(
            unPaidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({ total: total, currency: currency }) as CurrencyTotal);
        c.fe('ReservationService > billsView');
        return invoice;
    }


    // async patch(id: string, operation: string, sessionUser: SessionUser): Promise<void> {
    //     c.fs('ReservationService > patch');
    //     c.d(id);
    //     c.d(operation);
    //     if (operation === 'CANCEL') {
    //         c.i('Cancel operation running.');
    //         await this.reservationCancel(id);
    //     }

    //     if (operation === 'CHECKIN') {
    //         c.i('CheckIn operation running.');
    //         await this.reservationCheckIn(id);
    //     }

    //     c.fe('ReservationService > patch');
    // }


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
        return await this.paymentRepository.findMany({ reservationId });
    }


    async paymentUpdateList(reservationId: string, payments: Payment[], sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > paymentUpdateList');
        // await this.reservationRepository.paymentUpdateList(reservationId, payments);
        const updateList = payments.filter(p => typeof p.id !== 'undefined');
        const insertList = payments.filter(p => typeof p.id === 'undefined');

        updateList.forEach(bill => {
            bill.updatedBy = sessionUser.id;
        });

        insertList.forEach(bill => {
            bill.createdBy = sessionUser.id;
            bill.updatedBy = sessionUser.id;
        });

        await this.dbClient.db.transaction(async (tx: TransactionType) => {

            c.i('Updating payments');
            for(const payment of updateList){
                await this.paymentRepository.update(payment.id, payment);
            }

            c.i('Inserting payments');
            if (insertList && insertList.length >= 1) {
                await this.paymentRepository.createMany(insertList, tx as any);
            }

            const totalPaid = payments.reduce((acc, p) => (acc + p.amount), 0);

            const reservation = await this.reservationRepository.findById(reservationId);
            if(!reservation) throw new CustomError('Reservation service cannot find reservation');

            reservation.paidAmount = totalPaid;
            reservation.dueAmount = reservation.netAmount - reservation.paidAmount;

            c.i('Updating reservation');
            await this.reservationRepository.update(reservationId, {paidAmount: reservation.paidAmount, dueAmount: reservation.dueAmount} as Reservation, tx as any);
        });
    }


    async paymentsView(reservationId: string, sessionUser: SessionUser): Promise<Invoice> {
        c.fs('ReservationService > paymentsView');
        const invoice = new Invoice();
        const [paidBills, paidBillsCount] = await this.billRepository.findMany({ reservationId, isPaid: true });
        invoice.PaidBills = paidBills;
        invoice.PaidTotals = Object.entries(
            paidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({ total: total, currency: currency }) as CurrencyTotal);

        const [unPaidBills, unPaidBillsCount] = await this.billRepository.findMany({ reservationId, isPaid: false });
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
        const config = await this.configRepository.findOne({ group: 'RESERVATION_STATUS', value: 'CCL' });
        if (!config) throw new CustomError('Cannot find config in reservation service.');

        await this.reservationRepository.update(id, { reservationStatusId: config.id, updatedBy: sessionUser.id } as Reservation);

    }


    async reservationCheckIn(id: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationCheckIn');
        c.fs('ReservationService > reservationCancel');
        c.d(id);
        const config = await this.configRepository.findOne({ group: 'RESERVATION_STATUS', value: 'CIN' });
        if (!config) throw new CustomError('Cannot find config in reservation service.');

        await this.reservationRepository.update(id, { reservationStatusId: config.id, updatedBy: sessionUser.id } as Reservation);
    }


    async reservationGetList(searchParams: Record<string, any>, pagerParams: PagerParams, list: string, sessionUser: SessionUser): Promise<[Reservation[], number]> {
        c.fs('ReservationService > reservationGetList');
        c.d(searchParams);
        c.d(pagerParams);
        c.d(pagerParams);
        if (list === 'checkin') {
            return await this.reservationRepository.findMany(searchParams, { column: 'checkInDate', direction: 'desc' }, pagerParams.pageIndex * pagerParams.pageSize, pagerParams.pageSize);
        }
        else if (list === 'checkout') {
            return await this.reservationRepository.findMany(searchParams, { column: 'checkInDate', direction: 'desc' }, pagerParams.pageIndex * pagerParams.pageSize, pagerParams.pageSize);
        }
        else if (list === 'top') {
            return await this.reservationRepository.findMany(null, { column: 'createdAtUTC', direction: 'desc' }, 0, 10);
        }
        else {
            pagerParams.orderBy = "checkInDate";
            pagerParams.orderDirection = "desc";
            return await this.reservationRepository.findMany(searchParams, { column: 'checkInDate', direction: 'desc' }, pagerParams.pageIndex * pagerParams.pageSize, pagerParams.pageSize);
        }
    }


    // async reservationGetListCheckIn(searchParams: SearchParam[], pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Reservation[], PagerParams]> {
    //     c.fs('ReservationService > reservationGetListCheckIn');
    //     c.d(searchParams);
    //     c.d(pagerParams);
    //     pagerParams.orderBy = "checkInDate";
    //     pagerParams.orderDirection = "desc";

    //     return await this.reservationRepository.reservationGetList(searchParams, pagerParams);
    // }


    // async reservationGetListCheckOut(searchParams: SearchParam[], pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Reservation[], PagerParams]> {
    //     c.fs('ReservationService > reservationGetListCheckOut');
    //     c.d(searchParams);
    //     c.d(pagerParams);
    //     pagerParams.orderBy = "checkInDate";
    //     pagerParams.orderDirection = "desc";

    //     return await this.reservationRepository.reservationGetList(searchParams, pagerParams);
    // }


    // async reservationGetListTop(pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Reservation[], PagerParams]> {
    //     c.fs('ReservationService > reservationGetListTop');
    //     c.d(pagerParams);
    //     pagerParams.orderBy = "createdAtUTC";
    //     pagerParams.orderDirection = "desc";
    //     c.d(pagerParams);
    //     return await this.reservationRepository.reservationGetList([], pagerParams);

    // }


    async reservationCheckOut(id: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationCheckOut');
        c.d(id);
        const config = await this.configRepository.findOne({ group: 'RESERVATION_STATUS', value: 'OUT' });
        if (!config) throw new CustomError('Cannot find config in reservation service.');

        await this.reservationRepository.update(id, { reservationStatusId: config.id, updatedBy: sessionUser.id } as Reservation);
    }


    async reservationCreate(reservation: Reservation, sessionUser: SessionUser): Promise<Reservation> {
        c.fs('ReservationService > reservationCreate');

        //retrieve current user
        const user = await this.userService.userFindByUserName(sessionUser.name, sessionUser);
        if (!user) throw new CustomError('Repository cannot find valid user.');

        const result = this.dbClient.db.transaction(async (tx: any) => {

            //first create reservation
            reservation.createdBy = sessionUser.id;
            reservation.updatedBy = sessionUser.id;
            reservation.location = sessionUser.location;
            const createdReservation = await this.reservationRepository.create(reservation, tx);
            if (!createdReservation)
                throw new CustomError('Reservation creation failed.');

            if (reservation.customers && reservation.customers.length > 0) {
                c.i('Customers exist. Prepare to insert.');
                const newReservationCustomers = reservation.customers.map((c) => {
                    return {
                        reservationId: createdReservation.id,
                        customerId: c.id,
                        createdBy: sessionUser.id,
                        updatedBy: sessionUser.id
                    };
                });
                c.d(newReservationCustomers?.length);
                //insert using transaction
                await this.reservationCustomerRepository.create(newReservationCustomers, tx);
                // await tx.insert(reservationCustomerTable).values(newReservationCustomers as unknown as ReservationCustomerEntity[]);
            }

            //insert room reservations
            if (reservation.roomNo) {

                const rrResult = await this.roomReservationCreate(createdReservation, sessionUser, tx);
                if (!rrResult)
                    throw new Error('Room reservation creation failed.');

                const [roomTypes, trc] = await this.roomTypeRepository.findMany({ location: reservation.location });
                const [roomRates, rrc] = await this.roomRateRepository.findMany({ location: reservation.location });
                const roomCharges = await RoomRateEngine.calculate(reservation, [rrResult], roomTypes, roomRates);
                if (!roomCharges || roomCharges.length === 0)
                    throw new Error('Invalid room charge calculation.');

                for (const roomCharge of roomCharges) {
                    roomCharge.createdBy = sessionUser.id;
                    roomCharge.updatedBy = sessionUser.id;
                    const result = await this.roomChargeRepository.create(roomCharge, tx);
                    if (!result)
                        throw new Error('Room charges saved failed.');
                }

                const totalRoomCharges = roomCharges.reduce((accu, rc) => accu += rc.totalAmount, 0);
                reservation.totalAmount = totalRoomCharges;
                reservation.calculateAllAmount();
                await this.reservationRepository.update(reservation.id, reservation, tx);

            }

            c.fe('ReservationService > reservationCreate');
            return createdReservation;
        }, { isolationLevel: "read uncommitted", accessMode: "read write" });
        return result;
    }


    async reservationGetById(id: string, sessionUser: SessionUser): Promise<Reservation | undefined> {
        c.fs('ReservationService > reservationGetById');
        return this.reservationRepository.reservationGetById(id);
    }


    async reservationMoveRoom(id: string, roomNo: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationMoveRoom');
        c.d(id);
        c.d(roomNo);

        c.i('retrieve new room info');
        const room: Room = await this.roomRepository.findOne(and(eq(roomTable.roomNo, roomNo), eq(roomTable.location, sessionUser.location)));
        if (!room) throw new CustomError('Cannot find room while moving room');

        c.i('Retrieve reservation.');
        const reservation: Reservation = await this.reservationRepository.findById(id);
        if (!reservation) throw new CustomError('Cannot find reservation while moving room');

        const [[roomReservation], count]: [RoomReservation[], Number] = await this.roomReservationRepository.findMany(eq(reservationTable.id, id), desc(roomReservationTable.checkInDate), 0, 1);
        if (!roomReservation) throw new CustomError('Cannot find room reservation.');

        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            c.i('Inside transaction');
            const date = new Date(new Date().toISOString());
            c.i('Update current roomReservation record');
            await this.roomReservationRepository.update(roomReservation.id, { checkOutDate: date, updatedBy: sessionUser.id } as RoomReservation, tx as any);

            c.i('Create new roomReservation record');
            const newRoomReservation = new RoomReservation();
            newRoomReservation.reservationId = id;
            newRoomReservation.roomId = room.id;
            newRoomReservation.checkInDate = date;
            newRoomReservation.checkOutDate = reservation.checkOutDate;
            newRoomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
            newRoomReservation.createdBy = sessionUser.id;
            newRoomReservation.updatedBy = sessionUser.id;

            await this.roomReservationRepository.create(newRoomReservation, tx as any);

            c.i('Update reservation table.');
            await this.reservationRepository.update(id, { roomNo: roomNo } as Reservation, tx as any);
        });
        // const operation = async (tx: TransactionType) => {

        // };
        // if (transaction) {
        //     await operation(transaction);
        // } else {
        //     await this.dbClient.db.transaction(async (tx: TransactionType) => {
        //         await operation(tx);
        //     });
        // }
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

        const result = this.dbClient.db.transaction(async (tx: TransactionType) => {

            //retrieve original reservation
            const originalReservation = await this.reservationRepository.findById(id);
            if (!originalReservation)
                throw new CustomError('Cannot find original reservation.');

            c.i('Deleting existing customer list in reservation.');
            await this.reservationCustomerRepository.deleteMany({reservationId:id});

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
                //insert using transaction
                await this.reservationCustomerRepository.createMany(newReservationCustomers, tx as any);
                // await tx.insert(reservationCustomerTable).values(newReservationCustomers as unknown as ReservationCustomerEntity[]);
            }


            if (reservation.roomNo && originalReservation.roomNo !== reservation.roomNo) {

                c.i('vital changed, delete all room reservations and room charges');
                await this.roomReservationRepository.delete(reservation.id, tx as any);
                await this.roomChargeRepository.delete(reservation.id, tx as any);

                const room = await this.roomRepository.findOne(and(eq(roomTable.roomNo, reservation.roomNo), eq(roomTable.location, sessionUser.location)));
                if (!room) throw new CustomError('Room not found.');

                const roomReservation = new RoomReservation();
                roomReservation.reservationId = reservation.id;
                roomReservation.roomId = room.id;
                roomReservation.roomTypeId = room.roomTypeId;
                roomReservation.roomNo = room.roomNo;
                roomReservation.checkInDate = reservation.checkInDate;
                roomReservation.checkOutDate = reservation.checkOutDate;
                roomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
                const rrResult = await this.roomReservationRepository.create(roomReservation, tx as any);
                if (!rrResult)
                    throw new Error('Room reservation creation failed.');

                const [roomTypes, rtc] = await this.roomTypeRepository.findMany({ location: reservation.location });
                if (!roomTypes) throw new CustomError('Service cannot find room types.');

                const [roomRates, rrc] = await this.roomRateRepository.findMany({ location: reservation.location });
                if (!roomRates) throw new CustomError('Service cannot find room rates.');

                const roomCharges = await RoomRateEngine.calculate(reservation, [roomReservation], roomTypes, roomRates);
                if (!roomCharges || roomCharges.length === 0)
                    throw new Error('Invalid room charge calculation.');

                for (const roomCharge of roomCharges) {
                    const result = await this.roomChargeRepository.create(roomCharge, tx as any);
                    if (!result)
                        throw new Error('Room charges saved failed.');
                }

                const totalRoomCharges = roomCharges.reduce((accu, rc) => accu += rc.totalAmount, 0);
                reservation.totalAmount = totalRoomCharges;
                reservation.taxAmount = totalRoomCharges * Number(reservation.tax) / 100;
                reservation.netAmount = reservation.totalAmount - reservation.depositAmount - reservation.taxAmount - reservation.discountAmount;
                reservation.dueAmount = reservation.netAmount;
                await this.reservationRepository.update(
                    reservation.id,
                    {
                        totalAmount: reservation.totalAmount,
                        taxAmount: reservation.taxAmount,
                        netAmount: reservation.netAmount,
                        dueAmount: reservation.dueAmount
                    } as Reservation,
                    tx as any);
            } else if (!reservation.roomNo) {
                c.i('no room number, clear all room reservations and room charges');
                await this.roomReservationRepository.delete(reservation.id, tx as any);
                await this.roomChargeRepository.delete(reservation.id, tx as any);
                reservation.totalAmount = 0;
                reservation.taxAmount = 0;
                reservation.netAmount = 0;
                reservation.dueAmount = 0 - Number(reservation.paidAmount ?? 0);
                await this.reservationRepository.update(
                    reservation.id,
                    {
                        totalAmount: reservation.totalAmount,
                        taxAmount: reservation.taxAmount,
                        netAmount: reservation.netAmount,
                        dueAmount: reservation.dueAmount
                    } as Reservation,
                    tx as any);
            }
        });

        return result;
    }


    async roomReservationCreate(reservation: Reservation, sessionUser: SessionUser, transaction: TransactionType): Promise<RoomReservation> {
        const room = await this.roomRepository.findOne(and(eq(roomTable.roomNo, reservation.roomNo), eq(roomTable.location, sessionUser.location)));
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


    async roomChargeGetListById(reservationId: string, sessionUser: SessionUser): Promise<[RoomCharge[], number]> {
        c.fs('ReservationService > roomChargeGetListById');
        return await this.roomChargeRepository.findMany({ reservationId });
    }


    async roomReservationGetListById(reservationId: string, includeChildren: boolean, sessionUser: SessionUser): Promise<[RoomReservation[], number]> {
        c.fs('ReservationService > roomReservationGetListById');
        return await this.reservationRepository.roomReservationGetListById(reservationId, includeChildren);
    }


    async roomReservationGetList(searchParams: SearchParam[], sessionUser: SessionUser): Promise<[Room[], number]> {
        c.fs('ReservationService > roomReservationGetList');
        if (searchParams[0].searchColumn != SearchParams.date && !searchParams[0].searchValue)
            throw new Error('Invalid search field.');
        return await this.reservationRepository.roomAndReservationGetList(searchParams);
    }


    async roomReservationUpdateList(reservationId: string, roomReservations: RoomReservation[], sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > roomReservationUpdateList');
        if (!reservationId || reservationId === 'undefined')
            throw new Error('Room reservation update failed. Reservation id is required.');
        if (!roomReservations || roomReservations.length === 0)
            throw new Error('Room reservation update failed. No data to process.');
        await this.reservationRepository.roomReservationUpdateList(reservationId, roomReservations);
    }


    async roomScheduleGetList(searchParams: SearchParam[], sessionUser: SessionUser): Promise<[Room[], number]> {
        c.fs('ReservationService > roomScheduleGetList');
        return await this.reservationRepository.roomScheduleGetList(searchParams);
    }

}