import { ReservationEntity } from "@/data/orm/drizzle/mysql/schema";
import IReservationService from "./contracts/IReservationService";
import { inject, injectable } from "inversify";
import type IReservationRepository from "@/data/repo/IReservationRepository";
import { PagerParams, TYPES } from "@/lib/types";
import { BaseService } from "./BaseService";
import Reservation from "@/domain/models/Reservation";
import IRepository from "@/data/repo/IRepository";
import { getUTCISODateTimeString } from "@/lib/utils";
import c from "@/lib/core/logger/ConsoleLogger";

@injectable()
export default class ReservationService implements IReservationService{

    constructor(@inject(TYPES.IReservationRepository) private reservationRepository : IReservationRepository){
        
    }
    
    async createReservation(reservation : Reservation): Promise<Reservation> {
        //prepare
        // reservation.reservationStatus = "NEW";
        // reservation.createdAtUTC = new Date();
        // reservation.updatedAtUTC = new Date();
        return this.reservationRepository.createReservation(reservation);
    }
    
    async reservationTopList(pagerParams : PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('ReservationService > reservationTopList');
        c.d(pagerParams);
        pagerParams.orderBy = "createdAtUTC";
        pagerParams.orderDirection = "desc";
        c.d(pagerParams);
        return this.reservationRepository.findReservations([], pagerParams);
    }
    
    async updateReservation(id:string, reservation : Reservation): Promise<Reservation> {
        return this.reservationRepository.updateReservation(id, reservation);
    }
    
}