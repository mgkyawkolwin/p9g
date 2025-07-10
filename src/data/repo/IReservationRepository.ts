import { PagerParams, SearchParam } from "@/lib/types";
import IRepository from "./IRepository";
import Reservation from "@/domain/models/Reservation";
import { ReservationEntity } from "../orm/drizzle/mysql/schema";
import Room from "@/domain/models/Room";

export default interface IReservationRepository extends IRepository<Reservation>{
    
    cancel(id: string) : Promise<void>;

    checkIn(id: string) : Promise<void>;

    createReservation(reservation: Reservation) : Promise<Reservation>;

    reservationFindById(id: string): Promise<Reservation|undefined>;

    reservationFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;

    roomReservationList(searchParams:SearchParam[]) : Promise<Room[]>;

    roomScheduleList(searchParams:SearchParam[]) : Promise<Room[]>;

    updateReservation(id:string, reservation: Reservation) : Promise<Reservation>;
    
}