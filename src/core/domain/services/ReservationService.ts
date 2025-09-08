import IReservationService from "./contracts/IReservationService";
import { inject, injectable } from "inversify";
import type IReservationRepository from "@/core/data/repo/contracts/IReservationRepository";
import { PagerParams, SearchParam, TYPES } from "@/core/lib/types";
import Reservation from "@/core/domain/models/Reservation";
import c from "@/core/logger/console/ConsoleLogger";
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
import type IRoomChargeRepository from "@/core/data/repo/contracts/IRoomChargeRepository";
import type IRoomRepository from "@/core/data/repo/contracts/IRoomRepository";
import type IRoomReservationRepository from "@/core/data/repo/contracts/IRoomReservationRepository";
import { auth } from "@/app/auth";
import type IUserService from "./contracts/IUserService";
import type { IDatabase } from "@/core/data/db/IDatabase";
import { TransactionType } from "@/core/data/orm/drizzle/mysql/db";
import type IConfigRepository from "@/core/data/repo/contracts/IConfigRepository";
import { roomReservationTable } from "@/core/data/orm/drizzle/mysql/schema";
import { eq } from "drizzle-orm";

@injectable()
export default class ReservationService implements IReservationService {


    constructor(
        @inject(TYPES.IConfigRepository) protected readonly configRepository: IConfigRepository,
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>,
        @inject(TYPES.IReservationRepository) private reservationRepository: IReservationRepository,
        @inject(TYPES.IRoomRepository) private roomRepository: IRoomRepository,
        @inject(TYPES.IRoomChargeRepository) private roomChargeRepository: IRoomChargeRepository,
        @inject(TYPES.IRoomReservationRepository) private roomReservationRepository: IRoomReservationRepository,
        @inject(TYPES.IUserService) private userService: IUserService) {

    }


    async billDeleteById(reservationId: string, billId: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > billDeleteById');
        if (!reservationId) throw new CustomError('Service: Reservation id is required.');
        if (!billId) throw new CustomError('Service: Reservation id is required.');
        return await this.reservationRepository.billDelete(reservationId, billId);
    }


    async billGetListById(reservationId: string, sessionUser: SessionUser): Promise<Bill[]> {
        c.fs('ReservationService > billGetListById');
        return await this.reservationRepository.billGetListById(reservationId);
    }


    async billUpdateList(reservationId: string, bills: Bill[], sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > billUpdateList');
        bills.forEach(bill => bill.updatedBy = sessionUser.id);
        await this.reservationRepository.billUpdateList(reservationId, bills);

    }


    async billsView(reservationId: string, sessionUser: SessionUser): Promise<Invoice> {
        c.fs('ReservationService > billsView');
        const invoice = new Invoice();
        const paidBills = await this.reservationRepository.billGetListPaid(reservationId);
        invoice.PaidBills = paidBills;
        invoice.PaidTotals = Object.entries(
            paidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({ total: total, currency: currency }) as CurrencyTotal);

        const unPaidBills = await this.reservationRepository.billGetListUnpaid(reservationId);
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
        return await this.reservationRepository.paymentDelete(reservationId, paymentId);
    }


    async paymentGetListById(reservationId: string, sessionUser: SessionUser): Promise<Payment[]> {
        c.fs('ReservationService > paymentGetListById');
        return await this.reservationRepository.paymentGetListById(reservationId);
    }


    async paymentUpdateList(reservationId: string, payments: Payment[], sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > paymentUpdateList');
        await this.reservationRepository.paymentUpdateList(reservationId, payments);

    }


    async paymentsView(reservationId: string, sessionUser: SessionUser): Promise<Invoice> {
        c.fs('ReservationService > paymentsView');
        const invoice = new Invoice();
        const paidBills = await this.reservationRepository.billGetListPaid(reservationId);
        invoice.PaidBills = paidBills;
        invoice.PaidTotals = Object.entries(
            paidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({ total: total, currency: currency }) as CurrencyTotal);

        const unPaidBills = await this.reservationRepository.billGetListUnpaid(reservationId);
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
        const config = await this.configRepository.findByGroupAndCode('RESERVATION_STATUS', 'CCL');
        if (!config) throw new CustomError('Cannot find config in reservation service.');

        await this.reservationRepository.update(id, { reservationStatusId: config.id, updatedBy: sessionUser.id });
        
    }


