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
import { TransactionType } from "@/core/data/db/mysql/MySqlDatabase";
import SessionUser from "@/core/domain/dtos/SessionUser";

export default interface IReservationRepository extends IRepository<Reservation>{

    // billDelete(reservationId:string, billId:string, sessionUser: SessionUser) : Promise<void>;
    // billGetListById(reservationId:string, sessionUser: SessionUser) : Promise<[Bill[], number]>;
    // billGetListPaid(reservationId:string, sessionUser: SessionUser) : Promise<[Bill[], number]>;
    // billGetListUnpaid(reservationId:string, sessionUser: SessionUser) : Promise<[Bill[], number]>;
    // billUpdateList(reservationId:string, bills:Bill[], sessionUser: SessionUser) : Promise<void>;
    // paymentDelete(reservationId:string, paymentId:string, sessionUser: SessionUser): Promise<void>;
    // paymentGetListById(reservationId:string, sessionUser: SessionUser) : Promise<[Payment[], number]>;
    // paymentUpdateList(reservationId:string, payments:Payment[], sessionUser: SessionUser) : Promise<void>;
    // reservationCancel(id:string, sessionUser: SessionUser) : Promise<void>;
    // reservationCheckIn(id:string, sessionUser: SessionUser) : Promise<void>;
    // reservationCheckOut(id:string, sessionUser: SessionUser) : Promise<void>;
    // reservationCreate(reservation:Reservation, sessionUser: SessionUser) : Promise<Reservation>;
    // reservationCreate(reservation:Reservation, transaction:TransactionType, sessionUser: SessionUser) : Promise<Reservation>;
    reservationGetById(id:string): Promise<Reservation|null>;
    reservationGetList(searchParams:Record<string, any>, pagerParams:PagerParams, list?: string): Promise<[Reservation[], number]>;
    // reservationMoveRoom(id:string, roomNo:string, sessionUser: SessionUser):Promise<void>;
    // reservationMoveRoom(id:string, roomNo:string, transaction:TransactionType, sessionUser: SessionUser):Promise<void>;
    // reservationUpdate(id:string, reservation:Reservation, sessionUser: SessionUser) : Promise<Reservation>;
    // reservationUpdate(id:string, reservation:Reservation, transaction:TransactionType, sessionUser: SessionUser) : Promise<Reservation>;
    roomAndReservationGetList(searchParams:Record<string, any>, sessionUser: SessionUser) : Promise<[Room[], number]>;
    roomChargeGetListById(reservationId:string, sessionUser: SessionUser) : Promise<RoomCharge[]>;
    // roomChargeUpdateList(reservationId:string, roomCharges:RoomCharge[], sessionUser: SessionUser):Promise<void>;
    // roomChargeUpdateList(reservationId:string, roomCharges:RoomCharge[], transaction:TransactionType, sessionUser: SessionUser):Promise<void>;
    // roomRateGetAll(location:string, sessionUser: SessionUser):Promise<[RoomRate[], number]>;
    roomReservationGetListById(reservationId:string, includeChildren:boolean, sessionUser: SessionUser):Promise<[RoomReservation[], number]>;
    roomReservationUpdateList(reservationId:string, roomReservations:RoomReservation[], sessionUser: SessionUser):Promise<void>;
    roomReservationUpdateList(reservationId:string, roomReservations:RoomReservation[], sessionUser: SessionUser, transaction:TransactionType):Promise<void>;
    roomScheduleGetList(searchParams:Record<string, any>, sessionUser: SessionUser) : Promise<[Room[], number]>;
    // roomTypeGetAll(location:string, sessionUser: SessionUser):Promise<[RoomType[], number]>;
    // reservationUpdateDropOffInfo(id:string, carNo:string, driver:string, sessionUser: SessionUser) : Promise<void>;
    // reservationUpdateDropOffInfo(id:string, carNo:string, driver:string, transaction:TransactionType, sessionUser: SessionUser) : Promise<void>;
    // reservationUpdatePickUpInfo(id:string, carNo:string, driver:string, sessionUser: SessionUser) : Promise<void>;
    // reservationUpdatePickUpInfo(id:string, carNo:string, driver:string, transaction:TransactionType, sessionUser: SessionUser) : Promise<void>;
}