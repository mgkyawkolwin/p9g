import { and, eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import "reflect-metadata";

import { RoomChargeEntity, roomChargeTable } from "@/data/orm/drizzle/mysql/schema";
import { Repository } from "./Repository";

import { TYPES } from "@/lib/types";
import { type IDatabase } from "@/data/db/IDatabase";
import IRoomChargeRepository from "../contracts/IRoomChargeRepository";
import RoomCharge from "@/domain/models/RoomCharge";


@injectable()
export default class RoomChargeRepository extends Repository<RoomCharge, typeof roomChargeTable> implements IRoomChargeRepository {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, roomChargeTable);
    }


    async deleteAllByReservationId(reservationId: string): Promise<void> {
        await this.dbClient.db.delete(this.table)
            .where(
                and(
                    eq(this.table.reservationId, reservationId)
                )
            );
    }

}