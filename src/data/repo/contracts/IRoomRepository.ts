import IRepository from "./IRepository";
import Room from "@/domain/models/Room";

export default interface IRoomRepository extends IRepository<Room>{

    findByRoomNo(roomNo: string): Promise<Room | null>;
}