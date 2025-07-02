import { Reservation } from "@/data/orm/drizzle/mysql/schema";
import IReservationService from "./contracts/IReservationService";
import { inject, injectable } from "inversify";
import type IReservationRepository from "@/data/repo/IReservationRepository";
import { PagerParams, TYPES } from "@/lib/types";

@injectable()
export default class ReservationService implements IReservationService{

    constructor(@inject(TYPES.IReservationRepository) private reservationRepository : IReservationRepository){

    }
    
    async reservationTopList(pagerParams : PagerParams): Promise<[Reservation[], PagerParams]> {
        return this.reservationRepository.findMany([], pagerParams);
    }
    
}