import { config, ReservationEntity, reservation } from "@/data/orm/drizzle/mysql/schema";
import IReservationRepository from "../IReservationRepository";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/data/db/IDatabase";
import { PagerParams, SearchParam, TYPES } from "@/lib/types";
import { Repository } from "./Repository";
import c from "@/lib/core/logger/ConsoleLogger";
import { SQL, and,  count, asc, desc, eq, gt, gte, inArray, lt, lte, or, like, Table, Column, getTableColumns, getTableName } from "drizzle-orm";
import { MySqlColumn } from "drizzle-orm/mysql-core";
import Reservation from "@/domain/models/Reservation";


@injectable()
export default class ReservationRepository extends Repository<ReservationEntity, typeof reservation> implements IReservationRepository {
    
    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, reservation);
    }


    async createReservation(reservation: Reservation) : Promise<Reservation>{
        c.i("ReservationRepository > createReservation");
        //cast domain model to entity
        const reservationEntity : ReservationEntity = reservation as unknown as ReservationEntity;
        //retrieve and assign reservationTypeId
        const [reservationStatus] = await this.dbClient.db.select().from(config).where(
            and(
                eq(config.group, "RESERVATION_STATUS"),
                eq(config.value, reservation.reservationStatus)
            )
        ).limit(1);

        if(reservationStatus)
            reservationEntity.reservationStatusId = reservationStatus.id;
        c.i("Prepared entity for insert.");
        c.d(reservationEntity);
        const newEntity = await this.create(reservationEntity);
        c.i("Insert return new entity.");
        c.d(newEntity);
        reservation.id = newEntity.id;
        return reservation;
    }


    async findReservations(searchParams: SearchParam[], pagerParams: PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('Repository > findReservations');

        // Calculate offset
        const offset = (pagerParams.pageIndex - 1) * pagerParams.pageSize;
        const orderByColumn = Object.entries(getTableColumns(reservation)).find(([key]) => key === pagerParams.orderBy)?.[1];

        // Build result query
        let countQuery = this.dbClient.db
        .select({count: count(this.table.id)})
        .from(this.table)

        // Build result query
        let dataQuery = this.dbClient.db.query[getTableName(this.table)].findMany({
            limit: pagerParams.pageSize,
            offset,
            with: {
                status: true
            }
          });

        if (orderByColumn) {
            // dataQuery = dataQuery.orderBy(
            //     pagerParams.orderDirection === 'desc'
            //         ? desc(orderByColumn)
            //         : asc(orderByColumn)
            // );
            dataQuery.orderBy = pagerParams.orderDirection === 'desc'
            ? desc(orderByColumn)
            : asc(orderByColumn);
        }

        //Add search condition if parameters prov.ided
        if (searchParams && searchParams.length > 0) {
        c.i('Where applied.');
        searchParams.forEach((searchParam : SearchParam) => {
            const searchColumn = Object.entries(getTableColumns(this.table)).find(([key]) => key === searchParam.searchColumn)?.[1];
            const condition = like(searchColumn!, `%${searchParam.searchValue}%`);
            countQuery = countQuery.where(condition);
            dataQuery = dataQuery.where(condition);
        });
        }

        const [countResult, dataResult] = await Promise.all([
        countQuery.execute(),
        dataQuery.execute()
        ]);

        //calculate number of pages
        const pages = Math.ceil(countResult[0].count / pagerParams.pageSize);
        c.d(countResult[0]);

        // Execute query
        return [dataResult as Reservation[], {...pagerParams, pages: pages}];
    }


    async updateReservation(id:string, reservation: Reservation) : Promise<Reservation>{
        c.i("ReservationRepository > updateReservation");
        c.d(reservation);
        //cast domain model to entity
        c.i("Casting to entity type.");
        const reservationEntity : ReservationEntity = reservation as unknown as ReservationEntity;
        c.d(reservationEntity);
        //retrieve and assign reservationTypeId
        const [reservationStatus] = await this.dbClient.db.select().from(config).where(
            and(
                eq(config.group, "RESERVATION_STATUS"),
                eq(config.value, reservation.reservationStatus)
            )
        ).limit(1);

        if(reservationStatus)
            reservationEntity.reservationStatusId = reservationStatus.id;

        c.i("Prepared entity for update.");
        c.d(reservationEntity);
        const updatedEntity = await this.update(id, reservationEntity);
        c.i("Update return updated entity.");
        c.d(updatedEntity);
        return reservation;
    }
}