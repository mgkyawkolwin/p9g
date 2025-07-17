import { PagerParams, SearchParam } from "@/lib/types";
import IRepository from "./IRepository";
import Reservation from "@/domain/models/Reservation";
import Room from "@/domain/models/Room";
import Bill from "@/domain/models/Bill";

export default interface IReservationRepository extends IRepository<Reservation>{

    billsGet(reservationId:string) : Promise<Bill[]>;

    billsSave(reservationId:string, bills:Bill[]) : Promise<void>;
    
    cancel(id: string) : Promise<void>;

    checkIn(id: string) : Promise<void>;

    checkOut(id: string) : Promise<void>;

    createReservation(reservation: Reservation) : Promise<Reservation>;

    moveRoom(id:string,roomNo:string):Promise<void>;

    reservationFindById(id: string): Promise<Reservation|undefined>;

    reservationFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;

    roomReservationList(searchParams:SearchParam[]) : Promise<Room[]>;

    roomScheduleList(searchParams:SearchParam[]) : Promise<Room[]>;

    updateDropOffCarNo(id:string, carNo:string) : Promise<void>;

    updatePickUpCarNo(id:string, carNo:string) : Promise<void>;

    updateReservation(id:string, reservation: Reservation) : Promise<Reservation>;
    
}