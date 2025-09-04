import IReservationService from "./contracts/IReservationService";
import { inject, injectable } from "inversify";
import type IReservationRepository from "@/data/repo/contracts/IReservationRepository";
import { PagerParams, SearchParam, TYPES } from "@/lib/types";
import Reservation from "@/domain/models/Reservation";
import c from "@/lib/core/logger/ConsoleLogger";
import Room from "../models/Room";
import { SearchParams } from "@/lib/constants";
import Bill from "../models/Bill";
import Invoice from "../dtos/Invoice";
import CurrencyTotal from "../dtos/CurrencyTotal";
import Payment from "../models/Payment";
import RoomCharge from "../models/RoomCharge";
import RoomRateEngine from "../engines/RoomRateEngine";
import { CustomError } from "@/lib/errors";
import RoomReservation from "../models/RoomReservation";
import type IRoomChargeRepository from "@/data/repo/contracts/IRoomChargeRepository";
import type IRoomRepository from "@/data/repo/contracts/IRoomRepository";
import type IRoomReservationRepository from "@/data/repo/contracts/IRoomReservationRepository";

@injectable()
export default class ReservationService implements IReservationService{


    constructor(
        @inject(TYPES.IReservationRepository) private reservationRepository : IReservationRepository,
        @inject(TYPES.IRoomRepository) private roomRepository : IRoomRepository,
        @inject(TYPES.IRoomChargeRepository) private roomChargeRepository : IRoomChargeRepository,
        @inject(TYPES.IRoomReservationRepository) private roomReservationRepository : IRoomReservationRepository){
        
    }


    async billDeleteById(reservationId: string, billId: string): Promise<void> {
        if(!reservationId) throw new CustomError('Service: Reservation id is required.');
        if(!billId) throw new CustomError('Service: Reservation id is required.');
        return await this.reservationRepository.billDelete(reservationId, billId);
    }


    async billGetListById(reservationId: string): Promise<Bill[]> {
        c.i('ReservationService > billsGet');
        return await this.reservationRepository.billGetListById(reservationId);
    }
    

    async billUpdateList(reservationId:string, bills: Bill[]): Promise<void> {
        c.i('ReservationService > billsSave');
        await this.reservationRepository.billUpdateList(reservationId, bills);
        c.i('RETURN ReservationService > billsSave');
    }


    async billsView(reservationId: string): Promise<Invoice> {
        c.i('ReservationService > billsView');
        const invoice = new Invoice();
        const paidBills = await this.reservationRepository.billGetListPaid(reservationId);
        invoice.PaidBills = paidBills;
        invoice.PaidTotals = Object.entries(
            paidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({total: total, currency: currency}) as CurrencyTotal);

        const unPaidBills = await this.reservationRepository.billGetListUnpaid(reservationId);
        invoice.UnPaidBills = unPaidBills;
        invoice.UnPaidTotals = Object.entries(
            unPaidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({total: total, currency: currency}) as CurrencyTotal);

        return invoice;
    }
    

    async patch(id:string, operation : string): Promise<void> {
        c.i('ReservationService > patch');
        c.d(id);
        c.d(operation);
        if(operation === 'CANCEL'){
            c.i('Cancel operation running.');
            await this.reservationRepository.reservationCancel(id);
        }

        if(operation === 'CHECKIN'){
            c.i('CheckIn operation running.');
            await this.reservationRepository.reservationCheckIn(id);
        }

        c.i('Returning from ReservationService > patch.');
    }


    async paymentDeleteById(reservationId: string, paymentId: string): Promise<void> {
        if(!reservationId) throw new CustomError('Service: Reservation id is required.');
        if(!paymentId) throw new CustomError('Service: Reservation id is required.');
        return await this.reservationRepository.paymentDelete(reservationId, paymentId);
    }
    
    
    async paymentGetListById(reservationId: string): Promise<Payment[]> {
        c.i('ReservationService > paymentsGet');
        return await this.reservationRepository.paymentGetListById(reservationId);
    }
    

