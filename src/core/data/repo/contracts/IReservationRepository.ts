import { PagerParams, SearchParam } from "@/core/lib/types";
import IRepository from "./IRepository";
import Reservation from "@/core/domain/models/Reservation";
import Room from "@/core/domain/models/Room";
import Bill from "@/core/domain/models/Bill";
import Payment from "@/core/domain/models/Payment";
import RoomCharge from "@/core/domain/models/RoomCharge";
import RoomReservation from "@/core/domain/models/RoomReservation";
import RoomRate from "@/core/domain/models/RoomRate";
import RoomType from "@/core/domain/models/RoomType";
import { TransactionType } from "../../orm/drizzle/mysql/db";

export default interface IReservationRepository extends IRepository<Reservation>{

    billDelete(reservationId:string, billId:string) : Promise<void>;
    billGetListById(reservationId:string) : Promise<Bill[]>;
    billGetListPaid(reservationId:string) : Promise<Bill[]>;
    billGetListUnpaid(reservationId:string) : Promise<Bill[]>;
    billUpdateList(reservationId:string, bills:Bill[]) : Promise<void>;
    paymentDelete(reservationId:string, paymentId:string): Promise<void>;
    paymentGetListById(reservationId:string) : Promise<Payment[]>;
    paymentUpdateList(reservationId:string, payments:Payment[]) : Promise<void>;
    reservationCancel(id:string) : Promise<void>;
    reservationCheckIn(id:string) : Promise<void>;
    reservationCheckOut(id:string) : Promise<void>;
    reservationCreate(reservation:Reservation) : Promise<Reservation>;
    reservationCreate(reservation:Reservation, transaction:TransactionType) : Promise<Reservation>;
    reservationGetById(id:string): Promise<Reservation|undefined>;
    reservationGetList(searchParams:SearchParam[], pagerParams:PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationMoveRoom(id:string, roomNo:string):Promise<void>;
    reservationMoveRoom(id:string, roomNo:string, transaction:TransactionType):Promise<void>;
    reservationUpdate(id:string, reservation:Reservation) : Promise<Reservation>;
    reservationUpdate(id:string, reservation:Reservation, transaction:TransactionType) : Promise<Reservation>;
    roomAndReservationGetList(searchParams:SearchParam[]) : Promise<Room[]>;
    roomChargeGetListById(reservationId:string) : Promise<RoomCharge[]>;
    roomChargeUpdateList(reservationId:string, roomCharges:RoomCharge[]):Promise<boolean>;
    roomChargeUpdateList(reservationId:string, roomCharges:RoomCharge[], transaction:TransactionType):Promise<boolean>;
    roomRateGetAll(location:string):Promise<RoomRate[]>;
    roomReservationGetListById(reservationId:string, includeChildren:boolean):Promise<RoomReservation[]>;
    roomReservationUpdateList(reservationId:string, roomReservations:RoomReservation[]):Promise<boolean>;
    roomReservationUpdateList(reservationId:string, roomReservations:RoomReservation[], transaction:TransactionType):Promise<boolean>;
    roomScheduleGetList(searchParams:SearchParam[]) : Promise<Room[]>;
    roomTypeGetAll(location:string):Promise<RoomType[]>;
    reservationUpdateDropOffInfo(id:string, carNo:string, driver:string) : Promise<void>;
    reservationUpdateDropOffInfo(id:string, carNo:string, driver:string, transaction:TransactionType) : Promise<void>;
    reservationUpdatePickUpInfo(id:string, carNo:string, driver:string) : Promise<void>;
    reservationUpdatePickUpInfo(id:string, carNo:string, driver:string, transaction:TransactionType) : Promise<void>;
}