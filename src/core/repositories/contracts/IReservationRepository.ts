import { PagerParams, SearchFormFields, SearchParam } from "@/core/types";
import IRepository from "@/lib/repositories/IRepository";
import Reservation from "@/core/models/domain/Reservation";
import Room from "@/core/models/domain/Room";
import RoomReservation from "@/core/models/domain/RoomReservation";
import { TransactionType } from "@/core/db/mysql/MySqlDatabase";
import SessionUser from "@/core/models/dto/SessionUser";
import RoomReservationDto from "@/core/models/dto/RoomReservationDto";
import RoomAndPax from "@/core/models/dto/RoomAndPax";

export default interface IReservationRepository extends IRepository<Reservation> {

    getRoomsAndPax(drawDate: Date, sessionUser: SessionUser): Promise<RoomAndPax[]>;
    reservationGetById(id: string): Promise<Reservation | null>;
    reservationGetList(searchFormFields: SearchFormFields, pagerParams: PagerParams, list: string, sessionUser: SessionUser): Promise<[Reservation[], number]>;
    roomAndReservationGetList(searchFormFields: SearchFormFields, sessionUser: SessionUser): Promise<RoomReservationDto[]>;
    roomReservationGetListById(reservationId: string, includeChildren: boolean, sessionUser: SessionUser): Promise<[RoomReservation[], number]>;
    roomReservationUpdateList(reservationId: string, roomReservations: RoomReservation[], sessionUser: SessionUser): Promise<void>;
    roomReservationUpdateList(reservationId: string, roomReservations: RoomReservation[], sessionUser: SessionUser, transaction: TransactionType): Promise<void>;
    roomScheduleGetList(searchFormFields: SearchFormFields, sessionUser: SessionUser): Promise<[Room[], number]>;

}