    async paymentUpdateList(reservationId:string, payments: Payment[]): Promise<void> {
        c.i('ReservationService > paymentsSave');
        await this.reservationRepository.paymentUpdateList(reservationId, payments);
        c.i('RETURN ReservationService > paymentsSave');
    }


    async paymentsView(reservationId: string): Promise<Invoice> {
        c.i('ReservationService > paymentsView');
        const invoice = new Invoice();
        const paidBills = await this.reservationRepository.billGetListPaid(reservationId);
        invoice.PaidBills = paidBills;
        invoice.PaidTotals = Object.entries(
            paidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({total: total, currency: currency}) as CurrencyTotal);

        const unPaidBills = await this.reservationRepository.billGetListUnpaid(reservationId);
        invoice.UnPaidBills = unPaidBills;
        invoice.UnPaidTotals = Object.entries(
            unPaidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({total: total, currency: currency}) as CurrencyTotal);

        return invoice;
    }


    async reservationCancel(id:string):Promise<void>{
        c.i('ReservationService > reservationCancel');
        c.d(id);
        await this.reservationRepository.reservationCancel(id);

        c.i('Returning from ReservationService > reservationCancel.');
    }


    async reservationCheckIn(id:string):Promise<void>{
        c.i('ReservationService > reservationCheckIn');
        c.d(id);
        await this.reservationRepository.reservationCheckIn(id);

        c.i('Returning from ReservationService > reservationCheckIn.');
    }
    

    async reservationGetListCheckIn(searchParams: SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('ReservationService > reservationCheckInList');
        c.d(searchParams);
        c.d(pagerParams);
        pagerParams.orderBy = "checkInDateUTC";
        pagerParams.orderDirection = "desc";
        
        return await this.reservationRepository.reservationGetListCheckIn(searchParams, pagerParams);
    }
    

    async reservationGetListCheckOut(searchParams: SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('ReservationService > reservationCheckInList');
        c.d(searchParams);
        c.d(pagerParams);
        pagerParams.orderBy = "checkInDateUTC";
        pagerParams.orderDirection = "desc";
        
        return await this.reservationRepository.reservationGetListCheckOut(searchParams, pagerParams);
    }


    async reservationCheckOut(id:string):Promise<void>{
        c.i('ReservationService > reservationCheckOut');
        c.d(id);
        await this.reservationRepository.reservationCheckOut(id);

        c.i('Returning from ReservationService > reservationCheckOut.');
    }


    async reservationCreate(reservation : Reservation): Promise<Reservation> {
        c.i('ReservationService > createReservation');

        //first create reservation
        const createdReservation = await this.reservationRepository.reservationCreate(reservation);
        if(!createdReservation)
            throw new CustomError('Reservation creation failed.');

        //insert room reservations
        if(reservation.roomNo){
            const room = await this.roomRepository.findByRoomNo(reservation.roomNo);
            if(!room) throw new CustomError('Room not found.');
            
            const roomReservation = new RoomReservation();
            roomReservation.reservationId = createdReservation.id;
            roomReservation.roomId = room.id;
            roomReservation.roomTypeId = room.roomTypeId;
            roomReservation.roomNo = room.roomNo;
            roomReservation.checkInDateUTC = reservation.checkInDateUTC;
            roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
            roomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
            const rrResult = await this.roomReservationRepository.create(roomReservation);
            if(!rrResult)
                throw new Error('Room reservation creation failed.');

            const roomTypes = await this.reservationRepository.roomTypeGetAll(reservation.location);
            const roomRates = await this.reservationRepository.roomRateGetAll(reservation.location);
            const roomCharges = await RoomRateEngine.calculate(reservation, [roomReservation], roomTypes, roomRates);
            if(!roomCharges || roomCharges.length === 0)
                throw new Error('Invalid room charge calculation.');

            for(const roomCharge of roomCharges){
                const result = await this.roomChargeRepository.create(roomCharge);
                if(!result)
                    throw new Error('Room charges saved failed.');
            }
            const totalRoomCharges = roomCharges.reduce((accu,rc) => accu += rc.totalAmount,0);
            reservation.totalAmount = totalRoomCharges;
            reservation.taxAmount = totalRoomCharges * Number(reservation.tax) / 100;
            reservation.netAmount = reservation.totalAmount - reservation.depositAmount - reservation.taxAmount - reservation.discountAmount;
            reservation.dueAmount = reservation.netAmount;
            const updateResult = await this.reservationRepository.reservationUpdate(reservation.id, reservation);
            if(!updateResult)
                throw new Error('Reservation updated failed.');
        }

        return createdReservation;
    }


