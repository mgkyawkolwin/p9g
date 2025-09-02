import IRepository from "./IRepository";
import { RoomReservationEntity } from "../../orm/drizzle/mysql/schema";

export default interface IRoomReservationRepository extends IRepository<RoomReservationEntity>{

    deleteAllByReservationId(reservationId: string): Promise<void>;

}