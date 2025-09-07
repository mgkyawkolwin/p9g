import { PagerParams, SearchParam } from "@/core/lib/types";
import Reservation from "@/core/domain/models/Reservation";
import Room from "@/core/domain/models/Room";
import Bill from "@/core/domain/models/Bill";
import Invoice from "@/core/domain/dtos/Invoice";
import Payment from "@/core/domain/models/Payment";
import RoomCharge from "@/core/domain/models/RoomCharge";
import RoomReservation from "@/core/domain/models/RoomReservation";

export default interface IReservationService {
    billDeleteById(reservationId: string, billId: string): Promise<void>;
    billGetListById(reservationId:string):Promise<Bill[]>;
    billUpdateList(reservationId:string, bills:Bill[]) : Promise<void>;
    billsView(reservationId:string):Promise<Invoice>;
    patch(id:string, operation : string): Promise<void>;
    paymentDeleteById(reservationId: string, paymentId: string): Promise<void>;
    paymentGetListById(reservationId:string):Promise<Payment[]>;
    paymentUpdateList(reservationId:string, payments:Payment[]) : Promise<void>;
    paymentsView(reservationId:string):Promise<Invoice>;
    reservationCancel(id:string):Promise<void>;
    reservationCheckIn(id:string):Promise<void>;
    reservationCheckOut(id:string):Promise<void>;
    reservationCreate(reservation : Reservation): Promise<Reservation> ;
    reservationGetById(id:string): Promise<Reservation|undefined>;
    reservationGetListCheckIn(searchParams: SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationGetListCheckOut(searchParams: SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationGetList(searchParams:SearchParam[], pagerParams:PagerParams, list:string): Promise<[Reservation[], PagerParams]>;
    reservationMoveRoom(id:string, roomNo:string): Promise<void>;
    reservationGetListTop(pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationUpdate(id: string, reservation: Reservation) : Promise<Reservation>;
    roomChargeGetListById(reservationId:string) : Promise<RoomCharge[]>;
    roomReservationGetList(searchParam:SearchParam[]) : Promise<Room[]>;
    roomReservationGetListById(reservationId:string,includeChildren:boolean) : Promise<RoomReservation[]>;
    roomReservationUpdateList(reservationId:string, roomReservations:RoomReservation[]) : Promise<boolean>;
    roomScheduleGetList(searchParam:SearchParam[]) : Promise<Room[]>;
    reservationUpdateDropOffInfo(id:string, carNo:string, driver:string) : Promise<void>;
    reservationUpdatePickUpInfo(id:string, carNo:string, driver:string) : Promise<void>;
}