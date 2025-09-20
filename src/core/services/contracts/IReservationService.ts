import { PagerParams, SearchParam } from "@/core/types";
import Reservation from "@/core/models/domain/Reservation";
import Room from "@/core/models/domain/Room";
import Bill from "@/core/models/domain/Bill";
import Invoice from "@/core/models/dto/Invoice";
import Payment from "@/core/models/domain/Payment";
import RoomCharge from "@/core/models/domain/RoomCharge";
import RoomReservation from "@/core/models/domain/RoomReservation";
import SessionUser from "../../models/dto/SessionUser";
import RoomReservationDto from "../../models/dto/RoomReservationDto";

export default interface IReservationService {
    billDeleteById(reservationId: string, billId: string, sessionUser: SessionUser): Promise<void>;
    billGetListById(reservationId: string, sessionUser: SessionUser): Promise<[Bill[], number]>;
    billUpdateList(reservationId: string, bills: Bill[], sessionUser: SessionUser): Promise<void>;
    invoiceGet(reservationId: string, sessionUser: SessionUser): Promise<Invoice>;
    paymentDeleteById(reservationId: string, paymentId: string, sessionUser: SessionUser): Promise<void>;
    paymentGetListById(reservationId: string, sessionUser: SessionUser): Promise<[Payment[], number]>;
    paymentUpdateList(reservationId: string, payments: Payment[], sessionUser: SessionUser): Promise<void>;
    paymentsView(reservationId: string, sessionUser: SessionUser): Promise<Invoice>;
    reservationCancel(id: string, sessionUser: SessionUser): Promise<void>;
    reservationCheckIn(id: string, sessionUser: SessionUser): Promise<void>;
    reservationCheckOut(id: string, sessionUser: SessionUser): Promise<void>;
    reservationCreate(reservation: Reservation, sessionUser: SessionUser): Promise<Reservation>;
    reservationGetById(id: string, sessionUser: SessionUser): Promise<Reservation | null>;
    reservationGetList(searchParams: Record<string, any>, pagerParams: PagerParams, list: string, sessionUser: SessionUser): Promise<[Reservation[], number]>;
    reservationMoveRoom(id: string, roomNo: string, sessionUser: SessionUser): Promise<void>;
    reservationUpdate(id: string, reservation: Reservation, sessionUser: SessionUser): Promise<void>;
    roomChargeGetListById(reservationId: string, sessionUser: SessionUser): Promise<RoomCharge[]>;
    roomReservationGetList(searchParam: Record<string, any>, sessionUser: SessionUser): Promise<RoomReservationDto[]>;
    roomReservationGetListById(reservationId: string, includeChildren: boolean, sessionUser: SessionUser): Promise<[RoomReservation[], number]>;
    roomReservationUpdateList(reservationId: string, roomReservations: RoomReservation[], sessionUser: SessionUser): Promise<void>;
    roomScheduleGetList(searchParam: Record<string, any>, sessionUser: SessionUser): Promise<[Room[], number]>;
    reservationUpdateDropOffInfo(id: string, carNo: string, driver: string, sessionUser: SessionUser): Promise<void>;
    reservationUpdatePickUpInfo(id: string, carNo: string, driver: string, sessionUser: SessionUser): Promise<void>;
}