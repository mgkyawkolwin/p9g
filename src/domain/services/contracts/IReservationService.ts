import { PagerParams, SearchParam } from "@/lib/types";
import IBaseService from "./IBaseService";
import Reservation from "@/domain/models/Reservation";
import Room from "@/domain/models/Room";
import Bill from "@/domain/models/Bill";
import Invoice from "@/domain/dtos/Invoice";
import Payment from "@/domain/models/Payment";
import RoomCharge from "@/domain/models/RoomCharge";

export default interface IReservationService {
    billsGet(reservationId:string):Promise<Bill[]>;
    billsSave(reservationId:string, bills:Bill[]) : Promise<void>;
    billsView(reservationId:string):Promise<Invoice>;
    patch(id:string, operation : string): Promise<void>;
    paymentsGet(reservationId:string):Promise<Payment[]>;
    paymentsSave(reservationId:string, bills:Payment[]) : Promise<void>;
    paymentsView(reservationId:string):Promise<Invoice>;
    reservationCancel(id:string):Promise<void>;
    reservationCheckIn(id:string):Promise<void>;
    reservationCheckOut(id:string):Promise<void>;
    reservationCreate(reservation : Reservation): Promise<Reservation> ;
    reservationFindById(id:string): Promise<Reservation|undefined>;
    reservationFindMany(searchParams: SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationMoveRoom(id:string, roomNo:string): Promise<void>;
    reservationTopList(pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationUpdate(id: string, reservation: Reservation) : Promise<Reservation>;
    roomChargesGetAll(reservationId:string) : Promise<RoomCharge[]>;
    roomReservationList(searchParam:SearchParam[]) : Promise<Room[]>;
    roomScheduleList(searchParam:SearchParam[]) : Promise<Room[]>;
    updateDropOffCarNo(id:string, carNo:string) : Promise<void>;
    updatePickUpCarNo(id:string, carNo:string) : Promise<void>;
}