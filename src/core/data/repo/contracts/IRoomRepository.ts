import IRepository from "./IRepository";
import Room from "@/core/domain/models/Room";

export default interface IRoomRepository extends IRepository<Room>{

    findByRoomNoAndLocation(roomNo: string, location:string): Promise<Room | null>;
}