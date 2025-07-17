import { PagerParams, SearchParam } from "@/lib/types";
import IBaseService from "./IBaseService";
import Reservation from "@/domain/models/Reservation";
import Room from "@/domain/models/Room";
import Bill from "@/domain/models/Bill";

export default interface IReservationService {
    billsGet(reservationId:string):Promise<Bill[]>;
    billsSave(reservationId:string, bills:Bill[]) : Promise<void>;
    createReservation(reservation : Reservation): Promise<Reservation> ;
    moveRoom(id:string, roomNo:string): Promise<void>;
    patch(id:string, operation : string): Promise<void>;
    reservationCancel(id:string):Promise<void>;
    reservationCheckIn(id:string):Promise<void>;
    reservationCheckOut(id:string):Promise<void>;
    reservationFindById(id:string): Promise<Reservation|undefined>;
    reservationFindMany(searchParams: SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationTopList(pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    roomReservationList(searchParam:SearchParam[]) : Promise<Room[]>;
    roomScheduleList(searchParam:SearchParam[]) : Promise<Room[]>;
    updateDropOffCarNo(id:string, carNo:string) : Promise<void>;
    updatePickUpCarNo(id:string, carNo:string) : Promise<void>;
    updateReservation(id: string, reservation: Reservation) : Promise<Reservation>;
}