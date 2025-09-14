import IReservationService from "./contracts/IReservationService";
import { inject, injectable } from "inversify";
import type IReservationRepository from "@/core/data/repo/contracts/IReservationRepository";
import { PagerParams, SearchParam, TYPES } from "@/core/lib/types";
import Reservation from "@/core/domain/models/Reservation";
import c from "@/core/loggers/console/ConsoleLogger";
import Room from "../models/Room";
import { ConfigGroup, SearchParams } from "@/core/lib/constants";
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
import PrepaidEntity from "@/core/data/entity/PrepaidEntity";
import PromotionEntity from "@/core/data/entity/PromotionEntity";

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
        //return await this.reservationRepository.billDelete(reservationId, billId);
        return await this.billRepository.delete(reservationId);
    }


    async billGetListById(reservationId: string, sessionUser: SessionUser): Promise<[Bill[], number]> {
        c.fs('ReservationService > billGetListById');
        //return await this.reservationRepository.billGetListById(reservationId);
        return await this.billRepository.findMany({ reservationId: reservationId });
    }


    async billUpdateList(reservationId: string, bills: Bill[], sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > billUpdateList');
        c.d(`Bills: ${bills.length}`);
        c.d(bills);
        //await this.reservationRepository.billUpdateList(reservationId, bills);
        c.i('Preparing data based on model state.');
        const updateList = bills.filter(b => b.modelState == 'updated');
        const insertList = bills.filter(b => b.modelState == "inserted");
        c.i(`Update counts: ${updateList.length}`);
        c.i(`Insert counts: ${insertList.length}`);

        c.i('Updating update information.');
        updateList.forEach(bill => {
            bill.updatedBy = sessionUser.id;
        });

        insertList.forEach(bill => {
            bill.createdBy = sessionUser.id;
            bill.updatedBy = sessionUser.id;
        });

        await this.dbClient.db.transaction(async (tx: any) => {
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


    private calculateAllAmount(reservation: Reservation) : Reservation {
        reservation.taxAmount = reservation.totalAmount * reservation.tax / 100;
        reservation.netAmount = reservation.totalAmount + reservation.taxAmount - reservation.discountAmount - reservation.depositAmount;
        reservation.dueAmount = reservation.totalAmount - reservation.paidAmount;
        return reservation;
    }

    async invoiceGet(reservationId: string, sessionUser: SessionUser): Promise<Invoice> {
        c.fs('ReservationService > invoiceGet');
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
        c.fe('ReservationService > invoiceGet');
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
        return await this.paymentRepository.findMany({ reservationId: reservationId });
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
        pagerParams.orderBy = "checkInDate";
        pagerParams.orderDirection = "desc";
        if (list === 'checkin') {
            return await this.reservationRepository.reservationGetList(searchParams, pagerParams);
        }
        else if (list === 'checkout') {
            return await this.reservationRepository.reservationGetList(searchParams, pagerParams);
        }
        else if (list === 'top') {
            pagerParams.orderBy = 'createdAtUTC';
            pagerParams.orderDirection = 'desc';
            pagerParams.pageIndex = 1;
            pagerParams.pageSize = 10;
            return await this.reservationRepository.reservationGetList(searchParams, pagerParams);
        }
        else {
            return await this.reservationRepository.reservationGetList(searchParams, pagerParams);
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

        c.i('Preparing reservation to insert');
        reservation.createdAtUTC = new Date();
        reservation.createdBy = sessionUser.id;
        reservation.updatedBy = sessionUser.id;
        reservation.updatedAtUTC = new Date();
        reservation.location = sessionUser.location;

        c.i('Retrieveing reservation status id');
        const reservationStatus = await this.configRepository.findOne({group: ConfigGroup.RESERVATION_STATUS,value: reservation.reservationStatus});
        if(!reservationStatus) throw new CustomError('Reservation service cannot find reservation status');
        reservation.reservationStatusId = reservationStatus.id;

        c.i('Retrieveing reservation type id');
        const reservationType = await this.configRepository.findOne({group: ConfigGroup.RESERVATION_TYPE, value: reservation.reservationType});
        if(!reservationType) throw new CustomError('Reservation service cannot find reservation type');
        reservation.reservationTypeId = reservationType.id;

        if(reservation.prepaidPackage){
            c.i('Retrieveing prepaid package id');
            const prepaidPackage = await this.prepaidRepository.findOne({value: reservation.prepaidPackage});
            if(!prepaidPackage) throw new CustomError('Reservation service cannot find prepaid package');
            reservation.prepaidPackageId = prepaidPackage.id;
        }

        if(reservation.promotionPackage){
            c.i('Retrieveing promotion package id');
            const prromotionPackage = await this.promotionRepository.findOne({value: reservation.promotionPackage});
            if(!prromotionPackage) throw new CustomError('Reservation service cannot find prepaid package');
            reservation.promotionPackageId = prromotionPackage.id;
        }

        if(reservation.pickUpType){
            c.i('Retrieveing pickup type id');
            const pickupType = await this.configRepository.findOne({group: ConfigGroup.RIDE_TYPE, value: reservation.pickUpType});
            if(!pickupType) throw new CustomError('Reservation service cannot find pickup type.');
            reservation.pickUpTypeId = pickupType.id;
        }

        if(reservation.dropOffType){
            c.i('Retrieveing pickup type id');
            const dropOffType = await this.configRepository.findOne({group: ConfigGroup.RIDE_TYPE, value: reservation.dropOffType});
            if(!dropOffType) throw new CustomError('Reservation service cannot find drop off type.');
            reservation.dropOffTypeId = dropOffType.id;
        }

        let room : Room;
        if(reservation.roomNo){
            c.i('Retrieveing room info');
            room = await this.roomRepository.findOne({roomNo: reservation.roomNo});
            if(!room) throw new CustomError('Invalid room no');
        }

        const result = this.dbClient.db.transaction(async (tx: any) => {

            c.i('Creating reservation');
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
                //insert using transaction
                await this.reservationCustomerRepository.createMany(newReservationCustomers, tx);
                // await tx.insert(reservationCustomerTable).values(newReservationCustomers as unknown as ReservationCustomerEntity[]);
            }

            //insert room reservations
            if (reservation.roomNo) {
                c.i('Creating room reservation');
                const rrResult = await this.roomReservationCreate(createdReservation, sessionUser, tx);
                if (!rrResult)
                    throw new Error('Room reservation creation failed.');

                c.i('Calculating room charges');
                const [roomTypes, trc] = await this.roomTypeRepository.findMany({ location: reservation.location });
                const [roomRates, rrc] = await this.roomRateRepository.findMany({ location: reservation.location });
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


    async reservationMoveRoom(id: string, roomNo: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationMoveRoom');
        c.d(id);
        c.d(roomNo);

        c.i('retrieve new room info');
        const room: Room = await this.roomRepository.findOne({roomNo: roomNo, location: sessionUser.location});
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

        c.i('Preparing reservation to update');
        reservation.updatedBy = sessionUser.id;
        reservation.updatedAtUTC = new Date();

        c.i('Retrieveing reservation status id');
        const reservationStatus = await this.configRepository.findOne({group: ConfigGroup.RESERVATION_STATUS,value: reservation.reservationStatus});
        if(!reservationStatus) throw new CustomError('Reservation service cannot find reservation status');
        reservation.reservationStatusId = reservationStatus.id;

        c.i('Retrieveing reservation type id');
        const reservationType = await this.configRepository.findOne({group: ConfigGroup.RESERVATION_TYPE, value: reservation.reservationType});
        if(!reservationType) throw new CustomError('Reservation service cannot find reservation type');
        reservation.reservationTypeId = reservationType.id;

        if(reservation.prepaidPackage){
            c.i('Retrieveing prepaid package id');
            const prepaidPackage = await this.prepaidRepository.findOne({value: reservation.prepaidPackage});
            if(!prepaidPackage) throw new CustomError('Reservation service cannot find prepaid package');
            reservation.prepaidPackageId = prepaidPackage.id;
        }else{
            reservation.prepaidPackageId = null;
        }

        if(reservation.promotionPackage){
            c.i('Retrieveing promotion package id');
            const prromotionPackage = await this.promotionRepository.findOne({value: reservation.promotionPackage});
            if(!prromotionPackage) throw new CustomError('Reservation service cannot find prepaid package');
            reservation.promotionPackageId = prromotionPackage.id;
        }else{
            reservation.promotionPackageId = null;
        }

        if(reservation.pickUpType){
            c.i('Retrieveing pickup type id');
            const pickupType = await this.configRepository.findOne({group: ConfigGroup.RIDE_TYPE, value: reservation.pickUpType});
            if(!pickupType) throw new CustomError('Reservation service cannot find pickup type.');
            reservation.pickUpTypeId = pickupType.id;
        }else{
            reservation.pickUpTypeId = null;
        }

        if(reservation.dropOffType){
            c.i('Retrieveing pickup type id');
            const dropOffType = await this.configRepository.findOne({group: ConfigGroup.RIDE_TYPE, value: reservation.dropOffType});
            if(!dropOffType) throw new CustomError('Reservation service cannot find drop off type.');
            reservation.dropOffTypeId = dropOffType.id;
        }else{
            reservation.dropOffTypeId = null;
        }

        const result = this.dbClient.db.transaction(async (tx: TransactionType) => {

            c.i('Retrieveing original reservation');
            const originalReservation = await this.reservationRepository.findById(id);
            if (!originalReservation)
                throw new CustomError('Cannot find original reservation.');

            c.i('Updating reservation');
            await this.reservationRepository.update(id, reservation, tx as any);

            c.i('Deleting existing customer list in reservation.');
            await this.reservationCustomerRepository.deleteWhere({reservationId:id});

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
                await this.roomReservationRepository.deleteWhere({reservationId: reservation.id}, tx as any);
                await this.roomChargeRepository.deleteWhere({reservationId: reservation.id}, tx as any);

                const room = await this.roomRepository.findOne({roomNo:reservation.roomNo, location: sessionUser.location});
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

                const [roomTypes, rtc] = await this.roomTypeRepository.findMany({ location: reservation.location });
                if (!roomTypes) throw new CustomError('Service cannot find room types.');

                const [roomRates, rrc] = await this.roomRateRepository.findMany({ location: reservation.location });
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
                await this.reservationRepository.update( reservation.id, reservation, tx as any);
            } else if (!reservation.roomNo) {
                c.i('no room number, clear all room reservations and room charges');
                await this.roomReservationRepository.deleteWhere({reservationId: reservation.id}, tx as any);
                await this.roomChargeRepository.deleteWhere({reservationId: reservation.id}, tx as any);
                reservation.totalAmount = 0;
                reservation = this.calculateAllAmount(reservation);
                await this.reservationRepository.update(reservation.id, reservation, tx as any);
            }
        });

        return result;
    }


    async roomReservationCreate(reservation: Reservation, sessionUser: SessionUser, transaction: TransactionType): Promise<RoomReservation> {
        const room = await this.roomRepository.findOne({roomNo: reservation.roomNo, location: sessionUser.location});
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
        return await this.roomChargeRepository.findMany({ reservationId: reservationId });
    }


    async roomReservationGetListById(reservationId: string, includeChildren: boolean, sessionUser: SessionUser): Promise<[RoomReservation[], number]> {
        c.fs('ReservationService > roomReservationGetListById');
        return await this.reservationRepository.roomReservationGetListById(reservationId, includeChildren, sessionUser);
    }


    async roomReservationGetList(searchParams: Record<string, any>, sessionUser: SessionUser): Promise<[Room[], number]> {
        c.fs('ReservationService > roomReservationGetList');
        // if (searchParams[0].searchColumn != SearchParams.date && !searchParams[0].searchValue)
        //     throw new Error('Invalid search field.');
        return await this.reservationRepository.roomAndReservationGetList(searchParams, sessionUser);
    }


    async roomReservationUpdateList(reservationId: string, roomReservations: RoomReservation[], sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > roomReservationUpdateList');
        if (!reservationId || reservationId === 'undefined')
            throw new Error('Room reservation update failed. Reservation id is required.');
        if (!roomReservations || roomReservations.length === 0)
            throw new Error('Room reservation update failed. No data to process.');
        await this.reservationRepository.roomReservationUpdateList(reservationId, roomReservations, sessionUser);
    }


    async roomScheduleGetList(searchParams: SearchParam[], sessionUser: SessionUser): Promise<[Room[], number]> {
        c.fs('ReservationService > roomScheduleGetList');
        return await this.reservationRepository.roomScheduleGetList(searchParams, sessionUser);
    }

}