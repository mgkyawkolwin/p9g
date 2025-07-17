import { configTable, ReservationEntity, reservationTable, reservationCustomerTable, prepaidTable, promotionTable, customerTable, ConfigEntity, roomTable, roomReservationTable, RoomReservationEntity, ReservationCustomerEntity, billTable, BillEntity } from "@/data/orm/drizzle/mysql/schema";
import IReservationRepository from "../IReservationRepository";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/data/db/IDatabase";
import { PagerParams, SearchParam, TYPES } from "@/lib/types";
import { Repository } from "./Repository";
import c from "@/lib/core/logger/ConsoleLogger";
import { SQL, and, count, asc, desc, eq, ne, gte,between, lte, or, like,  isNull } from "drizzle-orm";
import Reservation from "@/domain/models/Reservation";
import { TransactionType } from "@/data/orm/drizzle/mysql/db";
import { customer } from "@/drizzle/migrations/schema";
import { alias } from "drizzle-orm/mysql-core";
import Room from "@/domain/models/Room";
import RoomReservation from "@/domain/dtos/roomreservation";
import { auth } from "@/app/auth";
import Bill from "@/domain/models/Bill";


@injectable()
export default class ReservationRepository extends Repository<Reservation, typeof reservationTable> implements IReservationRepository {


    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, reservationTable);
    }


    async billsGet(reservationId:string): Promise<Bill[]> {
        c.i('ReservationRepository > billsGet');    
        return await this.dbClient.db.select().from(billTable).where(eq(billTable.reservationId, reservationId));
    }


    async billsSave(reservationId:string, bills: Bill[]): Promise<void> {
        c.i('ReservationRepository > billsSave');
        bills.forEach(bill => {
            bill.createdBy = 'xxx';
            bill.updatedBy = 'xxx';
        });
        
        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            await tx.delete(billTable).where(eq(billTable.reservationId, reservationId));
            if(bills && bills.length >= 1){
                //only insert bills if there are any
                await tx.insert(billTable).values(bills as unknown as BillEntity[]);
            }
        });
        c.i('Return > ReservationRepository > billsSave');
    }


    async cancel(id: string) : Promise<void> {
        c.i('ReservationRepository > cancel');
        c.d(id);
        const session = await auth();
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

        await this.dbClient.db.update(reservationTable)
        .set({reservationStatusId: reservationStatus.id, updatedBy:  '00000000-0000-0000-0000-000000000000'})
        .where(eq(reservationTable.id, id));
        c.i('Return from ReservationRepository > cancel');
    }


    async checkIn(id: string) : Promise<void> {
        c.i('ReservationRepository > checkIn');
        c.d(id);
        const session = await auth();
        c.d(session);
        const [reservationStatus] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RESERVATION_STATUS"),
                eq(configTable.value, "CIN")
            )
        ).limit(1);
        
        c.d(reservationStatus);

        await this.dbClient.db.update(reservationTable)
        .set({reservationStatusId: reservationStatus.id, updatedBy:  '00000000-0000-0000-0000-000000000000'})
        .where(eq(reservationTable.id, id));
        c.i('Return from ReservationRepository > checkIn');
    }


    async checkOut(id: string) : Promise<void> {
        c.i('ReservationRepository > checkOut');
        c.d(id);
        const session = await auth();
        const [reservationStatus] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RESERVATION_STATUS"),
                eq(configTable.value, "OUT")
            )
        ).limit(1);
        
        c.d(reservationStatus);

        await this.dbClient.db.update(reservationTable)
        .set({reservationStatusId: reservationStatus.id, updatedBy:  '00000000-0000-0000-0000-000000000000'})
        .where(eq(reservationTable.id, id));
        c.i('Return from ReservationRepository > checkOut');
    }


    async createReservation(reservation: Reservation): Promise<Reservation> {
        c.i("ReservationRepository > createReservation");
        c.d(reservation);
        const session = await auth();
        reservation = await this.prepareReservation(reservation);
        reservation.createdBy = '00000000-0000-0000-0000-000000000000';
        reservation.updatedBy = '00000000-0000-0000-0000-000000000000';

        // Use transaction
        return await this.dbClient.db.transaction(async (tx: TransactionType) => {
            c.i('Starting transaction.');
            c.d(reservation);

            // Use the transaction for create operation
            const [createdId] = await tx.insert(reservationTable).values(reservation as unknown as ReservationEntity).$returningId();
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
                        createdBy:  '00000000-0000-0000-0000-000000000000',
                        updatedBy: '00000000-0000-0000-0000-000000000000'
                    };
                });
                c.d(newReservationCustomers?.length);
                //insert using transaction
                await tx.insert(reservationCustomerTable).values(newReservationCustomers as unknown as ReservationCustomerEntity[]);
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
                roomReservation.checkInDateUTC = reservation.checkInDateUTC;
                roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
                roomReservation.createdBy =  '00000000-0000-0000-0000-000000000000';
                roomReservation.updatedBy = '00000000-0000-0000-0000-000000000000';
                await tx.insert(roomReservationTable).values(roomReservation as unknown as RoomReservationEntity);
            }

            return reservation;
        });
    }


    async moveRoom(id: string, roomNo: string) : Promise<void> {
        c.i('ReservationRepository > moveRoom');
        c.d(id);
        c.d(roomNo);

        const session = await auth();

        c.i('retrieve new room info');
        const [room] = await this.dbClient.db.select().from(roomTable).where(
            eq(roomTable.roomNo, roomNo)
        ).limit(1);
        c.d(room);

        c.i('Retrieve reservation.');
        const [reservation] = await this.dbClient.db.select().from(reservationTable).where(
            eq(reservationTable.id, id)
        ).limit(1);

        c.i('Return from ReservationRepository > moveRoom');
        return await this.dbClient.db.transaction(async (tx: TransactionType) => {
            c.i('Inside transaction');
            const date = new Date(new Date().toISOString());
            c.i('Update current roomReservation record');
            await tx.update(roomReservationTable)
            .set({checkOutDateUTC: date, updatedBy:  '00000000-0000-0000-0000-000000000000'})
            .where(eq(roomReservationTable.reservationId, id));

            c.i('Create new roomReservation record');
            await tx.insert(roomReservationTable)
            .values(
                {
                    reservationId: id, 
                    roomId: room.id, 
                    checkInDateUTC: date, 
                    checkOutDateUTC: reservation.checkOutDateUTC,
                    createdBy:  '00000000-0000-0000-0000-000000000000',
                    updatedBy:  '00000000-0000-0000-0000-000000000000'
                });

                c.i('Update reservation table.');
            await tx.update(reservationTable)
            .set({roomNo: roomNo})
            .where(eq(reservationTable.id, id));
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
        const pickUpAlias = alias(configTable, 'pickUpAlias');
        const dropOffAlias = alias(configTable, 'dropOffAlias');

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
            dropOffTypeText: dropOffAlias.text,
            promotionPackage: promotionTable.value,
            promotionPackageText: promotionTable.text,
            prepaidPackage: prepaidTable.value,
            prepardPackageText: prepaidTable.text
         })
        .from(reservationTable)
        .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
        .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
        .leftJoin(promotionTable, eq(promotionTable.id, reservationTable.promotionPackageId))
        .leftJoin(prepaidTable, eq(prepaidTable.id, reservationTable.prepaidPackageId))
        .leftJoin(pickUpAlias, eq(reservationTable.pickUpTypeId, pickUpAlias.id))
        .leftJoin(dropOffAlias, eq(reservationTable.dropOffTypeId, dropOffAlias.id))
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
            .leftJoin(promotionTable, eq(promotionTable.id, reservationTable.promotionPackageId))
            .leftJoin(prepaidTable, eq(prepaidTable.id, reservationTable.prepaidPackageId))
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
            dropOffTypeText: dropOffAlias.text,
            promotionPackage: promotionTable.value,
            promotionPackageText: promotionTable.text,
            prepaidPackage: prepaidTable.value,
            prepardPackageText: prepaidTable.text
        })
            .from(reservationTable)
            .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
            .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
            .leftJoin(promotionTable, eq(promotionTable.id, reservationTable.promotionPackageId))
            .leftJoin(prepaidTable, eq(prepaidTable.id, reservationTable.prepaidPackageId))
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
                        return eq(reservationTable.checkInDateUTC, new Date(searchParam.searchValue));
                    }
                    if (searchParam.searchColumn === 'checkOutDateUTC') {
                        return eq(reservationTable.checkOutDateUTC, new Date(searchParam.searchValue));
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
        c.d('dataqueryresult');
        c.d(dataqueryresult.length);
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
        .leftJoin(roomReservationTable, 
            or(
                and(
                    eq(roomReservationTable.roomId, roomTable.id), 
                    lte(roomReservationTable.checkInDateUTC, new Date(searchParams[0].searchValue)),
                    gte(roomReservationTable.checkOutDateUTC, new Date(searchParams[0].searchValue))
                ),
                isNull(roomReservationTable.id)
            )
        )
        .leftJoin(reservationTable, 
            eq(reservationTable.id, roomReservationTable.reservationId)
        )
        .leftJoin(configTable, or(
            and(
                eq(configTable.id, reservationTable.reservationStatusId),
                ne(configTable.value, 'CCL')
            )
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
        .leftJoin(roomReservationTable,
            or(
                and(
                    eq(roomReservationTable.roomId, roomTable.id), 
                    or( 
                        between(roomReservationTable.checkInDateUTC, start!, end!),
                        between(roomReservationTable.checkOutDateUTC, start!, end!),
                        and(
                            lte(roomReservationTable.checkInDateUTC, start!),
                            gte(roomReservationTable.checkOutDateUTC, end!)
                        )
                    )
                ),
                isNull(roomReservationTable.id)
            )
        )
        .leftJoin(reservationTable, 
            or(
                and(
                    eq(reservationTable.id, roomReservationTable.reservationId), 
                    or( 
                        between(reservationTable.checkInDateUTC, start!, end!),
                        between(reservationTable.checkOutDateUTC, start!, end!),
                        and(
                            lte(reservationTable.checkInDateUTC, start!),
                            gte(reservationTable.checkOutDateUTC, end!)
                        )
                    )
                ),
                isNull(reservationTable.id)
            )
        )
        .leftJoin(configTable, or(
            and(
                eq(configTable.id, reservationTable.reservationStatusId),
                ne(configTable.value, 'CCL')
            ),
            isNull(configTable.id)
        ));

        //c.d(dataQuery.toSQL());
        const dataQueryResult = await dataQuery;
        c.d(dataQueryResult);

        const rooms = dataQueryResult?.reduce((acc:Room[], current:any) => {
            const {room, roomReservation, reservation} = current;
            c.d(roomReservation);
            let currentRoom = acc.find(r => r.id === room.id);
            if (!currentRoom) {
                currentRoom = room;
                currentRoom!.reservations = [];
                currentRoom!.roomReservations = [];
                acc.push(currentRoom!);
            }
            if(reservation)
                currentRoom?.reservations?.push(reservation);
            if(roomReservation)
                currentRoom?.roomReservations?.push(roomReservation);
            
            return acc;
          }, [] as Room[]);

        return rooms;
    }


    async updateDropOffCarNo(id:string, carNo:string) : Promise<void>{
        c.i('ReservationRepository > updateDropOffCarNo');
        if(!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');
        if(!carNo || carNo === 'undefined')
            throw new Error('Car number update failed. Car number is required.');

        const session = await auth();

        c.i('Retrieve reservation');
        const [reservation] = await this.dbClient.db.select().from(reservationTable)
        .where(eq(reservationTable.id, id)).limit(1);
        c.d(reservation);

        if(!reservation)
            throw new Error('Cannot find reservation.');

        c.i('Update reservation');
        await this.dbClient.db.update(reservationTable).set({dropOffCarNo: carNo, updatedBy:  '00000000-0000-0000-0000-000000000000'})
        .where(eq(reservationTable.id, id));

        c.i('Return ReservationRepository > updateDropOffCarNo');
    }

    async updatePickUpCarNo(id:string, carNo:string) : Promise<void>{
        c.i('ReservationRepository > updatePickUpCarNo');
        if(!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');
        if(!carNo || carNo === 'undefined')
            throw new Error('Car number update failed. Car number is required.');

        const session = await auth();

        c.i('Retrieve reservation');
        const [reservation] = await this.dbClient.db.select().from(reservationTable)
        .where(eq(reservationTable.id, id)).limit(1);
        c.d(reservation);

        if(!reservation)
            throw new Error('Cannot find reservation.');

        c.i('Update reservation');
        await this.dbClient.db.update(reservationTable).set({pickUpCarNo: carNo, updatedBy:  '00000000-0000-0000-0000-000000000000'})
        .where(eq(reservationTable.id, id));

        c.i('Return ReservationRepository > updatePickUpCarNo');
    }


    async updateReservation(id: string, reservation: Reservation): Promise<Reservation> {
        c.i("ReservationRepository > updateReservationxxx");
        c.i(id);
        c.d(reservation);

        const session = await auth();

        if(!id || id === 'undefined') {
            throw new Error('Reservation update failed. Id is required.');
        }

        if(!reservation) {
            throw new Error('Reservation update failed. Reservation is required.');
        }
            

        reservation = await this.prepareReservation(reservation);

        c.i('Retrieve existing reservation for comparison');
        const [existingReservation] = await this.dbClient.db.select().from(reservationTable).where(eq(reservationTable.id, id)).limit(1);

        // Use transaction
        return await this.dbClient.db.transaction(async (tx: TransactionType) => {
            c.i('Starting transaction.');

            c.i('Updating reservation.');
            reservation.updatedBy =  '00000000-0000-0000-0000-000000000000';
            const [createdId] = await tx.update(reservationTable).set(reservation as unknown as ReservationEntity)
            .where(eq(reservationTable.id, id));

            c.i('For simplicity, delete all customers from reservations and insert new.');
            await tx.delete(reservationCustomerTable).where(eq(reservationCustomerTable.reservationId, id));
            
            if (reservation.customers && reservation.customers.length > 0) {
                c.i('Customers exist. Prepare to insert.');
                const newReservationCustomers = reservation.customers.map((c) => {
                    return {
                        reservationId: id,
                        customerId: c.id,
                        createdBy:  '00000000-0000-0000-0000-000000000000',
                        updatedBy:  '00000000-0000-0000-0000-000000000000'
                    };
                });
                c.d(newReservationCustomers?.length);
                //insert using transaction
                await tx.insert(reservationCustomerTable).values(newReservationCustomers);
            }

            if(reservation.roomNo && reservation.roomNo !== existingReservation.roomNo){
                c.i('Room no is provided and room no is different from previous room number.');
                //retrieve room id
                const [room] = await this.dbClient.db.select()
                .from(roomTable)
                .where(eq(roomTable.roomNo, reservation.roomNo)).limit(1);
                if(!room)
                    throw new Error('Roon number is invalid.');

                c.i('Check there is existing room reservation, sorted by check out date to get latest records.');
                const [existingRoomReservation] = await this.dbClient.db.select().from(roomReservationTable)
                .where(eq(roomReservationTable.reservationId, id)).orderBy(desc(roomReservationTable.checkOutDateUTC)).limit(1);
                c.d(existingRoomReservation);

                if(reservation.reservationStatus === 'CIN'){
                    c.i('Reservation status is CIN, process room move.');
                    if(existingRoomReservation){
                        c.i('Existing room reservation. Move room.');
                        existingRoomReservation.checkOutDateUTC = new Date().toISOString();
                        existingRoomReservation.updatedBy =  '00000000-0000-0000-0000-000000000000';
                        await tx.update(roomReservationTable).set(existingRoomReservation);

                        const roomReservation = new RoomReservation();
                        roomReservation.reservationId = reservation.id;
                        roomReservation.roomId = room.id;
                        roomReservation.noOfExtraBed = 0;
                        roomReservation.checkInDateUTC = new Date().toISOString();
                        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
                        roomReservation.createdBy =  '00000000-0000-0000-0000-000000000000';
                        roomReservation.updatedBy =  '00000000-0000-0000-0000-000000000000';
                        await tx.insert(roomReservationTable).values(roomReservation as unknown as RoomReservationEntity);
                    }

                    if(!existingRoomReservation){
                        c.i('No existing room reservation. Insert new');
                        const roomReservation = new RoomReservation();
                        roomReservation.reservationId = reservation.id;
                        roomReservation.roomId = room.id;
                        roomReservation.noOfExtraBed = 0;
                        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
                        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
                        roomReservation.createdBy =  '00000000-0000-0000-0000-000000000000';
                        roomReservation.updatedBy =  '00000000-0000-0000-0000-000000000000';
                        await tx.insert(roomReservationTable).values(roomReservation as unknown as RoomReservationEntity);
                    }
                }

                if(reservation.reservationStatus !== 'CIN'){
                    c.i('Reservation status is not CIN, just insert/update.');
                    if(existingRoomReservation){
                        c.i('There is an existing room reservation. Update.');
                        existingRoomReservation.roomId = room.id;
                        existingRoomReservation.checkInDateUTC = reservation.checkInDateUTC;
                        existingRoomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
                        existingRoomReservation.updatedBy =  '00000000-0000-0000-0000-000000000000';
                        await tx.update(roomReservationTable).set(existingRoomReservation)
                        .where(eq(roomReservationTable.id, existingRoomReservation.id));
                    }

                    if(!existingRoomReservation){
                        c.i('There is no existing room reservation. Insert.');
                        const roomReservation = new RoomReservation();
                        roomReservation.reservationId = reservation.id;
                        roomReservation.roomId = room.id;
                        roomReservation.noOfExtraBed = 0;
                        roomReservation.checkInDateUTC = reservation.checkInDateUTC;
                        roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
                        roomReservation.createdBy =  '00000000-0000-0000-0000-000000000000';
                        roomReservation.updatedBy =  '00000000-0000-0000-0000-000000000000';
                        await tx.insert(roomReservationTable).values(roomReservation as unknown as RoomReservationEntity);
                    }
                }

                if(!existingRoomReservation){
                    c.i('No existing roomReservation. Insert new one');
                    const roomReservation = new RoomReservation();
                    roomReservation.reservationId = reservation.id;
                    roomReservation.roomId = room.id;
                    roomReservation.noOfExtraBed = 0;
                    roomReservation.checkInDateUTC = reservation.checkInDateUTC;
                    roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
                    roomReservation.createdBy =  '00000000-0000-0000-0000-000000000000';
                    roomReservation.updatedBy =  '00000000-0000-0000-0000-000000000000';
                    await tx.insert(roomReservationTable).values(roomReservation as unknown as RoomReservationEntity);
                }
            }

            if(reservation.roomNo && reservation.roomNo === existingReservation.roomNo){
                c.i('Room no is provided and room no is same as previous room number.');
                //retrieve room id
                const [room] = await this.dbClient.db.select()
                .from(roomTable)
                .where(eq(roomTable.roomNo, reservation.roomNo)).limit(1);
                if(!room)
                    throw new Error('Roon number is invalid.');

                c.i('Retrieve existing room reservation and update checkin/checkout dates.');
                const [existingRoomReservation] = await this.dbClient.db.select().from(roomReservationTable)
                .where(eq(roomReservationTable.reservationId, id)).orderBy(desc(roomReservationTable.checkOutDateUTC)).limit(1);
                c.d(existingRoomReservation);
 
                existingRoomReservation.checkInDateUTC = reservation.checkInDateUTC;
                existingRoomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
                existingRoomReservation.updatedBy =  '00000000-0000-0000-0000-000000000000';
                await tx.update(roomReservationTable).set(existingRoomReservation)
                .where(eq(roomReservationTable.id, existingRoomReservation.id));
            }


            if(!reservation.roomNo){
                c.i('No room provided, delete room reservation list');
                await tx.delete(roomReservationTable).where(eq(roomReservationTable.reservationId, reservation.id))
            }

            c.i('Return > ReservationRepository > updateReservation');
            return reservation;
        });
    }
}