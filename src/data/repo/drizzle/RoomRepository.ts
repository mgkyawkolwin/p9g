import { and, eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import "reflect-metadata";

import { RoomEntity, roomTable, roomTypeTable } from "@/data/orm/drizzle/mysql/schema";
import { Repository } from "./Repository";

import { TYPES } from "@/lib/types";
import { type IDatabase } from "@/data/db/IDatabase";
import IRoomRepository from "../contracts/IRoomRepository";
import Room from "@/domain/models/Room";


@injectable()
export default class RoomRepository extends Repository<Room, typeof roomTable> implements IRoomRepository {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, roomTable);
    }


    async findByRoomNo(roomNo: string): Promise<Room | null> {
        const result = await this.dbClient.db.select(
            { ...roomTable, roomType: roomTypeTable.roomType, roomTypeId: roomTypeTable.id }
        )
            .from(this.table)
            .innerJoin(roomTypeTable, eq(this.table.roomTypeId, roomTypeTable.id))
            .where(
                and(
                    eq(this.table.roomNo, roomNo)
                )
            )
            .limit(1) as unknown as Room[];
        if (result && result.length > 0) {
            return result[0];
        }
        return null;
    }

}