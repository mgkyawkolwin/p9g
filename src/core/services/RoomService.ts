import { inject, injectable } from "inversify";
import { TYPES } from "@/core/types";
import type IRepository from "@/lib/repositories/IRepository";
import { and, asc, eq, gte } from "@/lib/transformers/types";
import SessionUser from "../models/dto/SessionUser";
import c from "@/lib/loggers/console/ConsoleLogger";
import type { IDatabaseClient } from "@/lib/db/IDatabase";
import Room from "../models/domain/Room";
import IRoomService from "./contracts/IRoomService";

@injectable()
export default class RoomService implements IRoomService {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>,
        @inject(TYPES.IRoomRepository) private roomRepository: IRepository<Room>) {

    }


    async getRooms(sessionUser: SessionUser): Promise<Room[]> {
        c.fs("RoomService > getRooms");
        const [rooms, count] = await this.roomRepository.findMany(eq("location", sessionUser.location));
        return rooms;
    }


}