    async reservationGetById(id:string): Promise<Reservation|undefined> {
        c.i('ReservationService > reservationFindById');
        return this.reservationRepository.reservationGetById(id);
    }
    

    async reservationGetList(searchParams: SearchParam[], pagerParams:PagerParams, list:string): Promise<[Reservation[], PagerParams]> {
        c.i('ReservationService > reservationFindMany');
        c.d(searchParams);
        c.d(pagerParams);
        pagerParams.orderBy = "checkInDateUTC";
        pagerParams.orderDirection = "desc";
        c.d(pagerParams);
        if(list === 'checkin')
            return await this.reservationRepository.reservationGetListCheckIn(searchParams, pagerParams);
        else if(list === 'checkout')
            return await this.reservationRepository.reservationGetListCheckOut(searchParams, pagerParams);
        else if(list === 'top'){
            pagerParams.orderBy = "createdAtUTC";
            pagerParams.orderDirection = "desc";
            return await this.reservationRepository.reservationGetListCheckOut(searchParams, pagerParams);
        }
        else
            return await this.reservationRepository.reservationGetList(searchParams, pagerParams);
    }

    
    async reservationMoveRoom(id:string, roomNo:string): Promise<void> {
        c.i('ReservationService > patch');
        c.d(id);
        c.d(roomNo);
        
        c.i('Returning from ReservationService > moveRoom.');
        await this.reservationRepository.reservationMoveRoom(id, roomNo);
    }
    

    async reservationGetListTop(pagerParams : PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('ReservationService > reservationTopList');
        c.d(pagerParams);
        pagerParams.orderBy = "createdAtUTC";
        pagerParams.orderDirection = "desc";
        c.d(pagerParams);
        return await this.reservationRepository.reservationGetList([], pagerParams);

    }


