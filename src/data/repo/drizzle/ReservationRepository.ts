import { configTable, ReservationEntity, reservationTable, reservationCustomerTable, prepaidTable, promotionTable, customerTable, ConfigEntity, roomTable, roomReservationTable } from "@/data/orm/drizzle/mysql/schema";
import IReservationRepository from "../IReservationRepository";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/data/db/IDatabase";
import { PagerParams, SearchParam, TYPES } from "@/lib/types";
import { Repository } from "./Repository";
import c from "@/lib/core/logger/ConsoleLogger";
import { SQL, and, count, asc, desc, eq, ne, gt, gte,between, inArray, lt, lte, or, like, Table, Column, getTableColumns, getTableName, AnyColumn, isNull } from "drizzle-orm";
import Reservation from "@/domain/models/Reservation";
import { TransactionType } from "@/data/orm/drizzle/mysql/db";
import { mapper } from "@/lib/automapper";
import { customer } from "@/drizzle/migrations/schema";
import { alias } from "drizzle-orm/mysql-core";
import Reservations from "@/app/(private)/console/admin/reservations/page";
import Room from "@/domain/models/Room";
import { searchSchema } from "@/lib/zodschema";
import RoomReservation from "@/domain/dtos/roomreservation";


@injectable()
export default class ReservationRepository extends Repository<Reservation, typeof reservationTable> implements IReservationRepository {


    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, reservationTable);
    }


    async cancel(id: string) : Promise<void> {
        c.i('ReservationRepository > cancel');
        c.d(id);
        const t = this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RESERVATION_STATUS"),
                eq(configTable.value, "CCL")
            )
        ).limit(1);
        c.d(t.toSQL());
        const [reservationStatus] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RESERVATION_STATUS"),
                eq(configTable.value, "CCL")
            )
        ).limit(1);
        
        c.d(reservationStatus);

        const a = this.dbClient.db.update(reservationTable)
        .set({reservationStatusId: reservationStatus.id})
        .where(eq(reservationTable.id, id));
        c.d(a.toSQL())

        await this.dbClient.db.update(reservationTable)
        .set({reservationStatusId: reservationStatus.id})
        .where(eq(reservationTable.id, id));
        c.i('Return from ReservationRepository > cancel');
    }


    async checkIn(id: string) : Promise<void> {
        c.i('ReservationRepository > checkIn');
        c.d(id);
        const [reservationStatus] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RESERVATION_STATUS"),
                eq(configTable.value, "CIN")
            )
        ).limit(1);
        
        c.d(reservationStatus);

        await this.dbClient.db.update(reservationTable)
        .set({reservationStatusId: reservationStatus.id})
        .where(eq(reservationTable.id, id));
        c.i('Return from ReservationRepository > checkIn');
    }


    async createReservation(reservation: Reservation): Promise<Reservation> {
        c.i("ReservationRepository > createReservation");
        c.d(reservation);

        reservation = await this.prepareReservation(reservation);

        // Use transaction
        return await this.dbClient.db.transaction(async (tx: TransactionType) => {
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

            //insert roomReservation
            if(reservation.roomNo){
                //retrieve room id
                const [room] = await this.dbClient.db.select()
                .from(roomTable)
                .where(eq(roomTable.roomNo, reservation.roomNo)).limit(1);
                if(!room)
                    throw new Error('Roon number is invalid.');
                //insert into roomReservation
                const roomReservation = new RoomReservation();
                roomReservation.roomId = room.id;
                roomReservation.reservationId = reservation.id;
                await tx.insert(roomReservationTable).values(roomReservation);
            }

            return reservation;
        });
    }


    async prepareReservation(reservation: Reservation){
        //retrieve and assign prepaidPackageId
        const [prepaidPackage] = await this.dbClient.db.select().from(prepaidTable).where(
            eq(prepaidTable.value, reservation.prepaidPackage)
        ).limit(1);
        if (prepaidPackage)
            reservation.prepaidPackageId = prepaidPackage.id;
        //retrieve and assign promotionPackageId
        const [promotionPackage] = await this.dbClient.db.select().from(promotionTable).where(
            eq(promotionTable.value, reservation.promotionPackage)
        ).limit(1);
        if (promotionPackage)
            reservation.promotionPackageId = promotionPackage.id;
        //retrieve and assign reservationTypeId
        const [reservationType] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RESERVATION_TYPE"),
                eq(configTable.value, reservation.reservationType)
            )
        ).limit(1);
        if (reservationType)
            reservation.reservationTypeId = reservationType.id;
        //retrieve and assign reservationStatusId
        const [reservationStatus] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RESERVATION_STATUS"),
                eq(configTable.value, reservation.reservationStatus)
            )
        ).limit(1);
        if (reservationStatus)
            reservation.reservationStatusId = reservationStatus.id;
        //retrieve and assign reservationTypeId
        const [pickUpType] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RIDE_TYPE"),
                eq(configTable.value, reservation.pickUpType)
            )
        ).limit(1);
        if (pickUpType)
            reservation.pickUpTypeId = pickUpType.id;
        //retrieve and assign reservationTypeId
        const [dropOffType] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RIDE_TYPE"),
                eq(configTable.value, reservation.dropOffType)
            )
        ).limit(1);
        if (dropOffType)
            reservation.dropOffTypeId = dropOffType.id;


        c.i("Prepared entity for insert/update.");
        c.d(reservation);
        return reservation;
    }


    async reservationFindById(id: string): Promise<Reservation|undefined> {
        c.i('ReservationRepository > reservationFindById');
        c.d(id);
        
        const reservationTypeAlias = alias(configTable, 'reservation_type');
        const reservationStatusAlias = alias(configTable, 'reservation_status');

        let dataQuery = this.dbClient.db.select({ 
            ...reservationTable,
            customer: {...customerTable},
            reservationStatus: reservationStatusAlias.value,
            reservationStatusText: reservationStatusAlias.text,
            reservationType: reservationTypeAlias.value,
            reservationTypeText: reservationTypeAlias.text
         })
        .from(reservationTable)
        .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
        .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
        .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
        .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customer.id))
        .where(eq(reservationTable.id, id));

        const dataqueryresult = await dataQuery;    

        //transform to desired result
        const [reservation] = dataqueryresult?.reduce((acc:Reservation[], current:any) => {
            const {customer, ...reservation} = current;
            let rsvn = acc.find(r => r.id === current.id);
            if (!rsvn) {
                rsvn = reservation;
                rsvn!.customers = [];
                acc.push(rsvn!);
            }
            if(customer)
                rsvn?.customers?.push(customer);
            
            return acc;
          }, [] as Reservation[]);

        c.d(reservation);
        c.i('Returning result from ReservationRepository > reservationFindById');
        return reservation;
    }


    async reservationFindMany(searchParams: SearchParam[], pagerParams: PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('ReservationRepository > reservationFindMany');
        c.d(searchParams);
        c.d(pagerParams);
        //calculate offset
        const offset = pagerParams.pageSize * (pagerParams.pageIndex - 1);

        //const countQuery = {...pocoQuery, extras: {count: this.dbClient.db.$count(pocoQuery)}};
        const reservationTypeAlias = alias(configTable, 'reservation_type');
        const reservationStatusAlias = alias(configTable, 'reservation_status');
        const pickUpAlias = alias(configTable, 'pickUpAlias');
        const dropOffAlias = alias(configTable, 'dropOffAlias');

        let countQuery = this.dbClient.db.select({ count: count() })
            .from(reservationTable)
            .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
            .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
            .leftJoin(pickUpAlias, eq(reservationTable.pickUpTypeId, pickUpAlias.id))
            .leftJoin(dropOffAlias, eq(reservationTable.dropOffTypeId, dropOffAlias.id))
            .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
            .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customer.id));

        let dataQuery = this.dbClient.db.select({ 
            ...reservationTable,
            customer: {...customerTable},
            reservationStatus: reservationStatusAlias.value,
            reservationStatusText: reservationStatusAlias.text,
            reservationType: reservationTypeAlias.value,
            reservationTypeText: reservationTypeAlias.text,
            pickUpType: pickUpAlias.value,
            pickUpTypeText: pickUpAlias.text,
            dropOffType: dropOffAlias.value,
            dropOffTypeText: dropOffAlias.text})
            .from(reservationTable)
            .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
            .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
            .leftJoin(pickUpAlias, eq(reservationTable.pickUpTypeId, pickUpAlias.id))
            .leftJoin(dropOffAlias, eq(reservationTable.dropOffTypeId, dropOffAlias.id))
            .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
            .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customer.id))
            .offset(offset)
            .limit(pagerParams.pageSize);

        if (searchParams && searchParams.length > 0) {
            const conditions = searchParams
                .map((searchParam: SearchParam) => {
                    if (searchParam.searchColumn === 'reservationStatus') {
                        return eq(reservationStatusAlias.value, searchParam.searchValue);
                    }
                    if (searchParam.searchColumn === 'reservationType') {
                        return eq(reservationTypeAlias.value, searchParam.searchValue);
                    }
                    if (searchParam.searchColumn === 'checkInDateUTC') {
                        return eq(reservationTable.checkInDateUTC, new Date('2025-07-08'));
                    }
                    if (searchParam.searchColumn === 'createdFrom') {
                        return gte(reservationTable.createdAtUTC, new Date(searchParam.searchValue));
                    }
                    if (searchParam.searchColumn === 'createdUntil') {
                        let d : Date = new Date(searchParam.searchValue);
                        d.setHours(23,59,59,999);
                        return lte(reservationTable.createdAtUTC, d);
                    }
                    if (searchParam.searchColumn === 'name') {
                        return like(customerTable.name, `%${searchParam.searchValue}%`);
                    }
                    if (searchParam.searchColumn === 'id') {
                        return like(reservationTable.id, `%${searchParam.searchValue}%`);
                    }
                    return undefined;
                })
                .filter((condition): condition is Exclude<typeof condition, undefined> => condition !== undefined);

            if (conditions.length > 0) {
                countQuery.where(and(...conditions));
                dataQuery.where(and(...conditions));
            }
        }

        //order
        dataQuery.orderBy(pagerParams.orderDirection === 'desc' ? desc(reservationTable[pagerParams.orderBy as keyof ReservationEntity]) : asc(reservationTable[pagerParams.orderBy as keyof ReservationEntity]));
        const dataqueryresult = await dataQuery;    

        c.d(dataQuery.toSQL());

        //transform to desired result
        const reservations = dataqueryresult?.reduce((acc:Reservation[], current:any) => {
            const {customer, ...reservation} = current;
            let rsvn = acc.find(r => r.id === current.id);
            if (!rsvn) {
                rsvn = reservation;
                rsvn!.customers = [];
                acc.push(rsvn!);
            }
            if(customer)
                rsvn?.customers?.push(customer);
            
            return acc;
          }, [] as Reservation[]);
          
        const [countResult] = await countQuery;
        c.i('COUNT QUERY RESULT');
        c.d(countResult);

        //update number of pages
        pagerParams = { ...pagerParams, records: countResult.count, pages: Math.ceil((countResult.count) / pagerParams.pageSize) };
        c.d(pagerParams);

        c.i('Return ReservationRepository > reservtionFindMany');
        return [reservations, pagerParams];
    }


    async findReservationsSQLStyle(searchParams: SearchParam[], pagerParams: PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('Repository > findReservations');
        c.d(searchParams);
        c.d(pagerParams);
        //calculate offset
        const offset = pagerParams.pageSize * (pagerParams.pageIndex - 1);

        //const countQuery = {...pocoQuery, extras: {count: this.dbClient.db.$count(pocoQuery)}};
        const reservationTypeAlias = alias(configTable, 'reservation_type');
        const reservationStatusAlias = alias(configTable, 'reservation_status');

        let countQuery = this.dbClient.db.select({ count: count() })
            .from(reservationTable)
            .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
            .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
            .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
            .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customer.id));

        let dataQuery = this.dbClient.db.select({ 
            ...reservationTable,
            customer: {...customerTable}
         })
            .from(reservationTable)
            .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
            .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
            .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
            .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customer.id));

        if (searchParams && searchParams.length > 0) {
            const conditions = searchParams
                .map((searchParam: SearchParam) => {
                    if (searchParam.searchColumn === 'reservationStatus') {
                        return eq(reservationStatusAlias.value, `${searchParam.searchValue}`);
                    }
                    if (searchParam.searchColumn === 'reservationType') {
                        return eq(reservationTypeAlias.value, `${searchParam.searchValue}`);
                    }
                    if (searchParam.searchColumn === 'createdFrom') {
                        return gte(reservationTable.createdAtUTC, new Date(searchParam.searchValue));
                    }
                    if (searchParam.searchColumn === 'createdUntil') {
                        return lte(reservationTable.createdAtUTC, new Date(searchParam.searchValue));
                    }
                    if (searchParam.searchColumn === 'name') {
                        return like(customerTable.name, `%${searchParam.searchValue}%`);
                    }
                    return undefined; // or some default condition if needed
                })
                .filter((condition): condition is Exclude<typeof condition, undefined> => condition !== undefined);

            if (conditions.length > 0) {
                countQuery.where(and(...conditions));
                dataQuery.where(and(...conditions));
            }
        }

        c.d(countQuery.toSQL());
        c.d(dataQuery.toSQL());
        c.d(await dataQuery);
        const qresult = await dataQuery;    
        const rr = qresult?.reduce((acc:Reservation[], current:any) => {
            const {customer, ...reservation} = current;
            let rsvn = acc.find(r => r.id === current.id);
            if (!rsvn) {
                rsvn = reservation;
                rsvn!.customers = [];
                acc.push(rsvn!);
            }
            if(customer)
                rsvn?.customers?.push(customer);
            
            return acc;
          }, [] as Reservation[]);
        c.d(rr);
        const [countResult] = await countQuery;
        c.i('COUNT QUERY RESULT');
        c.d(countResult);

        //update number of pages
        pagerParams = { ...pagerParams, records: countResult.count, pages: Math.ceil((countResult.count) / pagerParams.pageSize) };

        //build actual query with limit and offset

        let reservationsQuery = this.dbClient.db.query.reservationTable.findMany({
            with: {
                reservationStatus: true,
                reservationType: {
                    where: (table: ConfigEntity,
                        operators: {
                            and: (...args: SQL[]) => SQL;
                            eq: (left: any, right: any) => SQL;
                            gte: (left: any, right: any) => SQL;
                            lte: (left: any, right: any) => SQL;
                        }) => {
                        const conditions = searchParams
                            .map((searchParam: SearchParam) => {
                                if (searchParam.searchColumn === 'reservationType') {
                                    return operators.eq(table.value, searchParam.searchValue);
                                }
                                return undefined;
                            })
                            .filter((condition): condition is SQL => condition !== undefined);
        
                        return conditions.length > 0 ? operators.and(...conditions) : undefined;
                    },
                },
                customers: {
                    with: {
                        customer: true // Include full customer data
                    }
                },
                prepaidPackage: true,
                promotionPackage: true
            },
            where: (table: ReservationEntity,
                operators: {
                    and: (...args: SQL[]) => SQL;
                    eq: (left: any, right: any) => SQL;
                    gte: (left: any, right: any) => SQL;
                    lte: (left: any, right: any) => SQL;
                }) => {
                const conditions = searchParams
                    .map((searchParam: SearchParam) => {
                        if (searchParam.searchColumn === 'id') {
                            return operators.eq(table.id, searchParam.searchValue);
                        }
                        if (searchParam.searchColumn === 'createdFrom') {
                            return operators.gte(table.createdAtUTC, new Date(searchParam.searchValue));
                        }
                        if (searchParam.searchColumn === 'createdUntil') {
                            return operators.lte(table.createdAtUTC, new Date(searchParam.searchValue));
                        }
                        return undefined;
                    })
                    .filter((condition): condition is SQL => condition !== undefined);

                return conditions.length > 0 ? operators.and(...conditions) : undefined;
            },
            limit: pagerParams.pageSize,
            offset: offset,
            orderBy: desc(reservationTable.createdAtUTC)
        });
        c.d(reservationsQuery.toSQL());

        const reservations = await reservationsQuery.execute();
        let r = reservations.map((r: any) => (
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
                customers: r.customers?.map((c: any) => (c.customer))
            }
        )
        );
        c.d(pagerParams);

        return [r, pagerParams];
    }


    getJoinQuery() {
        const reservationTypeAlias = alias(configTable, 'reservation_type');
        const reservationStatusAlias = alias(configTable, 'reservation_status');

        let query = this.dbClient.db.select({})
            .from(reservationTable)
            .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
            .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
            .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
            .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customer.id));
        return query;
    }


    async roomReservationList(searchParams: SearchParam[]): Promise<Room[]> {
        c.i('ReservationRepository > roomReservationList');
        c.d(searchParams);
            

        const dataQuery = this.dbClient.db
        .select()
        .from(roomTable)
        .leftJoin(roomReservationTable, or(
            eq(roomReservationTable.roomId, roomTable.id), 
            isNull(roomReservationTable.id)
        ))
        .leftJoin(reservationTable, 
            and(
                eq(reservationTable.id, roomReservationTable.reservationId),
                or( 
                    and(
                        lte(reservationTable.checkInDateUTC, new Date(searchParams[0].searchValue)),
                        gte(reservationTable.checkOutDateUTC, new Date(searchParams[0].searchValue))
                    ),
                    isNull(reservationTable.id)
                )
            )
        )
        .leftJoin(configTable, or(
            and(
                eq(configTable.id, reservationTable.reservationStatusId),
                ne(configTable.value, 'CCL')
            ),
            isNull(configTable.id)
        ));

        c.d(dataQuery.toSQL());
        const dataQueryResult = await dataQuery;

        const rooms = dataQueryResult?.reduce((acc:Room[], current:any) => {
            const {room, reservation} = current;
            let currentRoom = acc.find(r => r.id === room.id);
            if (!currentRoom) {
                currentRoom = room;
                currentRoom!.reservations = [];
                acc.push(currentRoom!);
            }
            if(reservation)
                currentRoom?.reservations?.push(reservation);
            
            return acc;
          }, [] as Room[]);

        return rooms;
    }


    async roomScheduleList(searchParams: SearchParam[]): Promise<Room[]> {
        c.i('ReservationRepository > roomScheduleList');
        c.d(searchParams);

        //build conditions first for join
        let start: Date, end: Date;
        searchParams.forEach((searchParam: SearchParam) => {
            if (searchParam.searchColumn === 'checkInDateUTCFrom') {
                start = new Date(searchParam.searchValue);
            }
            if (searchParam.searchColumn === 'checkInDateUTCTo') {
                end = new Date(searchParam.searchValue);
            }
        });
            

        const dataQuery = this.dbClient.db
        .select()
        .from(roomTable)
        .leftJoin(roomReservationTable, or(eq(roomReservationTable.roomId, roomTable.id), isNull(roomReservationTable.id)))
        .leftJoin(reservationTable, and(
            eq(reservationTable.id, roomReservationTable.reservationId),
            or( 
                between(reservationTable.checkInDateUTC, start!, end!),
                between(reservationTable.checkOutDateUTC, start!, end!),
                and(
                    lte(reservationTable.checkInDateUTC, start!),
                    gte(reservationTable.checkOutDateUTC, end!)),
                isNull(reservationTable.id)
            )
            
        ))
        .leftJoin(configTable, or(
            and(
                eq(configTable.id, reservationTable.reservationStatusId),
                ne(configTable.value, 'CCL')
            ),
            isNull(configTable.id)
        ));

        c.d(dataQuery.toSQL());
        const dataQueryResult = await dataQuery;

        const rooms = dataQueryResult?.reduce((acc:Room[], current:any) => {
            const {room, reservation} = current;
            let currentRoom = acc.find(r => r.id === room.id);
            if (!currentRoom) {
                currentRoom = room;
                currentRoom!.reservations = [];
                acc.push(currentRoom!);
            }
            if(reservation)
                currentRoom?.reservations?.push(reservation);
            
            return acc;
          }, [] as Room[]);

        return rooms;
    }



    async updateReservation(id: string, reservation: Reservation): Promise<Reservation> {
        c.i("ReservationRepository > updateReservation");
        c.d(id);
        c.d(reservation);

        reservation = await this.prepareReservation(reservation);

        // Use transaction
        return await this.dbClient.db.transaction(async (tx: TransactionType) => {
            c.i('Starting transaction.');

            c.i('Updating reservation.');
            const [createdId] = await tx.update(reservationTable).set(reservation)
            .where(eq(reservationTable.id, id));

            c.i('For simplicity, delete all customers from reservations and insert new.');
            await tx.delete(reservationCustomerTable).where(eq(reservationCustomerTable.reservationId, id));
            
            if (reservation.customers && reservation.customers.length > 0) {
                c.i('Customers exist. Prepare to insert.');
                const newReservationCustomers = reservation.customers.map((c) => {
                    return {
                        reservationId: id,
                        customerId: c.id,
                        createdBy: "xxx",
                        updatedBy: 'xxx'
                    };
                });
                c.d(newReservationCustomers?.length);
                //insert using transaction
                await tx.insert(reservationCustomerTable).values(newReservationCustomers);
            }

            if(reservation.roomNo){
                //retrieve room id
                const [room] = await this.dbClient.db.select()
                .from(roomTable)
                .where(eq(roomTable.roomNo, reservation.roomNo)).limit(1);
                if(!room)
                    throw new Error('Roon number is invalid.');
                //insert into roomReservation
                const roomReservation = new RoomReservation();
                roomReservation.roomId = room.id;
                roomReservation.reservationId = reservation.id;
                await tx.insert(roomReservationTable).values(roomReservation);
            }else{
                //no room provided, delete room reservation list
                await tx.delete(roomReservationTable).where(eq(roomReservationTable.reservationId, reservation.id))
            }

            c.i('Return > ReservationRepository > updateReservation');
            return reservation;
        });
    }
}