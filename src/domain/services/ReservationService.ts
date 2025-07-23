import IReservationService from "./contracts/IReservationService";
import { inject, injectable } from "inversify";
import type IReservationRepository from "@/data/repo/IReservationRepository";
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

@injectable()
export default class ReservationService implements IReservationService{


    constructor(@inject(TYPES.IReservationRepository) private reservationRepository : IReservationRepository){
        
    }


    async billsGet(reservationId: string): Promise<Bill[]> {
        c.i('ReservationService > billsGet');
        return await this.reservationRepository.billsGetAll(reservationId);
    }
    

    async billsSave(reservationId:string, bills: Bill[]): Promise<void> {
        c.i('ReservationService > billsSave');
        await this.reservationRepository.billsSave(reservationId, bills);
        c.i('RETURN ReservationService > billsSave');
    }


    async billsView(reservationId: string): Promise<Invoice> {
        c.i('ReservationService > billsView');
        const invoice = new Invoice();
        const paidBills = await this.reservationRepository.billsGetPaids(reservationId);
        invoice.PaidBills = paidBills;
        invoice.PaidTotals = Object.entries(
            paidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({total: total, currency: currency}) as CurrencyTotal);

        const unPaidBills = await this.reservationRepository.billsGetUnpaids(reservationId);
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


    async reservationCreate(reservation : Reservation): Promise<Reservation> {
        c.i('ReservationService > createReservation');
        return await this.reservationRepository.reservationCreate(reservation);
    }

    
    async reservationMoveRoom(id:string, roomNo:string): Promise<void> {
        c.i('ReservationService > patch');
        c.d(id);
        c.d(roomNo);
        
        c.i('Returning from ReservationService > moveRoom.');
        await this.reservationRepository.reservationMoveRoom(id, roomNo);
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
    
    
    async paymentsGet(reservationId: string): Promise<Payment[]> {
        c.i('ReservationService > paymentsGet');
        return await this.reservationRepository.paymentsGetAll(reservationId);
    }
    

    async paymentsSave(reservationId:string, payments: Payment[]): Promise<void> {
        c.i('ReservationService > paymentsSave');
        await this.reservationRepository.paymentsSave(reservationId, payments);
        c.i('RETURN ReservationService > paymentsSave');
    }


    async paymentsView(reservationId: string): Promise<Invoice> {
        c.i('ReservationService > paymentsView');
        const invoice = new Invoice();
        const paidBills = await this.reservationRepository.billsGetPaids(reservationId);
        invoice.PaidBills = paidBills;
        invoice.PaidTotals = Object.entries(
            paidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({total: total, currency: currency}) as CurrencyTotal);

        const unPaidBills = await this.reservationRepository.billsGetUnpaids(reservationId);
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


    async reservationCheckOut(id:string):Promise<void>{
        c.i('ReservationService > reservationCheckOut');
        c.d(id);
        await this.reservationRepository.reservationCheckOut(id);

        c.i('Returning from ReservationService > reservationCheckOut.');
    }


    async reservationFindById(id:string): Promise<Reservation|undefined> {
        c.i('ReservationService > reservationFindById');
        return this.reservationRepository.reservationFindById(id);
    }
    

    async reservationFindMany(searchParams: SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('ReservationService > reservationFindMany');
        c.d(searchParams);
        c.d(pagerParams);
        pagerParams.orderBy = "createdAtUTC";
        pagerParams.orderDirection = "desc";
        c.d(pagerParams);
        return await this.reservationRepository.reservationFindMany(searchParams, pagerParams);
    }
    

    async reservationTopList(pagerParams : PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('ReservationService > reservationTopList');
        c.d(pagerParams);
        pagerParams.orderBy = "createdAtUTC";
        pagerParams.orderDirection = "desc";
        c.d(pagerParams);
        return await this.reservationRepository.reservationFindMany([], pagerParams);
    }
    

    async roomChargesGetAll(reservationId: string): Promise<RoomCharge[]> {
        c.i('ReservationService > roomChargesGetAll');
        return await this.reservationRepository.roomChargesGetAll(reservationId);
    }
    

    async roomReservationList(searchParams: SearchParam[]): Promise<Room[]> {
        c.i('ReservationService > roomReservationList');
        if(searchParams[0].searchColumn != SearchParams.date && !searchParams[0].searchValue)
            throw new Error('Invalid search field.');
        return await this.reservationRepository.roomReservationList(searchParams);
    }
    

    async roomScheduleList(searchParams: SearchParam[]): Promise<Room[]> {
        c.i('ReservationService > roomScheduleList');
        return await this.reservationRepository.roomScheduleList(searchParams);
    }


    async updateDropOffCarNo(id:string, carNo:string) : Promise<void>{
        c.i('ReservationRepository > updateDropOffCarNo');
        if(!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');
        if(!carNo || carNo === 'undefined')
            throw new Error('Car number update failed. Car number is required.');

        c.i('Return ReservationService> updatePickUpCarNo');
        return await this.reservationRepository.updateDropOffCarNo(id,carNo);
    }


    async updatePickUpCarNo(id:string, carNo:string) : Promise<void>{
        c.i('ReservationRepository > updatePickUpCarNo');
        if(!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');
        if(!carNo || carNo === 'undefined')
            throw new Error('Car number update failed. Car number is required.');

        c.i('Return ReservationService> updatePickUpCarNo');
        return await this.reservationRepository.updatePickUpCarNo(id,carNo);
    }

    
    async reservationUpdate(id:string, reservation : Reservation): Promise<Reservation> {
        c.i('ReservationService > updateReservation');

        if(!id || id === 'undefined') {
            throw new Error('Reservation update failed. Id is required.');
        }

        if(!reservation) {
            throw new Error('Reservation update failed. Reservation is required.');
        }

        return await this.reservationRepository.reservationUpdate(id, reservation);
    }
    
}