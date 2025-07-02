import { Reservation, reservation } from "@/data/orm/drizzle/mysql/schema";
import IReservationRepository from "../IReservationRepository";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/data/db/IDatabase";
import { TYPES } from "@/lib/types";
import { Repository } from "./Repository";

@injectable()
export default class ReservationRepository extends Repository<Reservation, typeof reservation> implements IReservationRepository {
    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, reservation);
    }
}