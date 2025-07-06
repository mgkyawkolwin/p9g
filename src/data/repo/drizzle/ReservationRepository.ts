import { configTable, ReservationEntity, reservationTable, reservationCustomerTable, prepaidTable, promotionTable, customerTable } from "@/data/orm/drizzle/mysql/schema";
import IReservationRepository from "../IReservationRepository";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/data/db/IDatabase";
import { PagerParams, SearchParam, TYPES } from "@/lib/types";
import { Repository } from "./Repository";
import c from "@/lib/core/logger/ConsoleLogger";
import { SQL, and,  count, asc, desc, eq, gt, gte, inArray, lt, lte, or, like, Table, Column, getTableColumns, getTableName, AnyColumn } from "drizzle-orm";
import Reservation from "@/domain/models/Reservation";
import { TransactionType } from "@/data/orm/drizzle/mysql/db";
import { mapper } from "@/lib/automapper";
import { customer } from "@/drizzle/migrations/schema";
import { alias } from "drizzle-orm/mysql-core";


@injectable()
export default class ReservationRepository extends Repository<Reservation, typeof reservationTable> implements IReservationRepository {
    
    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, reservationTable);
    }


    async createReservation(reservation: Reservation) : Promise<Reservation>{
        c.i("ReservationRepository > createReservation");
        c.d(reservation);

        //cast domain model to entity
        //const reservationEntity : ReservationEntity = reservation as unknown as ReservationEntity;
        //retrieve reservation type
        //retrieve and assign prepaidPackageId
        const [prepaidPackage] = await this.dbClient.db.select().from(prepaidTable).where(
            eq(prepaidTable.value, reservation.prepaidPackage)
        ).limit(1);
        if(prepaidPackage)
            reservation.prepaidPackageId = prepaidPackage.id;
        //retrieve and assign promotionPackageId
        const [promotionPackage] = await this.dbClient.db.select().from(promotionTable).where(
            eq(promotionTable.value, reservation.promotionPackage)
        ).limit(1);
        if(promotionPackage)
            reservation.promotionPackageId = promotionPackage.id;
        //retrieve and assign reservationTypeId
        const [reservationType] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RESERVATION_TYPE"),
                eq(configTable.value, reservation.reservationType)
            )
        ).limit(1);
        if(reservationType)
            reservation.reservationTypeId = reservationType.id;
        //retrieve and assign reservationStatusId
        const [reservationStatus] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RESERVATION_STATUS"),
                eq(configTable.value, reservation.reservationStatus)
            )
        ).limit(1);
        if(reservationStatus)
            reservation.reservationStatusId = reservationStatus.id;
        //retrieve and assign reservationTypeId
        const [pickUpType] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RIDE_TYPE"),
                eq(configTable.value, reservation.pickUpType)
            )
        ).limit(1);
        if(pickUpType)
            reservation.pickUpTypeId = pickUpType.id;
        //retrieve and assign reservationTypeId
        const [dropOffType] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RIDE_TYPE"),
                eq(configTable.value, reservation.dropOffType)
            )
        ).limit(1);
        if(dropOffType)
            reservation.dropOffTypeId = dropOffType.id;


        c.i("Prepared entity for insert.");
        c.d(reservation);

        // Use transaction
        return await this.dbClient.db.transaction(async (tx : TransactionType) => {
            c.i('Starting transaction.');
            c.d(reservation);

            // Use the transaction for create operation
            const [createdId] = await tx.insert(reservationTable).values(reservation).$returningId();
            c.i("Insert return new entity.");
            c.d(createdId);
            reservation.id = createdId.id;

            //insert reservation-customer
            if (reservation.customers && reservation.customers.length > 0) {
                c.i('Customers exist. Prepare to insert.');
                const newReservationCustomers = reservation.customers.map((c) => {
                    return {
                        reservationId: createdId.id, 
                        customerId: c.id, 
                        createdBy: "xxx", 
                        updatedBy: 'xxx'
                    };
                });
                c.d(newReservationCustomers?.length);
                //insert using transaction
                await tx.insert(reservationCustomerTable).values(newReservationCustomers);
            }

            return reservation;
        });
    }


    async findReservations(searchParams: SearchParam[], pagerParams: PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('Repository > findReservations');
        let reservationsQuery = this.dbClient.db.query.reservationTable.findMany({
            with: {
              reservationStatus: true,
              reservationType: true,
              customers: {
                with: {
                  customer: true // Include full customer data
                }
              },
              prepaidPackage: true,
              promotionPackage: true
            },
            limit: 10,
            orderBy: desc(reservationTable.createdAtUTC)
          });
        c.d(reservationsQuery.toSQL());
        const reservations = await reservationsQuery;
        let r = reservations.map((r:any) => (
            {
                ...r,
                prepaidPackage: r.prepaidPackage?.value,
                prepaidPackageText: r.prepaidPackage?.text, 
                promotionPackage: r.promotionPackage?.value,
                promotionPackageText: r.promotionPackage?.text,
                reservationStatus: r.reservationStatus.value,
                reservationStatusText: r.reservationStatus.text, 
                reservationType: r.reservationType.value,
                reservationTypeText: r.reservationType.text, 
                customers: r.customers?.map((c:any) => (c.customer))
            }
        )
        );
        
        return [r, pagerParams];
    }


    async findReservationsSQLStyle(searchParams: SearchParam[], pagerParams: PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('Repository > findReservations');
        const reservationTypeAlias = alias(configTable, 'reservation_type');
        const reservationStatusAlias = alias(configTable, 'reservation_status');

        let reservationsQuery = this.dbClient.db.select(
            {   
                reservation: {
                    ...reservationTable, 
                reservationType: reservationTypeAlias.value, 
                reservationTypeText: reservationTypeAlias.text, 
                reservationStatus: reservationStatusAlias.value, 
                reservationStatusText: reservationStatusAlias.text,
                }, 
                customers: customerTable
            }
        )
        .from(reservationTable)
        .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
        .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
        .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
        .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customer.id));

        reservationsQuery = this.applyConditionAndPaging(reservationsQuery, searchParams, pagerParams);
        const reservations = await reservationsQuery;
        return [reservations, pagerParams];
    }


    async updateReservation(id:string, reservation: Reservation) : Promise<Reservation>{
        c.i("ReservationRepository > updateReservation");
        c.d(reservation);
        //retrieve and assign reservationTypeId
        const [reservationStatus] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RESERVATION_STATUS"),
                eq(configTable.value, reservation.reservationStatus)
            )
        ).limit(1);

        if(reservationStatus)
            reservation.reservationStatusId = reservationStatus.id;

        c.i("Prepared entity for update.");
        c.d(reservation);
        const updatedEntity = await this.update(id, reservation);
        c.i("Update return updated entity.");
        c.d(updatedEntity);
        return reservation;
    }
}