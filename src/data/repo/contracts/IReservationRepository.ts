import { PagerParams, SearchParam } from "@/lib/types";
import IRepository from "./IRepository";
import Reservation from "@/domain/models/Reservation";
import Room from "@/domain/models/Room";
import Bill from "@/domain/models/Bill";
import Payment from "@/domain/models/Payment";
import RoomCharge from "@/domain/models/RoomCharge";
import RoomReservation from "@/domain/models/RoomReservation";
import RoomRate from "@/domain/models/RoomRate";
import RoomType from "@/domain/models/RoomType";

export default interface IReservationRepository extends IRepository<Reservation>{

    billDelete(reservationId: string, billId: string): Promise<void>;
    billGetListById(reservationId:string) : Promise<Bill[]>;
    billGetListPaid(reservationId:string) : Promise<Bill[]>;
    billGetListUnpaid(reservationId:string) : Promise<Bill[]>;
    billUpdateList(reservationId:string, bills:Bill[]) : Promise<void>;
    paymentDelete(reservationId: string, paymentId: string): Promise<void>;
    paymentGetListById(reservationId:string) : Promise<Payment[]>;
    paymentUpdateList(reservationId:string, payments:Payment[]) : Promise<void>;
    reservationCancel(id: string) : Promise<void>;
    reservationCheckIn(id: string) : Promise<void>;
    reservationGetListCheckIn(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationCheckOut(id: string) : Promise<void>;
    reservationGetListCheckOut(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationCreate(reservation: Reservation) : Promise<Reservation>;
    reservationGetById(id: string): Promise<Reservation|undefined>;
    reservationGetList(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationMoveRoom(id:string,roomNo:string):Promise<void>;
    reservationUpdate(id:string, reservation: Reservation) : Promise<Reservation>;
    roomAndReservationGetList(searchParams:SearchParam[]) : Promise<Room[]>;
    roomChargeGetListById(reservationId:string) : Promise<RoomCharge[]>;
    roomChargeUpdateList(reservationId:string, roomCharges:RoomCharge[]):Promise<boolean>;
    roomRateGetAll(location:string):Promise<RoomRate[]>;
    // roomReservationsGetByReservationId(reservationId:string) : Promise<RoomReservation[]>;
    roomReservationGetListById(reservationId:string, includeChildren:boolean):Promise<RoomReservation[]>;
    roomReservationUpdateList(reservationId:string, roomReservations:RoomReservation[]):Promise<boolean>;
    roomScheduleGetList(searchParams:SearchParam[]) : Promise<Room[]>;
    roomTypeGetAll(location:string):Promise<RoomType[]>;
    reservationUpdateDropOffInfo(id:string, carNo:string, driver:string) : Promise<void>;
    reservationUpdatePickUpInfo(id:string, carNo:string, driver:string) : Promise<void>;
    
}