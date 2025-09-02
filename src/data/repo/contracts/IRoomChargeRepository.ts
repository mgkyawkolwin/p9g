import IRepository from "./IRepository";
import RoomCharge from "@/domain/models/RoomCharge";

export default interface IRoomChargeRepository extends IRepository<RoomCharge>{

    deleteAllByReservationId(reservationId: string): Promise<void>;

}