    async reservationCheckIn(id: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationCheckIn');
        c.fs('ReservationService > reservationCancel');
        c.d(id);
        const config = await this.configRepository.findByGroupAndCode('RESERVATION_STATUS', 'CIN');
        if (!config) throw new CustomError('Cannot find config in reservation service.');

        await this.reservationRepository.update(id, { reservationStatusId: config.id, updatedBy: sessionUser.id });
    }


    async reservationGetList(searchParams: SearchParam[], pagerParams: PagerParams, list: string, sessionUser: SessionUser): Promise<[Reservation[], PagerParams]> {
        c.fs('ReservationService > reservationGetList');
        c.d(searchParams);
        c.d(pagerParams);
        c.d(pagerParams);
        if (list === 'checkin')
            return await this.reservationGetListCheckIn(searchParams, pagerParams, sessionUser);
        else if (list === 'checkout')
            return await this.reservationGetListCheckOut(searchParams, pagerParams, sessionUser);
        else if (list === 'top') {
            return await this.reservationGetListTop(pagerParams, sessionUser);
        }
        else {
            pagerParams.orderBy = "checkInDate";
            pagerParams.orderDirection = "desc";
            return await this.reservationRepository.reservationGetList(searchParams, pagerParams);
        }
    }


    async reservationGetListCheckIn(searchParams: SearchParam[], pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Reservation[], PagerParams]> {
        c.fs('ReservationService > reservationGetListCheckIn');
        c.d(searchParams);
        c.d(pagerParams);
        pagerParams.orderBy = "checkInDate";
        pagerParams.orderDirection = "desc";

        return await this.reservationRepository.reservationGetList(searchParams, pagerParams);
    }


    async reservationGetListCheckOut(searchParams: SearchParam[], pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Reservation[], PagerParams]> {
        c.fs('ReservationService > reservationGetListCheckOut');
        c.d(searchParams);
        c.d(pagerParams);
        pagerParams.orderBy = "checkInDate";
        pagerParams.orderDirection = "desc";

        return await this.reservationRepository.reservationGetList(searchParams, pagerParams);
    }


    async reservationGetListTop(pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Reservation[], PagerParams]> {
        c.fs('ReservationService > reservationGetListTop');
        c.d(pagerParams);
        pagerParams.orderBy = "createdAtUTC";
        pagerParams.orderDirection = "desc";
        c.d(pagerParams);
        return await this.reservationRepository.reservationGetList([], pagerParams);

    }


    async reservationCheckOut(id: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationCheckOut');
        c.d(id);
        const config = await this.configRepository.findByGroupAndCode('RESERVATION_STATUS', 'OUT');
        if (!config) throw new CustomError('Cannot find config in reservation service.');

        await this.reservationRepository.update(id, { reservationStatusId: config.id, updatedBy: sessionUser.id });
    }


