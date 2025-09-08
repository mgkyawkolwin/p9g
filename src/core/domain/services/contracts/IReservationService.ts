import { PagerParams, SearchParam } from "@/core/lib/types";
import Reservation from "@/core/domain/models/Reservation";
import Room from "@/core/domain/models/Room";
import Bill from "@/core/domain/models/Bill";
import Invoice from "@/core/domain/dtos/Invoice";
import Payment from "@/core/domain/models/Payment";
import RoomCharge from "@/core/domain/models/RoomCharge";
import RoomReservation from "@/core/domain/models/RoomReservation";

export default interface IReservationService {
    billDeleteById(reservationId: string, billId: string, sessionUser: SessionUser): Promise<void>;
    billGetListById(reservationId:string, sessionUser: SessionUser):Promise<Bill[]>;
    billUpdateList(reservationId:string, bills:Bill[], sessionUser: SessionUser) : Promise<void>;
    billsView(reservationId:string, sessionUser: SessionUser):Promise<Invoice>;
    patch(id:string, operation : string, sessionUser: SessionUser): Promise<void>;
    paymentDeleteById(reservationId: string, paymentId: string, sessionUser: SessionUser): Promise<void>;
    paymentGetListById(reservationId:string, sessionUser: SessionUser):Promise<Payment[]>;
    paymentUpdateList(reservationId:string, payments:Payment[], sessionUser: SessionUser) : Promise<void>;
    paymentsView(reservationId:string, sessionUser: SessionUser):Promise<Invoice>;
    reservationCancel(id:string, sessionUser: SessionUser):Promise<void>;
    reservationCheckIn(id:string, sessionUser: SessionUser):Promise<void>;
    reservationCheckOut(id:string, sessionUser: SessionUser):Promise<void>;
    reservationCreate(reservation : Reservation, sessionUser: SessionUser): Promise<Reservation> ;
    reservationGetById(id:string, sessionUser: SessionUser): Promise<Reservation|undefined>;
    reservationGetListCheckIn(searchParams: SearchParam[], pagerParams : PagerParams, sessionUser: SessionUser): Promise<[Reservation[], PagerParams]>;
    reservationGetListCheckOut(searchParams: SearchParam[], pagerParams : PagerParams, sessionUser: SessionUser): Promise<[Reservation[], PagerParams]>;
    reservationGetList(searchParams:SearchParam[], pagerParams:PagerParams, list:string, sessionUser: SessionUser): Promise<[Reservation[], PagerParams]>;
    reservationMoveRoom(id:string, roomNo:string, sessionUser: SessionUser): Promise<void>;
    reservationGetListTop(pagerParams : PagerParams, sessionUser: SessionUser): Promise<[Reservation[], PagerParams]>;
    reservationUpdate(id: string, reservation: Reservation, sessionUser: SessionUser) : Promise<Reservation>;
    roomChargeGetListById(reservationId:string, sessionUser: SessionUser) : Promise<RoomCharge[]>;
    roomReservationGetList(searchParam:SearchParam[], sessionUser: SessionUser) : Promise<Room[]>;
    roomReservationGetListById(reservationId:string,includeChildren:boolean, sessionUser: SessionUser) : Promise<RoomReservation[]>;
    roomReservationUpdateList(reservationId:string, roomReservations:RoomReservation[], sessionUser: SessionUser) : Promise<boolean>;
    roomScheduleGetList(searchParam:SearchParam[], sessionUser: SessionUser) : Promise<Room[]>;
    reservationUpdateDropOffInfo(id:string, carNo:string, driver:string, sessionUser: SessionUser) : Promise<void>;
    reservationUpdatePickUpInfo(id:string, carNo:string, driver:string, sessionUser: SessionUser) : Promise<void>;
}