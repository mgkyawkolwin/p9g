// import { and, eq } from "drizzle-orm";
// import { inject, injectable } from "inversify";
// import "reflect-metadata";
// import { roomChargeTable } from "@/core/data/orm/drizzle/mysql/schema";
// import { Repository } from "./Repository";
// import { TYPES } from "@/core/lib/types";
// import { type IDatabaseClient } from "@/core/data/db/IDatabase";
// import IRoomChargeRepository from "../contracts/IRoomChargeRepository";
// import RoomCharge from "@/core/domain/models/RoomCharge";
// import c from "@/core/logger/console/ConsoleLogger";
// import { auth } from "@/app/auth";
// import { CustomError } from "@/core/lib/errors";


// @injectable()
// export default class RoomChargeRepositoryX extends Repository<RoomCharge, typeof roomChargeTable> implements IRoomChargeRepository {

//     constructor(
//         @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>
//     ) {
//         super(dbClient, roomChargeTable);
//     }


//     async create(roomCharge: RoomCharge, transaction?: TransactionType): Promise<RoomCharge> {
//         c.fs('RoomChargeRepository > create');
        
//         // let query = this.dbClient.db.insert(this.table)
//         //     .values(roomCharge).$returningId();
//         // let result;
//         // if (transaction)
//         //     result = await transaction.execute(query);
//         // else
//         //     result = await query;
//         const result = await super.create(roomCharge, transaction);
//         c.d(result);
//         // if(result)
//         //     roomCharge.id = result[0].id;
//         c.fe('RoomChargeRepository > create');
//         return result as RoomCharge;
//     }


//     async deleteAllByReservationId(reservationId: string, transaction?: TransactionType): Promise<void> {
//         c.fs('RoomChargeRepository > deleteAllByReservationId');
//         // let query = this.dbClient.db.delete(this.table)
//         //     .where(
//         //         and(
//         //             eq(this.table.reservationId, reservationId)
//         //         )
//         //     );
//         // if(transaction)
//         //     await transaction.execute(query);
//         // else
//         //     await query;
//         await super.delete(reservationId, transaction);
//         c.fe('RoomChargeRepository > deleteAllByReservationId');
//     }

// }