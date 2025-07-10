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

    async updateReservation(id:string, reservation : Reservation): Promise<Reservation> {
        c.i('ReservationService > updateReservation');
        return this.reservationRepository.updateReservation(id, reservation);
    }
    
}