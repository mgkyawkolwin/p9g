import { ReservationEntity } from "@/data/orm/drizzle/mysql/schema";
import IReservationService from "./contracts/IReservationService";
import { inject, injectable } from "inversify";
import type IReservationRepository from "@/data/repo/IReservationRepository";
import { PagerParams, TYPES } from "@/lib/types";
import { BaseService } from "./BaseService";
import Reservation from "@/domain/models/Reservation";
import IRepository from "@/data/repo/IRepository";

@injectable()
export default class ReservationService implements IReservationService{

    constructor(@inject(TYPES.IReservationRepository) private reservationRepository : IReservationRepository){
        
    }
    
    async createReservation(reservation : Reservation): Promise<Reservation> {
        return this.reservationRepository.createReservation(reservation);
    }
    
    async reservationTopList(pagerParams : PagerParams): Promise<[Reservation[], PagerParams]> {
        return this.reservationRepository.findReservations([], pagerParams);
    }
    
    async updateReservation(id:string, reservation : Reservation): Promise<Reservation> {
        return this.reservationRepository.updateReservation(id, reservation);
    }
    
}