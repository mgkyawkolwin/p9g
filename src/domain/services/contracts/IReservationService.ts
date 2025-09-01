import { PagerParams, SearchParam } from "@/lib/types";
import Reservation from "@/domain/models/Reservation";
import Room from "@/domain/models/Room";
import Bill from "@/domain/models/Bill";
import Invoice from "@/domain/dtos/Invoice";
import Payment from "@/domain/models/Payment";
import RoomCharge from "@/domain/models/RoomCharge";
import RoomReservation from "@/domain/models/RoomReservation";

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