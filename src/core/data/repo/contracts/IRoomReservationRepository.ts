import IRepository from "./IRepository";
import { TransactionType } from "../../orm/drizzle/mysql/db";
import RoomReservation from "@/core/domain/models/RoomReservation";

export default interface IRoomReservationRepository extends IRepository<RoomReservation>{

    create(roomReservation:RoomReservation, transaction?:TransactionType) : Promise<RoomReservation>;
    deleteAllByReservationId(reservationId: string): Promise<void>;
    deleteAllByReservationId(reservationId: string, transaction?:TransactionType): Promise<void>;
    getAllByReservationId(reservationId: string): Promise<RoomReservation[]>;
}