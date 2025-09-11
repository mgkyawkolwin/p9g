// import { and, desc, eq, SQL } from "drizzle-orm";
// import { inject, injectable } from "inversify";
// import "reflect-metadata";

// import { roomReservationTable } from "@/core/data/orm/drizzle/mysql/schema";
// import { Repository } from "./Repository";

// import { TYPES } from "@/core/lib/types";
// import { type IDatabaseClient } from "@/core/data/db/IDatabase";
// import IRoomReservationRepository from "../contracts/IRoomReservationRepository";
// import c from "@/core/logger/console/ConsoleLogger";
// import { TransactionType } from "@/core/data/db/mysql/MySqlDatabase";
// import RoomReservation from "@/core/domain/models/RoomReservation";
// import { auth } from "@/app/auth";
// import { CustomError } from "@/core/lib/errors";


// // @injectable()
// // export default class RoomReservationRepositoryX extends Repository<RoomReservation, typeof roomReservationTable> implements IRoomReservationRepository {

// //     constructor(
// //         @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>
// //     ) {
// //         super(dbClient, roomReservationTable);
// //     }


// //     async create(roomReservation:RoomReservation, transaction?:TransactionType): Promise<RoomReservation> {
// //         c.fs('RoomReservationRepository > create');

// //         let query = this.dbClient.db.insert(this.table)
// //             .values(roomReservation).$returningId();
// //         let result;
// //         if(transaction)
// //             result = await transaction.execute(query);
// //         else
// //             result = await query;
// //         c.d(result);
// //         if(result)
// //             roomReservation.id = result[0].id;
// //         c.fe('RoomReservationRepository > create');
// //         return roomReservation;
// //     }

// //     async getAllByReservationId(reservationId: string) : Promise<RoomReservation[]>{
// //         c.fs('RoomReservationRepository > findManyByCondition');
// //         return super.findManyByCondition(eq(this.table.reservationId, reservationId));
// //     }


// //     async getLatestByReservationId(reservationId: string) : Promise<RoomReservation>{
// //         c.fs('RoomReservationRepository > findManyByCondition');
// //         const [result] = await super.findManyByCondition(eq(this.table.reservationId, reservationId), desc(this.table.checkInDate), 1);
// //         return result;
// //     }


// //     async deleteAllByReservationId(reservationId: string, transaction?:TransactionType): Promise<void> {
// //         c.fs('RoomReservationRepository > deleteAllByReservationId');
// //         let query = this.dbClient.db.delete(this.table)
// //             .where(
// //                 and(
// //                     eq(this.table.reservationId, reservationId)
// //                 )
// //             );
// //         if(transaction)
// //             await transaction.execute(query);
// //         else 
// //             await query;
// //         c.fe('RoomReservationRepository > deleteAllByReservationId');
// //     }

// // }