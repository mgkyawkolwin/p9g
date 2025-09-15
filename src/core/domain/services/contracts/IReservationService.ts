import { PagerParams, SearchParam } from "@/core/lib/types";
import Reservation from "@/core/domain/models/Reservation";
import Room from "@/core/domain/models/Room";
import Bill from "@/core/domain/models/Bill";
import Invoice from "@/core/domain/dtos/Invoice";
import Payment from "@/core/domain/models/Payment";
import RoomCharge from "@/core/domain/models/RoomCharge";
import RoomReservation from "@/core/domain/models/RoomReservation";
import SessionUser from "../../dtos/SessionUser";

export default interface IReservationService {
    billDeleteById(reservationId: string, billId: string, sessionUser: SessionUser): Promise<void>;
    billGetListById(reservationId: string, sessionUser: SessionUser): Promise<[Bill[], number]>;
    billUpdateList(reservationId: string, bills: Bill[], sessionUser: SessionUser): Promise<void>;
    invoiceGet(reservationId: string, sessionUser: SessionUser): Promise<Invoice>;
    // patch(id:string, operation : string, sessionUser: SessionUser): Promise<void>;
    paymentDeleteById(reservationId: string, paymentId: string, sessionUser: SessionUser): Promise<void>;
    paymentGetListById(reservationId: string, sessionUser: SessionUser): Promise<[Payment[], number]>;
    paymentUpdateList(reservationId: string, payments: Payment[], sessionUser: SessionUser): Promise<void>;
    paymentsView(reservationId: string, sessionUser: SessionUser): Promise<Invoice>;
    reservationCancel(id: string, sessionUser: SessionUser): Promise<void>;
    reservationCheckIn(id: string, sessionUser: SessionUser): Promise<void>;
    reservationCheckOut(id: string, sessionUser: SessionUser): Promise<void>;
    reservationCreate(reservation: Reservation, sessionUser: SessionUser): Promise<Reservation>;
    reservationGetById(id: string, sessionUser: SessionUser): Promise<Reservation | null>;
    // reservationGetListCheckIn(searchParams: SearchParam[], pagerParams : PagerParams, sessionUser: SessionUser): Promise<[Reservation[], number]>;
    // reservationGetListCheckOut(searchParams: SearchParam[], pagerParams : PagerParams, sessionUser: SessionUser): Promise<[Reservation[], number]>;
    reservationGetList(searchParams: Record<string, any>, pagerParams: PagerParams, list: string, sessionUser: SessionUser): Promise<[Reservation[], number]>;
    reservationMoveRoom(id: string, roomNo: string, sessionUser: SessionUser): Promise<void>;
    // reservationGetListTop(pagerParams : PagerParams, sessionUser: SessionUser): Promise<[Reservation[], number]>;
    reservationUpdate(id: string, reservation: Reservation, sessionUser: SessionUser): Promise<void>;
    roomChargeGetListById(reservationId: string, sessionUser: SessionUser): Promise<RoomCharge[]>;
    roomReservationGetList(searchParam: Record<string, any>, sessionUser: SessionUser): Promise<[Room[], number]>;
    roomReservationGetListById(reservationId: string, includeChildren: boolean, sessionUser: SessionUser): Promise<[RoomReservation[], number]>;
    roomReservationUpdateList(reservationId: string, roomReservations: RoomReservation[], sessionUser: SessionUser): Promise<void>;
    roomScheduleGetList(searchParam: Record<string, any>, sessionUser: SessionUser): Promise<[Room[], number]>;
    reservationUpdateDropOffInfo(id: string, carNo: string, driver: string, sessionUser: SessionUser): Promise<void>;
    reservationUpdatePickUpInfo(id: string, carNo: string, driver: string, sessionUser: SessionUser): Promise<void>;
}