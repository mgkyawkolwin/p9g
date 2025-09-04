import { and, eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import "reflect-metadata";

import { RoomReservationEntity, roomReservationTable, UserEntity, userTable } from "@/data/orm/drizzle/mysql/schema";
import { Repository } from "./Repository";

import { TYPES } from "@/lib/types";
import { type IDatabase } from "@/data/db/IDatabase";
import IRoomReservationRepository from "../contracts/IRoomReservationRepository";


@injectable()
export default class RoomReservationRepository extends Repository<RoomReservationEntity, typeof roomReservationTable> implements IRoomReservationRepository {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, roomReservationTable);
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