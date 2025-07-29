import { PagerParams, SearchParam } from "@/lib/types";
import IRepository from "./IRepository";
import Reservation from "@/domain/models/Reservation";
import Room from "@/domain/models/Room";
import Bill from "@/domain/models/Bill";
import Payment from "@/domain/models/Payment";
import RoomCharge from "@/domain/models/RoomCharge";
import RoomReservation from "@/domain/dtos/RoomReservation";
import RoomRate from "@/domain/models/RoomRate";
import RoomType from "@/domain/models/RoomType";

export default interface IReservationRepository extends IRepository<Reservation>{

    billDelete(reservationId: string, billId: string): Promise<void>;
    billsGetAll(reservationId:string) : Promise<Bill[]>;
    billsGetPaids(reservationId:string) : Promise<Bill[]>;
    billsGetUnpaids(reservationId:string) : Promise<Bill[]>;
    billsSave(reservationId:string, bills:Bill[]) : Promise<void>;
    paymentDelete(reservationId: string, paymentId: string): Promise<void>;
    paymentsGetAll(reservationId:string) : Promise<Payment[]>;
    paymentsSave(reservationId:string, payments:Payment[]) : Promise<void>;
    reservationCancel(id: string) : Promise<void>;
    reservationCheckIn(id: string) : Promise<void>;
    reservationCheckInList(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationCheckOut(id: string) : Promise<void>;
    reservationCheckOutList(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationCreate(reservation: Reservation) : Promise<Reservation>;
    reservationFindById(id: string): Promise<Reservation|undefined>;
    reservationFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationMoveRoom(id:string,roomNo:string):Promise<void>;
    reservationUpdate(id:string, reservation: Reservation) : Promise<Reservation>;
    roomAndReservationList(searchParams:SearchParam[]) : Promise<Room[]>;
    roomChargesGetAll(reservationId:string) : Promise<RoomCharge[]>;
    roomChargesSave(reservationId:string, roomCharges:RoomCharge[]):Promise<boolean>;
    roomRateGetAll(location:string):Promise<RoomRate[]>;
    roomReservationGetAllById(reservationId:string):Promise<RoomReservation[]>;
    roomScheduleList(searchParams:SearchParam[]) : Promise<Room[]>;
    roomTypeGetAll(location:string):Promise<RoomType[]>;
    updateDropOffInfo(id:string, carNo:string, driver:string) : Promise<void>;
    updatePickUpInfo(id:string, carNo:string, driver:string) : Promise<void>;
    
}