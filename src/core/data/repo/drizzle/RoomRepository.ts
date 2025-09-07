import { and, eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import "reflect-metadata";

import { RoomEntity, roomTable, roomTypeTable } from "@/core/data/orm/drizzle/mysql/schema";
import { Repository } from "./Repository";

import { TYPES } from "@/core/lib/types";
import { type IDatabase } from "@/core/data/db/IDatabase";
import IRoomRepository from "../contracts/IRoomRepository";
import Room from "@/core/domain/models/Room";
import c from "@/core/logger/console/ConsoleLogger";


@injectable()
export default class RoomRepository extends Repository<Room, typeof roomTable> implements IRoomRepository {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, roomTable);
    }


    async findByRoomNoAndLocation(roomNo:string, location:string): Promise<Room | null> {
        c.fs('RoomRepository > findByRoomNoAndLocation');
        const result = await this.dbClient.db.select(
            { ...roomTable, roomType: roomTypeTable.roomType, roomTypeId: roomTypeTable.id }
        )
            .from(this.table)
            .innerJoin(roomTypeTable, eq(this.table.roomTypeId, roomTypeTable.id))
            .where(
                and(
                    eq(this.table.roomNo, roomNo),
                    eq(this.table.location, location)
                )
            )
            .limit(1) as unknown as Room[];
        c.fe('RoomRepository > findByRoomNoAndLocation');
        if (result && result.length > 0) {
            return result[0];
        }

        return null;
    }

}