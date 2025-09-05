import IRepository from "./IRepository";
import Room from "@/domain/models/Room";

export default interface IRoomRepository extends IRepository<Room>{

    findByRoomNoAndLocation(roomNo: string, location:string): Promise<Room | null>;
}