    async reservationUpdateDropOffInfo(id:string, carNo:string, driver:string) : Promise<void>{
        c.i('ReservationRepository > updateDropOffCarNo');
        if(!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');

        c.i('Return ReservationService> updatePickUpCarNo');
        return await this.reservationRepository.reservationUpdateDropOffInfo(id, carNo, driver);
    }


    async reservationUpdatePickUpInfo(id:string, carNo:string,  driver:string) : Promise<void>{
        c.i('ReservationRepository > updatePickUpCarNo');
        if(!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');

        c.i('Return ReservationService> updatePickUpCarNo');
        return await this.reservationRepository.reservationUpdatePickUpInfo(id, carNo,driver);
    }

    
    async reservationUpdate(id:string, reservation : Reservation): Promise<Reservation> {
        c.i('ReservationService > updateReservation');

        if(!id || id === 'undefined') {
            throw new Error('Reservation update failed. Id is required.');
        }

        if(!reservation) {
            throw new Error('Reservation update failed. Reservation is required.');
        }

        //retrieve original reservation
        const originalReservation = await this.reservationRepository.findById(id);
        if(!originalReservation)
            throw new CustomError('Cannot find original reservation.');

        if(reservation.roomNo && originalReservation.roomNo !== reservation.roomNo){

            //vital changed, delete all room reservations and room charges
            await this.roomReservationRepository.deleteAllByReservationId(reservation.id);
            await this.roomChargeRepository.deleteAllByReservationId(reservation.id);

            const room = await this.roomRepository.findByRoomNo(reservation.roomNo);
            if(!room) throw new CustomError('Room not found.');
            
            const roomReservation = new RoomReservation();
            roomReservation.reservationId = reservation.id;
            roomReservation.roomId = room.id;
            roomReservation.roomTypeId = room.roomTypeId;
            roomReservation.roomNo = room.roomNo;
            roomReservation.checkInDateUTC = reservation.checkInDateUTC;
            roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
            roomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
            const rrResult = await this.roomReservationRepository.create(roomReservation);
            if(!rrResult)
                throw new Error('Room reservation creation failed.');

            const roomTypes = await this.reservationRepository.roomTypeGetAll(reservation.location);
            const roomRates = await this.reservationRepository.roomRateGetAll(reservation.location);
            const roomCharges = await RoomRateEngine.calculate(reservation, [roomReservation], roomTypes, roomRates);
            if(!roomCharges || roomCharges.length === 0)
                throw new Error('Invalid room charge calculation.');

            for(const roomCharge of roomCharges){
                const result = await this.roomChargeRepository.create(roomCharge);
                if(!result)
                    throw new Error('Room charges saved failed.');
            }

            const totalRoomCharges = roomCharges.reduce((accu,rc) => accu += rc.totalAmount,0);
            reservation.totalAmount = totalRoomCharges;
            reservation.taxAmount = totalRoomCharges * Number(reservation.tax) / 100;
            reservation.netAmount = reservation.totalAmount - reservation.depositAmount - reservation.taxAmount - reservation.discountAmount;
            reservation.dueAmount = reservation.netAmount;
            const updateResult = await this.reservationRepository.reservationUpdate(reservation.id, reservation);
            if(!updateResult)
                throw new Error('Reservation updated failed.');
        }else{
            //no room number, clear all room reservations and room charges
            await this.roomReservationRepository.deleteAllByReservationId(reservation.id);
            await this.roomChargeRepository.deleteAllByReservationId(reservation.id);
            reservation.totalAmount = 0;
            reservation.taxAmount = 0;
            reservation.netAmount = 0;
            reservation.dueAmount = 0 - Number(reservation.paidAmount ?? 0);
        }
        
        const updatedReservation = await this.reservationRepository.reservationUpdate(id, reservation);
        if(!updatedReservation)
            throw new Error('Reservation update failed.');

        return updatedReservation;
    }
    

    async roomChargeGetListById(reservationId: string): Promise<RoomCharge[]> {
        c.i('ReservationService > roomChargesGetAll');
        return await this.reservationRepository.roomChargeGetListById(reservationId);
    }
    

    async roomReservationGetListById(reservationId:string, includeChildren:boolean): Promise<RoomReservation[]> {
        c.i('ReservationService > roomReservationGetListById');
        return await this.reservationRepository.roomReservationGetListById(reservationId, includeChildren);
    }
    

    async roomReservationGetList(searchParams: SearchParam[]): Promise<Room[]> {
        c.i('ReservationService > roomReservationList');
        if(searchParams[0].searchColumn != SearchParams.date && !searchParams[0].searchValue)
            throw new Error('Invalid search field.');
        return await this.reservationRepository.roomAndReservationGetList(searchParams);
    }


    async roomReservationUpdateList(reservationId:string, roomReservations: RoomReservation[]): Promise<boolean> {
        c.i('ReservationService > roomReservationUpdateList');
        if(!reservationId || reservationId === 'undefined')
            throw new Error('Room reservation update failed. Reservation id is required.');
        if(!roomReservations || roomReservations.length === 0)
            throw new Error('Room reservation update failed. No data to process.');
        return await this.reservationRepository.roomReservationUpdateList(reservationId, roomReservations);
    }
    

    async roomScheduleGetList(searchParams: SearchParam[]): Promise<Room[]> {
        c.i('ReservationService > roomScheduleList');
        return await this.reservationRepository.roomScheduleGetList(searchParams);
    }
    
}