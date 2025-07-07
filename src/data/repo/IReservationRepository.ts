import { PagerParams, SearchParam } from "@/lib/types";
import IRepository from "./IRepository";
import Reservation from "@/domain/models/Reservation";
import { ReservationEntity } from "../orm/drizzle/mysql/schema";

export default interface IReservationRepository extends IRepository<Reservation>{
    
    createReservation(reservation: Reservation) : Promise<Reservation>;

    reservationFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;

    updateReservation(id:string, reservation: Reservation) : Promise<Reservation>;
    
}