    async reservationCreate(reservation: Reservation, sessionUser: SessionUser): Promise<Reservation> {
        c.fs('ReservationService > reservationCreate');

        //retrieve current user
        const user = await this.userService.userFindByUserName(sessionUser.name, sessionUser);
        if (!user) throw new CustomError('Repository cannot find valid user.');

        const result = this.dbClient.db.transaction(async (tx: TransactionType) => {

            //first create reservation
            reservation.createdBy = sessionUser.id;
            reservation.updatedBy = sessionUser.id;
            const createdReservation = await this.reservationRepository.reservationCreate(reservation, tx);
            if (!createdReservation)
                throw new CustomError('Reservation creation failed.');

            //insert room reservations
            if (reservation.roomNo) {

                const rrResult = await this.roomReservationCreate(createdReservation, sessionUser, tx);
                if (!rrResult)
                    throw new Error('Room reservation creation failed.');

                const roomTypes = await this.reservationRepository.roomTypeGetAll(reservation.location);
                const roomRates = await this.reservationRepository.roomRateGetAll(reservation.location);
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
                const updateResult = await this.reservationRepository.reservationUpdate(reservation.id, reservation, tx);
                if (!updateResult)
                    throw new Error('Reservation update failed.');
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
        const room: Room = await this.roomRepository.findByRoomNoAndLocation(roomNo, sessionUser.location);
        if(!room) throw new CustomError('Cannot find room while moving room');

        c.i('Retrieve reservation.');
        const reservation: Reservation = await this.reservationRepository.findById(id);
        if(!reservation) throw new CustomError('Cannot find reservation while moving room');

        const roomReservations : RoomReservation[] = this.roomReservationRepository.getAllByReservationId(id);

        

        const operation = async (tx: TransactionType) => {
            c.i('Inside transaction');
            const date = new Date(new Date().toISOString());
            c.i('Update current roomReservation record');
            await tx.update(roomReservationTable)
                .set({ checkOutDate: date, updatedBy: session.user.id })
                .where(eq(roomReservationTable.reservationId, id));

            c.i('Create new roomReservation record');
            await tx.insert(roomReservationTable)
                .values(
                    {
                        reservationId: id,
                        roomId: room.id,
                        checkInDate: date,
                        checkOutDate: reservation.checkOutDate,
                        isSingleOccupancy: reservation.isSingleOccupancy,
                        createdBy: session.user.id,
                        updatedBy: session.user.id
                    });

            c.i('Update reservation table.');
            await tx.update(reservationTable)
                .set({ roomNo: roomNo })
                .where(eq(reservationTable.id, id));
        };
        if(transaction){
            await operation(transaction);
        }else{
            await this.dbClient.db.transaction(async (tx:TransactionType) => {
                await operation(tx);
            });
        }
    }


    async reservationUpdateDropOffInfo(id: string, carNo: string, driver: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationUpdateDropOffInfo');
        if (!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');

        return await this.reservationRepository.reservationUpdateDropOffInfo(id, carNo, driver);
    }


    async reservationUpdatePickUpInfo(id: string, carNo: string, driver: string, sessionUser: SessionUser): Promise<void> {
        c.i('ReservationService > reservationUpdatePickUpInfo');
        if (!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');

        return await this.reservationRepository.reservationUpdatePickUpInfo(id, carNo, driver);
    }


    async reservationUpdate(id: string, reservation: Reservation, sessionUser: SessionUser): Promise<Reservation> {
        c.fs('ReservationService > reservationUpdate');

        if (!id || id === 'undefined') {
            throw new Error('Reservation update failed. Id is required.');
        }

        if (!reservation) {
            throw new Error('Reservation update failed. Reservation is required.');
        }

        const session = await auth();
        if (!session)
            throw new CustomError('Repository cannot find valid session');

        //retrieve current user
        const user = await this.userService.userFindByUserName(session.user.name);
        if (!user) throw new CustomError('Repository cannot find valid user.');

        const result = this.dbClient.db.transaction(async (tx: TransactionType) => {

            //retrieve original reservation
            const originalReservation = await this.reservationRepository.findById(id);
            if (!originalReservation)
                throw new CustomError('Cannot find original reservation.');

            if (reservation.roomNo && originalReservation.roomNo !== reservation.roomNo) {

                c.i('vital changed, delete all room reservations and room charges');
                await this.roomReservationRepository.deleteAllByReservationId(reservation.id, tx);
                await this.roomChargeRepository.deleteAllByReservationId(reservation.id, tx);

                const room = await this.roomRepository.findByRoomNoAndLocation(reservation.roomNo, user.location);
                if (!room) throw new CustomError('Room not found.');

                const roomReservation = new RoomReservation();
                roomReservation.reservationId = reservation.id;
                roomReservation.roomId = room.id;
                roomReservation.roomTypeId = room.roomTypeId;
                roomReservation.roomNo = room.roomNo;
                roomReservation.checkInDate = reservation.checkInDate;
                roomReservation.checkOutDate = reservation.checkOutDate;
                roomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
                const rrResult = await this.roomReservationRepository.create(roomReservation, tx);
                if (!rrResult)
                    throw new Error('Room reservation creation failed.');

                const roomTypes = await this.reservationRepository.roomTypeGetAll(reservation.location);
                const roomRates = await this.reservationRepository.roomRateGetAll(reservation.location);
                const roomCharges = await RoomRateEngine.calculate(reservation, [roomReservation], roomTypes, roomRates);
                if (!roomCharges || roomCharges.length === 0)
                    throw new Error('Invalid room charge calculation.');

                for (const roomCharge of roomCharges) {
                    const result = await this.roomChargeRepository.create(roomCharge, tx);
                    if (!result)
                        throw new Error('Room charges saved failed.');
                }

                const totalRoomCharges = roomCharges.reduce((accu, rc) => accu += rc.totalAmount, 0);
                reservation.totalAmount = totalRoomCharges;
                reservation.taxAmount = totalRoomCharges * Number(reservation.tax) / 100;
                reservation.netAmount = reservation.totalAmount - reservation.depositAmount - reservation.taxAmount - reservation.discountAmount;
                reservation.dueAmount = reservation.netAmount;
                const updateResult = await this.reservationRepository.reservationUpdate(reservation.id, reservation, tx);
                if (!updateResult)
                    throw new Error('Reservation updated failed.');
            } else if (!reservation.roomNo) {
                c.i('no room number, clear all room reservations and room charges');
                await this.roomReservationRepository.deleteAllByReservationId(reservation.id, tx);
                await this.roomChargeRepository.deleteAllByReservationId(reservation.id, tx);
                reservation.totalAmount = 0;
                reservation.taxAmount = 0;
                reservation.netAmount = 0;
                reservation.dueAmount = 0 - Number(reservation.paidAmount ?? 0);
            }

            const updatedReservation = await this.reservationRepository.reservationUpdate(id, reservation, tx);
            if (!updatedReservation)
                throw new Error('Reservation update failed.');

            return updatedReservation;
        });

        return result;
    }


    async roomReservationCreate(reservation: Reservation, sessionUser: SessionUser, transaction: TransactionType) : Promise<RoomReservation>{
        const room = await this.roomRepository.findByRoomNoAndLocation(reservation.roomNo, sessionUser.location);
        if(!room) throw new Error('Cannot find room while saving room reservation.');

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
        const rrResult = await this.roomReservationRepository.create(roomReservation, transaction);

        if(!rrResult) throw new CustomError('Room reservation creation failed.');

        return rrResult;
    }


    async roomChargeGetListById(reservationId: string, sessionUser: SessionUser): Promise<RoomCharge[]> {
        c.fs('ReservationService > roomChargeGetListById');
        return await this.reservationRepository.roomChargeGetListById(reservationId);
    }


    async roomReservationGetListById(reservationId: string, includeChildren: boolean, sessionUser: SessionUser): Promise<RoomReservation[]> {
        c.fs('ReservationService > roomReservationGetListById');
        return await this.reservationRepository.roomReservationGetListById(reservationId, includeChildren);
    }


    async roomReservationGetList(searchParams: SearchParam[], sessionUser: SessionUser): Promise<Room[]> {
        c.fs('ReservationService > roomReservationGetList');
        if (searchParams[0].searchColumn != SearchParams.date && !searchParams[0].searchValue)
            throw new Error('Invalid search field.');
        return await this.reservationRepository.roomAndReservationGetList(searchParams);
    }


    async roomReservationUpdateList(reservationId: string, roomReservations: RoomReservation[], sessionUser: SessionUser): Promise<boolean> {
        c.fs('ReservationService > roomReservationUpdateList');
        if (!reservationId || reservationId === 'undefined')
            throw new Error('Room reservation update failed. Reservation id is required.');
        if (!roomReservations || roomReservations.length === 0)
            throw new Error('Room reservation update failed. No data to process.');
        return await this.reservationRepository.roomReservationUpdateList(reservationId, roomReservations);
    }


    async roomScheduleGetList(searchParams: SearchParam[], sessionUser: SessionUser): Promise<Room[]> {
        c.fs('ReservationService > roomScheduleGetList');
        return await this.reservationRepository.roomScheduleGetList(searchParams);
    }

}