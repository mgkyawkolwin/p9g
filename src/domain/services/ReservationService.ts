import { ReservationEntity } from "@/data/orm/drizzle/mysql/schema";
import IReservationService from "./contracts/IReservationService";
import { inject, injectable } from "inversify";
import type IReservationRepository from "@/data/repo/IReservationRepository";
import { PagerParams, SearchParam, TYPES } from "@/lib/types";
import { BaseService } from "./BaseService";
import Reservation from "@/domain/models/Reservation";
import IRepository from "@/data/repo/IRepository";
import { getUTCISODateTimeString } from "@/lib/utils";
import c from "@/lib/core/logger/ConsoleLogger";
import Room from "../models/Room";
import { SearchParams } from "@/lib/constants";

@injectable()
export default class ReservationService implements IReservationService{


    constructor(@inject(TYPES.IReservationRepository) private reservationRepository : IReservationRepository){
        
    }
    

    async createReservation(reservation : Reservation): Promise<Reservation> {
        c.i('ReservationService > createReservation');
        return this.reservationRepository.createReservation(reservation);
    }

    
    async moveRoom(id:string, roomNo:string): Promise<void> {
        c.i('ReservationService > patch');
        c.d(id);
        c.d(roomNo);
        
        c.i('Returning from ReservationService > moveRoom.');
        return this.reservationRepository.moveRoom(id, roomNo);
    }
    

    async patch(id:string, operation : string): Promise<void> {
        c.i('ReservationService > patch');
        c.d(id);
        c.d(operation);
        if(operation === 'CANCEL'){
            c.i('Cancel operation running.');
            this.reservationRepository.cancel(id);
        }

        if(operation === 'CHECKIN'){
            c.i('CheckIn operation running.');
            this.reservationRepository.checkIn(id);
        }

        c.i('Returning from ReservationService > patch.');
    }


    async reservationCancel(id:string):Promise<void>{
        c.i('ReservationService > reservationCancel');
        c.d(id);
        this.reservationRepository.cancel(id);

        c.i('Returning from ReservationService > reservationCancel.');
    }


    async reservationCheckIn(id:string):Promise<void>{
        c.i('ReservationService > reservationCheckIn');
        c.d(id);
        this.reservationRepository.checkIn(id);

        c.i('Returning from ReservationService > reservationCheckIn.');
    }


    async reservationCheckOut(id:string):Promise<void>{
        c.i('ReservationService > reservationCheckOut');
        c.d(id);
        this.reservationRepository.checkOut(id);

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
        return this.reservationRepository.reservationFindMany(searchParams, pagerParams);
    }
    

    async reservationTopList(pagerParams : PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('ReservationService > reservationTopList');
        c.d(pagerParams);
        pagerParams.orderBy = "createdAtUTC";
        pagerParams.orderDirection = "desc";
        c.d(pagerParams);
        return this.reservationRepository.reservationFindMany([], pagerParams);
    }
    

    async roomReservationList(searchParams: SearchParam[]): Promise<Room[]> {
        c.i('ReservationService > roomReservationList');
        if(searchParams[0].searchColumn != SearchParams.date && !searchParams[0].searchValue)
            throw new Error('Invalid search field.');
        return this.reservationRepository.roomReservationList(searchParams);
    }
    

    async roomScheduleList(searchParams: SearchParam[]): Promise<Room[]> {
        c.i('ReservationService > roomScheduleList');
        return this.reservationRepository.roomScheduleList(searchParams);
    }


    async updateDropOffCarNo(id:string, carNo:string) : Promise<void>{
        c.i('ReservationRepository > updateDropOffCarNo');
        if(!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');
        if(!carNo || carNo === 'undefined')
            throw new Error('Car number update failed. Car number is required.');

        c.i('Return ReservationService> updatePickUpCarNo');
        return this.reservationRepository.updateDropOffCarNo(id,carNo);
    }


    async updatePickUpCarNo(id:string, carNo:string) : Promise<void>{
        c.i('ReservationRepository > updatePickUpCarNo');
        if(!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');
        if(!carNo || carNo === 'undefined')
            throw new Error('Car number update failed. Car number is required.');

        c.i('Return ReservationService> updatePickUpCarNo');
        return this.reservationRepository.updatePickUpCarNo(id,carNo);
    }

    
    async updateReservation(id:string, reservation : Reservation): Promise<Reservation> {
        c.i('ReservationService > updateReservation');

        if(!id || id === 'undefined') {
            throw new Error('Reservation update failed. Id is required.');
        }

        if(!reservation) {
            throw new Error('Reservation update failed. Reservation is required.');
        }

        return this.reservationRepository.updateReservation(id, reservation);
    }
    
}