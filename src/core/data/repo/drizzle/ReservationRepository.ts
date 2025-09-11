import { configTable, ReservationEntity, reservationTable, reservationCustomerTable, prepaidTable, promotionTable, customerTable, ConfigEntity, roomTable, roomReservationTable, RoomReservationEntity, ReservationCustomerEntity, billTable, BillEntity, userTable, paymentTable, PaymentEntity, roomChargeTable, roomRateTable, roomTypeTable, RoomChargeEntity, RoomTypeEntity, RoomEntity, RoomRateEntity, UserEntity } from "@/core/data/orm/drizzle/mysql/schema";
import IReservationRepository from "../contracts/IReservationRepository";
import { inject, injectable } from "inversify";
import type { IDatabaseClient } from "@/core/data/db/IDatabase";
import { PagerParams, SearchParam, TYPES } from "@/core/lib/types";
import { Repository } from "./Repository";
import c from "@/core/loggers/console/ConsoleLogger";
import { SQL, and, count, asc, desc, eq, ne, gte, between, lte, or, like, isNull, sum } from "drizzle-orm";
import Reservation from "@/core/domain/models/Reservation";
import { TransactionType } from "@/core/data/db/mysql/MySqlDatabase";
import { alias } from "drizzle-orm/mysql-core";
import Room from "@/core/domain/models/Room";
import RoomReservation from "@/core/domain/models/RoomReservation";
import { auth } from "@/app/auth";
import Bill from "@/core/domain/models/Bill";
import { CustomError } from "@/core/lib/errors";
import Payment from "@/core/domain/models/Payment";
import RoomCharge from "@/core/domain/models/RoomCharge";
import RoomRate from "@/core/domain/models/RoomRate";
import RoomType from "@/core/domain/models/RoomType";
import { getUTCDateMidNight, getUTCDateTimeString } from "@/core/lib/utils";


@injectable()
export default class ReservationRepository extends Repository<Reservation, typeof reservationTable> implements IReservationRepository {

    reservationTypeAlias = alias(configTable, 'reservation_type');
    reservationStatusAlias = alias(configTable, 'reservation_status');
    pickUpAlias = alias(configTable, 'pickUpAlias');
    dropOffAlias = alias(configTable, 'dropOffAlias');

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>
    ) {
        super(dbClient, reservationTable);
    }


    async billDelete(reservationId: string, billId: string): Promise<void> {
        c.fs('ReservationRepository > billDelete');
        if (!reservationId) throw new CustomError('Reservation id is required.');
        if (!billId) throw new CustomError('Bill id is required.');

        const session = await auth();


        await this.dbClient.db.delete(billTable)
            .where(and(
                eq(billTable.reservationId, reservationId),
                eq(billTable.id, billId)
            ));
        c.fe('ReservationRepository > billDelete');
    }


    // async billGetListById(reservationId: string): Promise<Bill[]> {
    //     c.fs('ReservationRepository > billGetListById');
    //     const result: BillEntity[] = await this.dbClient.db.select().from(billTable).where(eq(billTable.reservationId, reservationId));

    //     c.i('original')
    //     c.d(result);
    //     const bills: Bill[] = result.map((b: BillEntity) => {
    //         const bill = new Bill();
    //         bill.id = b.id;
    //         bill.reservationId = b.reservationId;
    //         bill.amount = Number(b.amount);
    //         bill.currency = b.currency;
    //         bill.dateUTC = b.dateUTC;
    //         bill.isPaid = Boolean(b.isPaid);
    //         bill.itemName = b.itemName;
    //         bill.paidOnUTC = b.paidOnUTC;
    //         bill.paymentMode = b.paymentMode;
    //         bill.paymentType = b.paymentType;
    //         bill.quantity = Number(b.quantity);
    //         bill.unitPrice = Number(b.unitPrice);
    //         bill.createdAtUTC = b.createdAtUTC;
    //         bill.createdBy = b.createdBy;
    //         bill.updatedAtUTC = b.updatedAtUTC;
    //         bill.updatedBy = b.updatedBy;
    //         //bills.push(bill);
    //         return bill;
    //     });
    //     c.d(bills.length);
    //     c.d(bills.length > 0 ? bills[0] : []);

    //     c.fe('ReservationRepository > billGetListById');
    //     return bills;
    // }


    // async billGetListPaid(reservationId: string): Promise<Bill[]> {
    //     c.fs('ReservationRepository > billsGetPaids');
    //     const result: BillEntity[] = await this.dbClient.db.select().from(billTable)
    //         .where(and(
    //             eq(billTable.reservationId, reservationId),
    //             eq(billTable.isPaid, true)
    //         ));

    //     const bills: Bill[] = result.map((b: BillEntity) => {
    //         const bill = new Bill();
    //         bill.id = b.id;
    //         bill.amount = Number(b.amount);
    //         bill.currency = b.currency;
    //         bill.dateUTC = b.dateUTC;
    //         bill.isPaid = Boolean(b.isPaid);
    //         bill.itemName = b.itemName;
    //         bill.paidOnUTC = b.paidOnUTC;
    //         bill.paymentMode = b.paymentMode;
    //         bill.paymentType = b.paymentType;
    //         bill.quantity = Number(b.quantity);
    //         bill.unitPrice = Number(b.unitPrice);
    //         bill.createdAtUTC = b.createdAtUTC;
    //         bill.createdBy = b.createdBy;
    //         bill.updatedAtUTC = b.updatedAtUTC;
    //         bill.updatedBy = b.updatedBy;
    //         // bills.push(bill);
    //         return bill;
    //     });

    //     c.d(bills.length);
    //     c.d(bills.length > 0 ? bills[0] : []);
    //     c.fe('ReservationRepository > billsGetPaids');
    //     return bills;
    // }


    // async billGetListUnpaid(reservationId: string): Promise<Bill[]> {
    //     c.fs('ReservationRepository > billGetListUnpaid');
    //     const result: BillEntity[] = await this.dbClient.db.select().from(billTable)
    //         .where(and(
    //             eq(billTable.reservationId, reservationId),
    //             eq(billTable.isPaid, false)
    //         ));

    //     const bills: Bill[] = result.map((b: BillEntity) => {
    //         const bill = new Bill();
    //         bill.id = b.id;
    //         bill.amount = Number(b.amount);
    //         bill.currency = b.currency;
    //         bill.dateUTC = b.dateUTC;
    //         bill.isPaid = Boolean(b.isPaid);
    //         bill.itemName = b.itemName;
    //         bill.paidOnUTC = b.paidOnUTC;
    //         bill.paymentMode = b.paymentMode;
    //         bill.paymentType = b.paymentType;
    //         bill.quantity = Number(b.quantity);
    //         bill.unitPrice = Number(b.unitPrice);
    //         bill.createdAtUTC = b.createdAtUTC;
    //         bill.createdBy = b.createdBy;
    //         bill.updatedAtUTC = b.updatedAtUTC;
    //         bill.updatedBy = b.updatedBy;
    //         //bills.push(bill);
    //         return bill;
    //     });

    //     c.d(bills.length);
    //     c.d(bills.length > 0 ? bills[0] : []);
    //     c.fe('ReservationRepository > billGetListUnpaid');
    //     return bills;
    // }


    // async billUpdateList(reservationId: string, bills: Bill[]): Promise<void> {
    //     c.fs('ReservationRepository > billUpdateList');
    //     c.d(bills);
    //     const session = await auth();

    //     //get list to update and insert
    //     const updateList = bills.filter(p => typeof p.id !== 'undefined');
    //     const insertList = bills.filter(p => typeof p.id === 'undefined');

    //     updateList.forEach(bill => {
    //         bill.updatedBy = session.user.id;
    //     });

    //     insertList.forEach(bill => {
    //         bill.createdBy = session.user.id;
    //         bill.updatedBy = session.user.id;
    //     });

    //     await this.dbClient.db.transaction(async (tx: TransactionType) => {
    //         //update existing records
    //         updateList.forEach(async bill => {
    //             const usql = tx.update(billTable).set(bill as unknown as BillEntity)
    //                 .where(eq(billTable.id, bill.id));
    //             c.d(usql.toSQL());
    //             await usql;
    //         });

    //         //insert new records
    //         if (insertList && insertList.length >= 1) {
    //             const msql = tx.insert(billTable).values(insertList as unknown as BillEntity[]);
    //             c.d(msql.toSQL());
    //             await msql;
    //         }

    //     });
    //     c.fe('ReservationRepository > billUpdateList');
    // }


    async paymentDelete(reservationId: string, paymentId: string): Promise<void> {
        c.fs('ReservationRepository > paymentDelete');
        if (!reservationId) throw new CustomError('Reservation id is required.');
        if (!paymentId) throw new CustomError('Reservation id is required.');

        const session = await auth();

        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            //retrieve existing payment
            const [payment]: PaymentEntity[] = await tx.select().from(paymentTable)
                .where(eq(paymentTable.id, paymentId)).limit(1);

            await tx.delete(paymentTable)
                .where(and(
                    eq(paymentTable.reservationId, reservationId),
                    eq(paymentTable.id, paymentId)
                ));

            const [reservation]: ReservationEntity[] = await this.dbClient.db.select().from(reservationTable)
                .where(eq(reservationTable.id, reservationId)).limit(1);
            c.d(reservation);

            const updatedPaid = Number(reservation.paidAmount) - Number(payment.amount);
            const updatedDue = Number(reservation.dueAmount) + Number(payment.amount);

            await this.dbClient.db.update(reservationTable).set({ paidAmount: updatedPaid, dueAmount: updatedDue })
                .where(eq(reservationTable.id, reservationId));

            
        });
        c.fe('ReservationRepository > paymentDelete');
    }


    async paymentGetListById(reservationId: string): Promise<Payment[]> {
        c.fs('ReservationRepository > paymentGetListById');
        const result: Payment[] = await this.dbClient.db.select().from(paymentTable)
            .where(eq(paymentTable.reservationId, reservationId)).orderBy(asc(paymentTable.paymentDateUTC));

        const payments: Payment[] = result.map((p: Payment) => {
            const payment = new Payment();
            payment.id = p.id;
            payment.amount = Number(p.amount);
            payment.amountInCurrency = Number(p.amountInCurrency);
            payment.currency = p.currency;
            payment.description = p.description;
            payment.paymentDateUTC = p.paymentDateUTC;
            payment.paymentMode = p.paymentMode;
            payment.paymentType = p.paymentType;
            payment.remark = p.remark;
            payment.reservationId = p.reservationId;
            payment.createdAtUTC = p.createdAtUTC;
            payment.createdBy = p.createdBy;
            payment.updatedAtUTC = p.updatedAtUTC;
            payment.updatedBy = p.updatedBy;
            return payment;
        });

        c.d(payments.length);
        c.d(payments.length > 0 ? payments[0] : []);
        c.fe('ReservationRepository > paymentGetListById');
        return payments;

    }


    async paymentUpdateList(reservationId: string, payments: Payment[]): Promise<void> {
        c.fs('ReservationRepository > paymentUpdateList');
        c.d(payments);

        const session = await auth();

        //get list to update and insert
        const updateList = payments.filter(p => typeof p.id !== 'undefined');
        const insertList = payments.filter(p => typeof p.id === 'undefined');

        updateList.forEach(bill => {
            bill.updatedBy = session.user.id;
        });

        insertList.forEach(bill => {
            bill.createdBy = session.user.id;
            bill.updatedBy = session.user.id;
        });

        await this.dbClient.db.transaction(async (tx: TransactionType) => {

            updateList.forEach(async payment => await tx.update(paymentTable).set(payment as unknown as PaymentEntity).where(eq(paymentTable.id, payment.id)));

            if (insertList && insertList.length >= 1) {
                const msql = tx.insert(paymentTable).values(insertList as unknown as PaymentEntity[]);
                c.d(msql.toSQL());
                await msql;
            }

            //use the arguments values, database in transaction, cannot retrieve the update values
            const totalPaid = payments.reduce((acc, p) => (acc + p.amount), 0);

            const [reservation] = await this.dbClient.db.select().from(reservationTable)
                .where(eq(reservationTable.id, reservationId)).limit(1);
            c.d(reservation);

            const balance = Number(reservation.totalAmount) - Number(reservation.depositAmount) - Number(totalPaid) - Number(reservation.discountAmount) - Number(reservation.taxAmount);
            c.d(balance);

            await this.dbClient.db.update(reservationTable).set({ paidAmount: totalPaid, dueAmount: balance })
                .where(eq(reservationTable.id, reservationId));


        });

        c.fe('ReservationRepository > paymentUpdateList');
    }


    // async reservationCancel(id: string): Promise<void> {
    //     c.fs('ReservationRepository > reservationCancel');
    //     c.d(id);
    //     const session = await auth();
    //     const t = this.dbClient.db.select().from(configTable).where(
    //         and(
    //             eq(configTable.group, "RESERVATION_STATUS"),
    //             eq(configTable.value, "CCL")
    //         )
    //     ).limit(1);
    //     c.d(t.toSQL());
    //     const [reservationStatus]: ConfigEntity[] = await this.dbClient.db.select().from(configTable).where(
    //         and(
    //             eq(configTable.group, "RESERVATION_STATUS"),
    //             eq(configTable.value, "CCL")
    //         )
    //     ).limit(1);

    //     c.d(reservationStatus);

    //     await this.dbClient.db.update(reservationTable)
    //         .set({ reservationStatusId: reservationStatus.id, updatedBy: session.user.id })
    //         .where(eq(reservationTable.id, id));
    //     c.fe('ReservationRepository > reservationCancel');
    // }


    async reservationCheckIn(id: string): Promise<void> {
        c.fs('ReservationRepository > reservationCheckIn');
        c.d(id);
        const session = await auth();

        const [reservationStatus]: ConfigEntity[] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RESERVATION_STATUS"),
                eq(configTable.value, "CIN")
            )
        ).limit(1);

        c.d(reservationStatus);

        await this.dbClient.db.update(reservationTable)
            .set({ reservationStatusId: reservationStatus.id, updatedBy: session.user.id })
            .where(eq(reservationTable.id, id));
        c.fe('ReservationRepository > reservationCheckIn');
    }


    // async reservationGetListCheckIn(searchParams: SearchParam[], pagerParams: PagerParams): Promise<[Reservation[], PagerParams]> {
    //     c.i('ReservationRepository > reservationCheckInList');
    //     c.d(searchParams);
    //     c.d(pagerParams);

    //     const session = await auth();
    //     const [user]: UserEntity[] = await this.dbClient.db.select().from(userTable).where(eq(userTable.id, session.user.id)).limit(1);
    //     if (!user)
    //         throw new Error('Invalid login user.');
    //     //calculate offset
    //     const offset = pagerParams.pageSize * (pagerParams.pageIndex - 1);

    //     //const countQuery = {...pocoQuery, extras: {count: this.dbClient.db.$count(pocoQuery)}};
    //     const reservationTypeAlias = alias(configTable, 'reservation_type');
    //     const reservationStatusAlias = alias(configTable, 'reservation_status');
    //     const pickUpAlias = alias(configTable, 'pickUpAlias');
    //     const dropOffAlias = alias(configTable, 'dropOffAlias');

    //     let countQuery = this.dbClient.db.select({ count: count() })
    //         .from(reservationTable)
    //         .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
    //         .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
    //         .leftJoin(promotionTable, eq(promotionTable.id, reservationTable.promotionPackageId))
    //         .leftJoin(prepaidTable, eq(prepaidTable.id, reservationTable.prepaidPackageId))
    //         .leftJoin(pickUpAlias, eq(reservationTable.pickUpTypeId, pickUpAlias.id))
    //         .leftJoin(dropOffAlias, eq(reservationTable.dropOffTypeId, dropOffAlias.id))
    //         .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
    //         .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customerTable.id));

    //     let dataQuery = this.dbClient.db.select({
    //         ...reservationTable,
    //         customer: { ...customerTable },
    //         reservationStatus: reservationStatusAlias.value,
    //         reservationStatusText: reservationStatusAlias.text,
    //         reservationType: reservationTypeAlias.value,
    //         reservationTypeText: reservationTypeAlias.text,
    //         pickUpType: pickUpAlias.value,
    //         pickUpTypeText: pickUpAlias.text,
    //         dropOffType: dropOffAlias.value,
    //         dropOffTypeText: dropOffAlias.text,
    //         promotionPackage: promotionTable.value,
    //         promotionPackageText: promotionTable.text,
    //         prepaidPackage: prepaidTable.value,
    //         prepaidPackageText: prepaidTable.text
    //     })
    //         .from(reservationTable)
    //         .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
    //         .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
    //         .leftJoin(promotionTable, eq(promotionTable.id, reservationTable.promotionPackageId))
    //         .leftJoin(prepaidTable, eq(prepaidTable.id, reservationTable.prepaidPackageId))
    //         .leftJoin(pickUpAlias, eq(reservationTable.pickUpTypeId, pickUpAlias.id))
    //         .leftJoin(dropOffAlias, eq(reservationTable.dropOffTypeId, dropOffAlias.id))
    //         .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
    //         .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customerTable.id))
    //         .offset(offset)
    //         .limit(pagerParams.pageSize);

    //     if (searchParams && searchParams.length > 0) {
    //         const conditions = searchParams
    //             .map((searchParam: SearchParam) => {
    //                 if (searchParam.searchColumn === 'reservationStatus') {
    //                     return eq(reservationStatusAlias.value, searchParam.searchValue);
    //                 }
    //                 if (searchParam.searchColumn === 'reservationType') {
    //                     return eq(reservationTypeAlias.value, searchParam.searchValue);
    //                 }
    //                 if (searchParam.searchColumn === 'checkInDateUTC') {
    //                     let d: Date = new Date(searchParam.searchValue);
    //                     return eq(reservationTable.checkInDate, d);
    //                 }
    //                 if (searchParam.searchColumn === 'checkOutDateUTC') {
    //                     let d: Date = new Date(searchParam.searchValue);
    //                     return eq(reservationTable.checkOutDate, d);
    //                 }
    //                 if (searchParam.searchColumn === 'createdFrom') {
    //                     let d: Date = new Date(searchParam.searchValue);
    //                     return gte(reservationTable.createdAtUTC, d);
    //                 }
    //                 if (searchParam.searchColumn === 'createdUntil') {
    //                     const d = getMidNightDate(new Date(searchParam.searchValue));
    //                     return lte(reservationTable.createdAtUTC, d);
    //                 }
    //                 if (searchParam.searchColumn === 'name') {
    //                     return or(
    //                         like(customerTable.name, `%${searchParam.searchValue}%`),
    //                         like(customerTable.englishName, `%${searchParam.searchValue}%`)
    //                     );
    //                 }
    //                 if (searchParam.searchColumn === 'id') {
    //                     return like(reservationTable.id, `%${searchParam.searchValue}%`);
    //                 }
    //                 if (searchParam.searchColumn === 'remark') {
    //                     return like(reservationTable.remark, `%${searchParam.searchValue}%`);
    //                 }
    //                 if (searchParam.searchColumn === 'nationalId') {
    //                     return like(customerTable.nationalId, `%${searchParam.searchValue}%`);
    //                 }
    //                 if (searchParam.searchColumn === 'passport') {
    //                     return like(customerTable.passport, `%${searchParam.searchValue}%`);
    //                 }
    //                 if (searchParam.searchColumn === 'phone') {
    //                     return like(customerTable.phone, `%${searchParam.searchValue}%`);
    //                 }
    //                 return undefined;
    //             })
    //             .filter((condition): condition is Exclude<typeof condition, undefined> => condition !== undefined);

    //         if (conditions.length > 0) {
    //             countQuery.where(
    //                 and(
    //                     ...conditions,
    //                     eq(reservationTable.location, user.location),
    //                     or(
    //                         eq(reservationStatusAlias.value, 'CIN'),
    //                         eq(reservationStatusAlias.value, 'NEW')
    //                     )
    //                 ));
    //             dataQuery.where(
    //                 and(
    //                     ...conditions,
    //                     eq(reservationTable.location, user.location),
    //                     or(
    //                         eq(reservationStatusAlias.value, 'CIN'),
    //                         eq(reservationStatusAlias.value, 'NEW')
    //                     )
    //                 ));
    //         }
    //     }

    //     //order
    //     dataQuery.orderBy(pagerParams.orderDirection === 'desc' ? desc(reservationTable[pagerParams.orderBy as keyof ReservationEntity]) : asc(reservationTable[pagerParams.orderBy as keyof ReservationEntity]));
    //     const dataqueryresult = await dataQuery;
    //     c.d('dataqueryresult');
    //     c.d(dataqueryresult.length);
    //     c.d(dataQuery.toSQL());

    //     //transform to desired result
    //     const reservations = dataqueryresult?.reduce((acc: Reservation[], current: any) => {
    //         const { customer, ...reservation } = current;
    //         let rsvn = acc.find(r => r.id === current.id);
    //         if (!rsvn) {
    //             rsvn = reservation;
    //             rsvn!.customers = [];
    //             acc.push(rsvn!);
    //         }
    //         if (customer)
    //             rsvn?.customers?.push(customer);

    //         return acc;
    //     }, [] as Reservation[]);

    //     const [countResult] = await countQuery;
    //     c.i('COUNT QUERY RESULT');
    //     c.d(countResult);

    //     //update number of pages
    //     pagerParams = { ...pagerParams, records: countResult.count, pages: Math.ceil((countResult.count) / pagerParams.pageSize) };
    //     c.d(pagerParams);

    //     c.i('Return ReservationRepository > reservtionFindMany');
    //     return [reservations, pagerParams];
    // }


    async reservationCheckOut(id: string): Promise<void> {
        c.fs('ReservationRepository > reservationCheckOut');
        c.d(id);
        const session = await auth();
        const [reservationStatus]: ConfigEntity[] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RESERVATION_STATUS"),
                eq(configTable.value, "OUT")
            )
        ).limit(1);

        c.d(reservationStatus);

        await this.dbClient.db.update(reservationTable)
            .set({ reservationStatusId: reservationStatus.id, updatedBy: session.user.id })
            .where(eq(reservationTable.id, id));
        c.fe('ReservationRepository > reservationCheckOut');
    }


    // async reservationGetListCheckOut(searchParams: SearchParam[], pagerParams: PagerParams): Promise<[Reservation[], PagerParams]> {
    //     c.i('ReservationRepository > reservationCheckOutList');
    //     c.d(searchParams);
    //     c.d(pagerParams);

    //     const session = await auth();
    //     const [user]: UserEntity[] = await this.dbClient.db.select().from(userTable).where(eq(userTable.id, session.user.id)).limit(1);
    //     if (!user)
    //         throw new Error('Invalid login user.');
    //     //calculate offset
    //     const offset = pagerParams.pageSize * (pagerParams.pageIndex - 1);

    //     //const countQuery = {...pocoQuery, extras: {count: this.dbClient.db.$count(pocoQuery)}};
    //     const reservationTypeAlias = alias(configTable, 'reservation_type');
    //     const reservationStatusAlias = alias(configTable, 'reservation_status');
    //     const pickUpAlias = alias(configTable, 'pickUpAlias');
    //     const dropOffAlias = alias(configTable, 'dropOffAlias');

    //     let countQuery = this.dbClient.db.select({ count: count() })
    //         .from(reservationTable)
    //         .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
    //         .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
    //         .leftJoin(promotionTable, eq(promotionTable.id, reservationTable.promotionPackageId))
    //         .leftJoin(prepaidTable, eq(prepaidTable.id, reservationTable.prepaidPackageId))
    //         .leftJoin(pickUpAlias, eq(reservationTable.pickUpTypeId, pickUpAlias.id))
    //         .leftJoin(dropOffAlias, eq(reservationTable.dropOffTypeId, dropOffAlias.id))
    //         .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
    //         .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customerTable.id));

    //     let dataQuery = this.dbClient.db.select({
    //         ...reservationTable,
    //         customer: { ...customerTable },
    //         reservationStatus: reservationStatusAlias.value,
    //         reservationStatusText: reservationStatusAlias.text,
    //         reservationType: reservationTypeAlias.value,
    //         reservationTypeText: reservationTypeAlias.text,
    //         pickUpType: pickUpAlias.value,
    //         pickUpTypeText: pickUpAlias.text,
    //         dropOffType: dropOffAlias.value,
    //         dropOffTypeText: dropOffAlias.text,
    //         promotionPackage: promotionTable.value,
    //         promotionPackageText: promotionTable.text,
    //         prepaidPackage: prepaidTable.value,
    //         prepaidPackageText: prepaidTable.text
    //     })
    //         .from(reservationTable)
    //         .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
    //         .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
    //         .leftJoin(promotionTable, eq(promotionTable.id, reservationTable.promotionPackageId))
    //         .leftJoin(prepaidTable, eq(prepaidTable.id, reservationTable.prepaidPackageId))
    //         .leftJoin(pickUpAlias, eq(reservationTable.pickUpTypeId, pickUpAlias.id))
    //         .leftJoin(dropOffAlias, eq(reservationTable.dropOffTypeId, dropOffAlias.id))
    //         .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
    //         .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customerTable.id))
    //         .offset(offset)
    //         .limit(pagerParams.pageSize);

    //     if (searchParams && searchParams.length > 0) {
    //         const conditions = searchParams
    //             .map((searchParam: SearchParam) => {
    //                 if (searchParam.searchColumn === 'reservationStatus') {
    //                     return eq(reservationStatusAlias.value, searchParam.searchValue);
    //                 }
    //                 if (searchParam.searchColumn === 'reservationType') {
    //                     return eq(reservationTypeAlias.value, searchParam.searchValue);
    //                 }
    //                 if (searchParam.searchColumn === 'checkInDateUTC') {
    //                     let d: Date = new Date(searchParam.searchValue);
    //                     return eq(reservationTable.checkInDate, d);
    //                 }
    //                 if (searchParam.searchColumn === 'checkOutDateUTC') {
    //                     let d: Date = new Date(searchParam.searchValue);
    //                     return eq(reservationTable.checkOutDate, d);
    //                 }
    //                 if (searchParam.searchColumn === 'createdFrom') {
    //                     let d: Date = new Date(searchParam.searchValue);
    //                     return gte(reservationTable.createdAtUTC, d);
    //                 }
    //                 if (searchParam.searchColumn === 'createdUntil') {
    //                     const d = getMidNightDate(new Date(searchParam.searchValue));
    //                     return lte(reservationTable.createdAtUTC, d);
    //                 }
    //                 if (searchParam.searchColumn === 'name') {
    //                     return or(
    //                         like(customerTable.name, `%${searchParam.searchValue}%`),
    //                         like(customerTable.englishName, `%${searchParam.searchValue}%`)
    //                     );
    //                 }
    //                 if (searchParam.searchColumn === 'id') {
    //                     return like(reservationTable.id, `%${searchParam.searchValue}%`);
    //                 }
    //                 if (searchParam.searchColumn === 'remark') {
    //                     return like(reservationTable.remark, `%${searchParam.searchValue}%`);
    //                 }
    //                 if (searchParam.searchColumn === 'nationalId') {
    //                     return like(customerTable.nationalId, `%${searchParam.searchValue}%`);
    //                 }
    //                 if (searchParam.searchColumn === 'passport') {
    //                     return like(customerTable.passport, `%${searchParam.searchValue}%`);
    //                 }
    //                 if (searchParam.searchColumn === 'phone') {
    //                     return like(customerTable.phone, `%${searchParam.searchValue}%`);
    //                 }
    //                 return undefined;
    //             })
    //             .filter((condition): condition is Exclude<typeof condition, undefined> => condition !== undefined);

    //         if (conditions.length > 0) {
    //             countQuery.where(
    //                 and(
    //                     ...conditions,
    //                     eq(reservationTable.location, user.location),
    //                     or(
    //                         eq(reservationStatusAlias.value, 'CIN'),
    //                         eq(reservationStatusAlias.value, 'OUT')
    //                     )
    //                 ));
    //             dataQuery.where(
    //                 and(
    //                     ...conditions,
    //                     eq(reservationTable.location, user.location),
    //                     or(
    //                         eq(reservationStatusAlias.value, 'CIN'),
    //                         eq(reservationStatusAlias.value, 'OUT')
    //                     )
    //                 ));
    //         }
    //     }

    //     //order
    //     dataQuery.orderBy(pagerParams.orderDirection === 'desc' ? desc(reservationTable[pagerParams.orderBy as keyof ReservationEntity]) : asc(reservationTable[pagerParams.orderBy as keyof ReservationEntity]));
    //     const dataqueryresult = await dataQuery;
    //     c.d('dataqueryresult');
    //     c.d(dataqueryresult.length);
    //     c.d(dataQuery.toSQL());

    //     //transform to desired result
    //     const reservations = dataqueryresult?.reduce((acc: Reservation[], current: any) => {
    //         const { customer, ...reservation } = current;
    //         let rsvn = acc.find(r => r.id === current.id);
    //         if (!rsvn) {
    //             rsvn = reservation;
    //             rsvn!.customers = [];
    //             acc.push(rsvn!);
    //         }
    //         if (customer)
    //             rsvn?.customers?.push(customer);

    //         return acc;
    //     }, [] as Reservation[]);

    //     const [countResult] = await countQuery;
    //     c.i('COUNT QUERY RESULT');
    //     c.d(countResult);

    //     //update number of pages
    //     pagerParams = { ...pagerParams, records: countResult.count, pages: Math.ceil((countResult.count) / pagerParams.pageSize) };
    //     c.d(pagerParams);

    //     c.i('Return ReservationRepository > reservtionFindMany');
    //     return [reservations, pagerParams];
    // }



    async reservationCreate(reservation: Reservation, transaction?:TransactionType): Promise<Reservation> {
        c.fs("ReservationRepository > reservationCreate");
        c.d(reservation);
        const session = await auth();
        if (!session)
            throw new CustomError('Repository cannot find valid session');
        //retrieve current user
        const [user]: UserEntity[] = await this.dbClient.db.select().from(userTable)
            .where(eq(userTable.userName, session.user.name)).limit(1);
        if (!user) throw new CustomError('Repository cannot find valid user.');

        reservation = await this.reservationPrepare(reservation);
        reservation.createdBy = session.user.id;
        reservation.updatedBy = session.user.id;
        reservation.totalAmount = 0;
        reservation.paidAmount = 0;
        reservation.taxAmount = 0;
        reservation.netAmount = 0;
        reservation.dueAmount = 0;
        reservation.location = user.location;

        // Use transaction
        const operation =  async (tx: TransactionType) => {
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
                        createdBy: session.user.id,
                        updatedBy: session.user.id
                    };
                });
                c.d(newReservationCustomers?.length);
                //insert using transaction
                await tx.insert(reservationCustomerTable).values(newReservationCustomers as unknown as ReservationCustomerEntity[]);
            }
            return reservation;
        };

        let result : Reservation;
        if(transaction){
            result = await operation(transaction);
        }else{
            result = await this.dbClient.db.transaction(async (tx: TransactionType) => {
                await operation(tx);
            });
        }
        c.fe("ReservationRepository > reservationCreate");
        return result;
    }


    async reservationGetById(id: string): Promise<Reservation | undefined> {
        c.fs('ReservationRepository > reservationGetById');
        c.d(id);

        const reservationTypeAlias = alias(configTable, 'reservation_type');
        const reservationStatusAlias = alias(configTable, 'reservation_status');
        const pickUpAlias = alias(configTable, 'pickUpAlias');
        const dropOffAlias = alias(configTable, 'dropOffAlias');

        let dataQuery = this.dbClient.db.select({
            ...reservationTable,
            customer: { ...customerTable },
            bill: { ...billTable },
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
            .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customerTable.id))
            .leftJoin(billTable, eq(billTable.reservationId, reservationTable.id))
            .where(eq(reservationTable.id, id));

        const dataqueryresult = await dataQuery;

        //transform to desired result
        const [reservation] = dataqueryresult?.reduce((acc: Reservation[], current: any) => {
            const { customer, bill, ...reservation } = current;
            let rsvn = acc.find(r => r.id === current.id);
            if (!rsvn) {
                rsvn = reservation;
                rsvn.isSingleOccupancy = Boolean(reservation.isSingleOccupancy);
                rsvn.depositAmount = Number(reservation.depositAmount);
                rsvn.depositAmountInCurrency = Number(reservation.depositAmountInCurrency);
                rsvn.discountAmount = Number(reservation.discountAmount);
                rsvn.dropOfFee = Number(reservation.dropOffFee);
                rsvn.dueAmount = Number(reservation.dueAmount);
                rsvn.netAmount = Number(reservation.netAmount);
                rsvn.noOfDays = Number(reservation.noOfDays);
                rsvn.noOfGuests = Number(reservation.noOfGuests);
                rsvn.paidAmount = Number(reservation.paidAmount);
                rsvn.pickUpFee = Number(reservation.pickUpFee);
                rsvn.tax = Number(reservation.tax);
                rsvn.taxAmount = Number(reservation.taxAmount);
                rsvn.totalAmount = Number(reservation.totalAmount);
                rsvn.customers = [];
                rsvn.bills = [];
                acc.push(rsvn!);
            }
            if (customer) {
                let c = rsvn.customers.find(c => c.id == customer.id);
                if (!c) {
                    rsvn?.customers?.push(customer);
                }
            }
            if (bill) {
                let b = rsvn.bills.find(b => b.id === bill.id);
                if (!b) {
                    rsvn?.bills.push(bill);
                }
            }

            return acc;
        }, [] as Reservation[]);

        c.d(reservation);
        c.fe('ReservationRepository > reservationGetById');
        return reservation;
    }


    async reservationGetList(searchParams: SearchParam[], pagerParams: PagerParams): Promise<[Reservation[], PagerParams]> {
        c.fs('ReservationRepository > reservationGetList');
        c.d(searchParams);
        c.d(pagerParams);

        const session = await auth();
        const [user]: UserEntity[] = await this.dbClient.db.select().from(userTable).where(eq(userTable.id, session.user.id)).limit(1);
        if (!user)
            throw new Error('Invalid login user.');
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
            .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customerTable.id));

        let dataQuery = this.dbClient.db.select({
            ...reservationTable,
            customer: { ...customerTable },
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
            prepaidPackageText: prepaidTable.text
        })
            .from(reservationTable)
            .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
            .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
            .leftJoin(promotionTable, eq(promotionTable.id, reservationTable.promotionPackageId))
            .leftJoin(prepaidTable, eq(prepaidTable.id, reservationTable.prepaidPackageId))
            .leftJoin(pickUpAlias, eq(reservationTable.pickUpTypeId, pickUpAlias.id))
            .leftJoin(dropOffAlias, eq(reservationTable.dropOffTypeId, dropOffAlias.id))
            .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
            .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customerTable.id))
            .offset(offset)
            .limit(pagerParams.pageSize);

        if (searchParams && searchParams.length > 0) {
            const conditions = searchParams
                .map((searchParam: SearchParam) => {
                    if (searchParam.searchColumn === 'arrivalDateTime') {
                        const startDate = new Date(getUTCDateTimeString(searchParam.searchValue));
                        const endDate = getUTCDateMidNight(new Date(searchParam.searchValue));
                        return and(
                            gte(reservationTable.arrivalDateTime, startDate),
                            lte(reservationTable.arrivalDateTime, endDate)
                        );
                    }
                    if (searchParam.searchColumn === 'departureDateTime') {
                        const startDate = new Date(getUTCDateTimeString(searchParam.searchValue));
                        const endDate = getUTCDateMidNight(new Date(searchParam.searchValue));
                        return and(
                            gte(reservationTable.departureDateTime, startDate),
                            lte(reservationTable.departureDateTime, endDate)
                        );
                    }
                    if (searchParam.searchColumn === 'remark') {
                        return like(reservationTable.remark, `%${searchParam.searchValue}%`);
                    }
                    if (searchParam.searchColumn === 'reservationStatus') {
                        return eq(reservationStatusAlias.value, searchParam.searchValue);
                    }
                    if (searchParam.searchColumn === 'reservationType') {
                        return eq(reservationTypeAlias.value, searchParam.searchValue);
                    }
                    if (searchParam.searchColumn === 'checkInDate') {
                        let d: Date = new Date(getUTCDateTimeString(searchParam.searchValue));
                        return eq(reservationTable.checkInDate, d);
                    }
                    if (searchParam.searchColumn === 'checkOutDate') {
                        let d: Date = new Date(getUTCDateTimeString(searchParam.searchValue));
                        return eq(reservationTable.checkOutDate, d);
                    }
                    if (searchParam.searchColumn === 'createdFrom') {
                        let d: Date = new Date(getUTCDateTimeString(searchParam.searchValue));
                        return gte(reservationTable.createdAtUTC, d);
                    }
                    if (searchParam.searchColumn === 'createdUntil') {
                        let d: Date = new Date(getUTCDateTimeString(searchParam.searchValue));
                        d.setUTCHours(23, 59, 59, 999);
                        return lte(reservationTable.createdAtUTC, d);
                    }
                    if (searchParam.searchColumn === 'checkInDateFrom') {
                        let d: Date = new Date(getUTCDateTimeString(searchParam.searchValue));
                        return gte(reservationTable.checkInDate, d);
                    }
                    if (searchParam.searchColumn === 'checkInDateUntil') {
                        let d: Date = new Date(getUTCDateTimeString(searchParam.searchValue));
                        return lte(reservationTable.checkInDate, d);
                    }
                    if (searchParam.searchColumn === 'name') {
                        return or(
                            like(customerTable.name, `%${searchParam.searchValue}%`),
                            like(customerTable.englishName, `%${searchParam.searchValue}%`)
                        );
                    }
                    if (searchParam.searchColumn === 'id') {
                        return like(reservationTable.id, `%${searchParam.searchValue}%`);
                    }
                    if (searchParam.searchColumn === 'prepaidPackage') {
                        return eq(prepaidTable.value, searchParam.searchValue);
                    }
                    if (searchParam.searchColumn === 'promotionPackage') {
                        return eq(promotionTable.value, searchParam.searchValue);
                    }
                    if (searchParam.searchColumn === 'nationalId') {
                        return like(customerTable.nationalId, `%${searchParam.searchValue}%`);
                    }
                    if (searchParam.searchColumn === 'passport') {
                        return like(customerTable.passport, `%${searchParam.searchValue}%`);
                    }
                    if (searchParam.searchColumn === 'phone') {
                        return like(customerTable.phone, `%${searchParam.searchValue}%`);
                    }
                    return undefined;
                })
                .filter((condition): condition is Exclude<typeof condition, undefined> => condition !== undefined);

            if (conditions.length > 0) {
                countQuery.where(and(...conditions, eq(reservationTable.location, user.location)));
                dataQuery.where(and(...conditions, eq(reservationTable.location, user.location)));
            } else {
                countQuery.where(eq(reservationTable.location, user.location));
                dataQuery.where(eq(reservationTable.location, user.location));
            }
        } else {
            countQuery.where(eq(reservationTable.location, user.location));
            dataQuery.where(eq(reservationTable.location, user.location));
        }

        //order
        dataQuery.orderBy(pagerParams.orderDirection === 'desc' ? desc(reservationTable[pagerParams.orderBy as keyof ReservationEntity]) : asc(reservationTable[pagerParams.orderBy as keyof ReservationEntity]));
        const dataqueryresult = await dataQuery;
        c.d('dataqueryresult');
        c.d(dataqueryresult.length);
        c.d(dataQuery.toSQL());

        //transform to desired result
        const reservations = dataqueryresult?.reduce((acc: Reservation[], current: any) => {
            const { customer, ...reservation } = current;
            let rsvn = acc.find(r => r.id === current.id);
            if (!rsvn) {
                rsvn = reservation;
                rsvn.isSingleOccupancy = Boolean(reservation.isSingleOccupancy);
                rsvn.depositAmount = Number(reservation.depositAmount);
                rsvn.depositAmountInCurrency = Number(reservation.depositAmountInCurrency);
                rsvn.discountAmount = Number(reservation.discountAmount);
                rsvn.dropOfFee = Number(reservation.dropOffFee);
                rsvn.dueAmount = Number(reservation.dueAmount);
                rsvn.netAmount = Number(reservation.netAmount);
                rsvn.noOfDays = Number(reservation.noOfDays);
                rsvn.noOfGuests = Number(reservation.noOfGuests);
                rsvn.paidAmount = Number(reservation.paidAmount);
                rsvn.pickUpFee = Number(reservation.pickUpFee);
                rsvn.tax = Number(reservation.tax);
                rsvn.taxAmount = Number(reservation.taxAmount);
                rsvn.totalAmount = Number(reservation.totalAmount);
                rsvn!.customers = [];
                acc.push(rsvn!);
            }
            if (customer)
                rsvn?.customers?.push(customer);

            return acc;
        }, [] as Reservation[]);

        const [countResult] = await countQuery;
        c.i('COUNT QUERY RESULT');
        c.d(countResult);

        //update number of pages
        pagerParams = { ...pagerParams, records: countResult.count, pages: Math.ceil((countResult.count) / pagerParams.pageSize) };
        c.d(pagerParams);

        c.d(reservations.length);
        c.d(reservations.length > 0 ? reservations[0] : []);

        c.fe('ReservationRepository > reservationGetList');
        return [reservations, pagerParams];
    }



    reservationGetConditions(searchParams: SearchParam[]) {
        c.fs('ReservationRepository > reservationGetConditions');
        if (searchParams && searchParams.length > 0) {
            const reservationTypeAlias = alias(configTable, 'reservation_type');
            const reservationStatusAlias = alias(configTable, 'reservation_status');
            const pickUpAlias = alias(configTable, 'pickUpAlias');
            const dropOffAlias = alias(configTable, 'dropOffAlias');

            const conditions = searchParams
                .map((searchParam: SearchParam) => {
                    if (searchParam.searchColumn === 'reservationStatus') {
                        return eq(reservationStatusAlias.value, searchParam.searchValue);
                    }
                    if (searchParam.searchColumn === 'reservationType') {
                        return eq(reservationTypeAlias.value, searchParam.searchValue);
                    }
                    if (searchParam.searchColumn === 'checkInDateUTC') {
                        return eq(reservationTable.checkInDate, new Date(searchParam.searchValue));
                    }
                    if (searchParam.searchColumn === 'checkOutDateUTC') {
                        return eq(reservationTable.checkOutDate, new Date(searchParam.searchValue));
                    }
                    if (searchParam.searchColumn === 'createdFrom') {
                        return gte(reservationTable.createdAtUTC, new Date(searchParam.searchValue));
                    }
                    if (searchParam.searchColumn === 'createdUntil') {
                        let d: Date = new Date(searchParam.searchValue);
                        d.setUTCHours(23, 59, 59, 999);
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
            return conditions;
        }
        c.fe('ReservationRepository > reservationGetConditions');
    }


    reservationGetSelect() {
        c.fs('ReservationRepository > reservationGetSelect');
        const query = this.dbClient.db.select({
            ...reservationTable,
            customer: { ...customerTable },
            reservationStatus: this.reservationStatusAlias.value,
            reservationStatusText: this.reservationStatusAlias.text,
            reservationType: this.reservationTypeAlias.value,
            reservationTypeText: this.reservationTypeAlias.text,
            pickUpType: this.pickUpAlias.value,
            pickUpTypeText: this.pickUpAlias.text,
            dropOffType: this.dropOffAlias.value,
            dropOffTypeText: this.dropOffAlias.text,
            promotionPackage: promotionTable.value,
            promotionPackageText: promotionTable.text,
            prepaidPackage: prepaidTable.value,
            prepardPackageText: prepaidTable.text
        });
        c.fe('ReservationRepository > reservationGetSelect');
    }


    reservationGetQuery(q) {
        c.fs('ReservationRepository > reservationGetQuery');
        const reservationTypeAlias = alias(configTable, 'reservation_type');
        const reservationStatusAlias = alias(configTable, 'reservation_status');
        const pickUpAlias = alias(configTable, 'pickUpAlias');
        const dropOffAlias = alias(configTable, 'dropOffAlias');

        let query = q
            .from(reservationTable)
            .innerJoin(reservationTypeAlias, eq(reservationTable.reservationTypeId, reservationTypeAlias.id))
            .innerJoin(reservationStatusAlias, eq(reservationTable.reservationStatusId, reservationStatusAlias.id))
            .leftJoin(promotionTable, eq(promotionTable.id, reservationTable.promotionPackageId))
            .leftJoin(prepaidTable, eq(prepaidTable.id, reservationTable.prepaidPackageId))
            .leftJoin(pickUpAlias, eq(reservationTable.pickUpTypeId, pickUpAlias.id))
            .leftJoin(dropOffAlias, eq(reservationTable.dropOffTypeId, dropOffAlias.id))
            .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
            .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customerTable.id))
            ;
        c.fe('ReservationRepository > reservationGetQuery');
        return query;
    }


    // async reservationMoveRoom(id: string, roomNo: string, transaction?:TransactionType): Promise<void> {
    //     c.fs('ReservationRepository > reservationMoveRoom');
    //     c.d(id);
    //     c.d(roomNo);

    //     const session = await auth();
    //     if (!session)
    //         throw new CustomError('Repository cannot find valid session');
    //     //retrieve current user
    //     const [user]: UserEntity[] = await this.dbClient.db.select().from(userTable)
    //         .where(eq(userTable.userName, session.user.name)).limit(1);
    //     if (!user) throw new CustomError('Repository cannot find valid user.');

    //     c.i('retrieve new room info');
    //     const [room]: RoomEntity[] = await this.dbClient.db.select().from(roomTable).where(
    //         and(
    //             eq(roomTable.roomNo, roomNo),
    //             eq(roomTable.location, user.location)
    //         )
    //     ).limit(1);
    //     c.d(room);

    //     c.i('Retrieve reservation.');
    //     const [reservation]: ReservationEntity[] = await this.dbClient.db.select().from(reservationTable)
    //     .where(
    //         eq(reservationTable.id, id)
    //     ).limit(1);

        
    //     const operation = async (tx: TransactionType) => {
    //         c.i('Inside transaction');
    //         const date = new Date(new Date().toISOString());
    //         c.i('Update current roomReservation record');
    //         await tx.update(roomReservationTable)
    //             .set({ checkOutDate: date, updatedBy: session.user.id })
    //             .where(eq(roomReservationTable.reservationId, id));

    //         c.i('Create new roomReservation record');
    //         await tx.insert(roomReservationTable)
    //             .values(
    //                 {
    //                     reservationId: id,
    //                     roomId: room.id,
    //                     checkInDate: date,
    //                     checkOutDate: reservation.checkOutDate,
    //                     isSingleOccupancy: reservation.isSingleOccupancy,
    //                     createdBy: session.user.id,
    //                     updatedBy: session.user.id
    //                 });

    //         c.i('Update reservation table.');
    //         await tx.update(reservationTable)
    //             .set({ roomNo: roomNo })
    //             .where(eq(reservationTable.id, id));
    //     };
    //     if(transaction){
    //         await operation(transaction);
    //     }else{
    //         await this.dbClient.db.transaction(async (tx:TransactionType) => {
    //             await operation(tx);
    //         });
    //     }
    //     c.fe('ReservationRepository > reservationMoveRoom');
    // }


    async reservationPrepare(reservation: Reservation) {
        c.fs('ReservationRepository > reservationPrepare');
        //retrieve and assign prepaidPackageId
        const [prepaidPackage] = await this.dbClient.db.select().from(prepaidTable).where(
            eq(prepaidTable.value, reservation.prepaidPackage)
        ).limit(1);
        if (prepaidPackage)
            reservation.prepaidPackageId = prepaidPackage.id;
        else
            reservation.prepaidPackageId = null;

        //retrieve and assign promotionPackageId
        const [promotionPackage] = await this.dbClient.db.select().from(promotionTable).where(
            eq(promotionTable.value, reservation.promotionPackage)
        ).limit(1);
        if (promotionPackage)
            reservation.promotionPackageId = promotionPackage.id;
        else
            reservation.promotionPackageId = null;

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
        else
            reservation.pickUpTypeId = null;

        //retrieve and assign reservationTypeId
        const [dropOffType] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RIDE_TYPE"),
                eq(configTable.value, reservation.dropOffType)
            )
        ).limit(1);
        if (dropOffType)
            reservation.dropOffTypeId = dropOffType.id;
        else
            reservation.dropOffTypeId = null;


        c.d(reservation);
        c.fe('ReservationRepository > reservationPrepare');
        return reservation;
    }


    async reservationTranformData(result: Reservation[]) {
        c.fs('ReservationRepository > reservationTranformData');
        const reservations = result?.reduce((acc: Reservation[], current: any) => {
            const { customer, ...reservation } = current;
            let rsvn = acc.find(r => r.id === current.id);
            if (!rsvn) {
                rsvn = reservation;
                rsvn!.customers = [];
                acc.push(rsvn!);
            }
            if (customer)
                rsvn?.customers?.push(customer);

            return acc;
        }, [] as Reservation[]);

        c.fe('ReservationRepository > reservationTranformData');
        return reservations;
    }


    async reservationUpdate(id:string, reservation:Reservation, transaction?:TransactionType): Promise<Reservation> {
        c.fs("ReservationRepository > reservationUpdate");
        c.i(id);
        c.d(reservation);

        const session = await auth();

        if (!id || id === 'undefined') {
            throw new Error('Reservation update failed. Id is required.');
        }

        if (!reservation) {
            throw new Error('Reservation update failed. Reservation is required.');
        }

        const [user]: UserEntity[] = await this.dbClient.db.select()
            .from(userTable).where(eq(userTable.id, session.user.id)).limit(1);
        if (!user) throw new CustomError('Repository cannot find valid user.');

        reservation = await this.reservationPrepare(reservation);

        // Use transaction
        const operation = async (tx: TransactionType) => {
            c.i('Starting transaction.');

            c.i('Updating reservation.');
            reservation.updatedBy = session.user.id;
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
                        createdBy: session.user.id,
                        updatedBy: session.user.id
                    };
                });
                c.d(newReservationCustomers?.length);
                //insert using transaction
                await tx.insert(reservationCustomerTable).values(newReservationCustomers);
            }

        };

        if(transaction){
            await operation(transaction);
        }else{
            await this.dbClient.db.transaction(async (tx:TransactionType) => {
                await operation(tx);
            });
        }
        //const updatedReservation = await this.reservationGetById(reservation.id);
        c.fe("ReservationRepository > reservationUpdate");
        return reservation;
    }


    async roomAndReservationGetList(searchParams: SearchParam[]): Promise<Room[]> {
        c.fs('ReservationRepository > roomAndReservationGetList');
        c.d(searchParams);
        const session = await auth();
        if (!session)
            throw new CustomError('Repository cannot find valid session');
        //retrieve current user
        const [user]: UserEntity[] = await this.dbClient.db.select().from(userTable)
            .where(eq(userTable.userName, session.user.name)).limit(1);
        if (!user) throw new CustomError('Repository cannot find valid user.');

        const dataQuery = this.dbClient.db
            .select({
                room: {
                    ...roomTable,
                    roomType: roomTypeTable.roomType,
                    roomTypeText: roomTypeTable.roomTypeText
                },
                roomReservation: { ...roomReservationTable },
            })
            .from(roomTable)
            .innerJoin(roomTypeTable, eq(roomTypeTable.id, roomTable.roomTypeId))
            .leftJoin(roomReservationTable,
                or(
                    and(
                        eq(roomReservationTable.roomId, roomTable.id),
                        lte(roomReservationTable.checkInDate, new Date(searchParams[0].searchValue)),
                        gte(roomReservationTable.checkOutDate, new Date(searchParams[0].searchValue))
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
            ))
            .where(eq(roomTable.location, user.location))
            .orderBy(asc(roomTypeTable.roomType), asc(roomTable.roomNo));

        c.d(dataQuery.toSQL());
        const dataQueryResult = await dataQuery;

        const rooms = dataQueryResult?.reduce((acc: Room[], current: any) => {
            const { room, reservation } = current;
            let currentRoom = acc.find(r => r.id === room.id);
            if (!currentRoom) {
                currentRoom = room;
                currentRoom!.reservations = [];
                acc.push(currentRoom!);
            }
            if (reservation)
                currentRoom?.reservations?.push(reservation);

            return acc;
        }, [] as Room[]);

        c.d(rooms.length);
        c.d(rooms.length > 0 ? rooms[0] : []);

        c.fs('ReservationRepository > roomAndReservationGetList');
        return rooms;
    }


    async roomChargeGetListById(reservationId: string): Promise<RoomCharge[]> {
        c.fs('ReservationRepository > roomChargeGetListById');
        const result = await this.dbClient.db.select()
            .from(roomChargeTable)
            .innerJoin(roomTypeTable, eq(roomTypeTable.id, roomChargeTable.roomTypeId))
            .innerJoin(roomTable, eq(roomTable.id, roomChargeTable.roomId))
            .where(eq(roomChargeTable.reservationId, reservationId))
            .orderBy(asc(roomChargeTable.startDate));

        const roomCharges: RoomCharge[] = result?.map((row: { roomCharge: RoomChargeEntity, roomType: RoomTypeEntity, room: RoomEntity }) => {
            const rc = new RoomCharge();
            rc.id = row.roomCharge.id;
            rc.endDate = row.roomCharge.endDate;
            rc.extraBedRate = Number(row.roomCharge.extraBedRate);
            rc.noOfDays = Number(row.roomCharge.noOfDays);
            rc.reservationId = row.roomCharge.reservationId;
            rc.roomId = row.roomCharge.roomId;
            rc.roomNo = row.room.roomNo;
            rc.roomRate = Number(row.roomCharge.roomRate);
            rc.roomSurcharge = Number(row.roomCharge.roomSurcharge);
            rc.roomType = row.roomType.roomType;
            rc.roomTypeId = row.roomCharge.roomTypeId;
            rc.roomTypeText = row.roomType.roomTypeText;
            rc.seasonSurcharge = Number(row.roomCharge.seasonSurcharge);
            rc.singleRate = Number(row.roomCharge.singleRate);
            rc.startDate = row.roomCharge.startDate;
            rc.totalAmount = Number(row.roomCharge.totalAmount);
            rc.totalRate = Number(row.roomCharge.totalRate);
            rc.createdAtUTC = row.roomCharge.createdAtUTC;
            rc.createdBy = row.roomCharge.createdBy;
            rc.updatedAtUTC = row.roomCharge.updatedAtUTC;
            rc.updatedBy = row.roomCharge.updatedBy;
            return rc;
        });

        c.d(roomCharges.length);
        c.d(roomCharges.length > 0 ? roomCharges[0] : []);
        c.fs('ReservationRepository > roomChargeGetListById');
        return roomCharges;
    }


    async roomChargeUpdateList(reservationId:string, roomCharges:RoomCharge[], transaction?:TransactionType): Promise<boolean> {
        c.fs('ReservationRepository > roomChargeUpdateList');
        const session = await auth();
        roomCharges.forEach(rc => {
            rc.createdBy = session.user.id;
            rc.updatedBy = session.user.id
        })
        const operation = async (tx: TransactionType) => {
            await tx.delete(roomChargeTable).where(eq(roomChargeTable.reservationId, reservationId));
            await tx.insert(roomChargeTable).values(roomCharges as unknown as RoomChargeEntity[]);
            return true;
        };
        let result: boolean | PromiseLike<boolean>;
        if(transaction){
            result = await operation(transaction);
        }else{
            result = await this.dbClient.db.transaction(async (tx:TransactionType) => {
                return await operation(tx);
            });
        }
        c.fe('ReservationRepository > roomChargeUpdateList');
        return result;
    }


    async roomRateGetAll(location: string): Promise<RoomRate[]> {
        c.fs('ReservationRepository > roomRateGetAll');
        const result: RoomRateEntity[] = await this.dbClient.db.select()
            .from(roomRateTable).where(eq(roomRateTable.location, location));

        const roomRates: RoomRate[] = result.map((rr: RoomRateEntity) => {
            let roomRate = new RoomRate();
            roomRate.id = rr.id;
            roomRate.extraBedRate = Number(rr.extraBedRate);
            roomRate.location = rr.location;
            roomRate.month = Number(rr.month);
            roomRate.roomRate = Number(rr.roomRate);
            roomRate.roomSurcharge = Number(rr.roomSurcharge);
            roomRate.roomTypeId = rr.roomTypeId;
            roomRate.seasonSurcharge = Number(rr.seasonSurcharge);
            roomRate.singleRate = Number(rr.singleRate);
            roomRate.createdAtUTC = rr.createdAtUTC;
            roomRate.createdBy = rr.createdBy;
            roomRate.updatedAtUTC = rr.updatedAtUTC;
            roomRate.updatedBy = rr.updatedBy;
            return roomRate;
        });

        c.d(roomRates.length);
        c.d(roomRates.length > 0 ? roomRates[0] : []);
        c.fe('ReservationRepository > roomRateGetAll');
        return roomRates;
    }


    async roomReservationGetListById(reservationId: string, includeChildren: boolean = false): Promise<RoomReservation[]> {
        c.fs('ReservationRepository > roomReservationGetListById');
        c.d(reservationId);
        const session = await auth();
        if (!session)
            throw new CustomError('Repository cannot find valid session.');
        //retrieve current user
        const [user]: UserEntity[] = await this.dbClient.db.select().from(userTable)
            .where(eq(userTable.userName, session.user.name)).limit(1);
        if (!user) throw new CustomError('Repository cannot find valid user.');

        const result = await this.dbClient.db
            .select()
            .from(roomReservationTable)
            .innerJoin(roomTable, eq(roomTable.id, roomReservationTable.roomId))
            .innerJoin(roomTypeTable, eq(roomTypeTable.id, roomTable.roomTypeId))
            .leftJoin(roomChargeTable, and(
                eq(roomChargeTable.reservationId, roomReservationTable.reservationId),
                eq(roomChargeTable.roomId, roomReservationTable.roomId)
            ))
            .where(and(
                eq(roomReservationTable.reservationId, reservationId),
                eq(roomTypeTable.location, user.location),
                eq(roomTable.location, user.location)
            )).orderBy(asc(roomReservationTable.checkInDate), asc(roomChargeTable.startDate));

        const roomReservations = result?.reduce((acc: RoomReservation[], row: { roomReservation: RoomReservationEntity, roomCharge: RoomChargeEntity, roomType: RoomTypeEntity, room: RoomEntity }) => {
            let roomReservation = acc.find(entry => entry.id === row.roomReservation.id);

            if (!roomReservation) {
                roomReservation = new RoomReservation();
                roomReservation.id = row.roomReservation.id;
                roomReservation.checkInDate = row.roomReservation.checkInDate;
                roomReservation.checkOutDate = row.roomReservation.checkOutDate;
                roomReservation.isSingleOccupancy = Boolean(row.roomReservation.isSingleOccupancy);
                roomReservation.noOfExtraBed = row.roomReservation.noOfExtraBed;
                roomReservation.reservationId = row.roomReservation.reservationId;
                roomReservation.roomId = row.roomReservation.roomId;
                roomReservation.roomNo = row.room.roomNo;
                roomReservation.roomType = row.roomType.roomTypeText;
                roomReservation.roomTypeId = row.roomType.id;
                roomReservation.createdAtUTC = row.roomReservation.createdAtUTC;
                roomReservation.createdBy = row.roomReservation.createdBy;
                roomReservation.updatedAtUTC = row.roomReservation.updatedAtUTC;
                roomReservation.updatedBy = row.roomReservation.updatedBy;
                acc.push(roomReservation);
            }

            if (includeChildren && row.roomCharge) {
                const roomCharge = new RoomCharge();
                roomCharge.id = row.roomCharge.id;
                roomCharge.reservationId = row.roomCharge.reservationId;
                roomCharge.startDate = row.roomCharge.startDate;
                roomCharge.endDate = row.roomCharge.endDate;
                roomCharge.extraBedRate = Number(row.roomCharge.extraBedRate);
                roomCharge.noOfDays = Number(row.roomCharge.noOfDays);
                roomCharge.roomId = row.roomCharge.roomId;
                roomCharge.roomNo = row.room.roomNo;
                roomCharge.roomRate = Number(row.roomCharge.roomRate);
                roomCharge.roomSurcharge = Number(row.roomCharge.roomSurcharge);
                roomCharge.roomType = row.roomType.roomTypeText;
                roomCharge.roomTypeId = row.roomCharge.roomTypeId;
                roomCharge.singleRate = Number(row.roomCharge.singleRate);
                roomCharge.seasonSurcharge = Number(row.roomCharge.seasonSurcharge);
                roomCharge.totalAmount = Number(row.roomCharge.totalAmount);
                roomCharge.totalRate = Number(row.roomCharge.totalRate);
                roomCharge.createdAtUTC = row.roomCharge.createdAtUTC;
                roomCharge.createdBy = row.roomCharge.createdBy;
                roomCharge.updatedAtUTC = row.roomCharge.updatedAtUTC;
                roomCharge.updatedBy = row.roomCharge.updatedBy;
                roomReservation.roomCharges.push(roomCharge);
            }

            return acc;
        }, [] as RoomReservation[]);


        c.d(roomReservations.lengt);
        c.d(roomReservations.length > 0 ? roomReservations[0] : []);
        c.fe('ReservationRepository > roomReservationGetListById');
        return roomReservations;
    }


    async roomReservationUpdateList(reservationId:string, roomReservations:RoomReservation[], transaction?:TransactionType): Promise<boolean> {
        c.fs('ReservationRepository > roomReservationUpdateList');
        c.d(roomReservations);
        const session = await auth();

        if (!session)
            throw new CustomError('Repository cannot find valid session');
        //retrieve current user
        const [user]: UserEntity[] = await this.dbClient.db.select().from(userTable)
            .where(eq(userTable.userName, session.user.name)).limit(1);
        if (!user) throw new CustomError('Repository cannot find valid user.');
        
        //retrieve original reservation
        const reservation: Reservation = await this.reservationGetById(reservationId);
        if (!reservation)
            throw new CustomError('Cannot find reservation in repository.');

        //if list is empty, delete all room reservations and room charges
        if (roomReservations.length === 0) {
            const operation = async (tx: TransactionType) => {
                await tx.delete(roomChargeTable).where(eq(roomChargeTable.reservationId, reservationId));
                await tx.delete(roomReservationTable).where(eq(roomReservationTable.reservationId, reservationId));
                await tx.update(reservationTable).set({ totalAmount: '0', taxAmount:'0', roomNo: '', dueAmount:'0', updatedBy: session.user.id })
                    .where(eq(reservationTable.id, reservationId));
                return true;
            };
            if(transaction){
                return await operation(transaction);
            }else{
                return await this.dbClient.db.transaction(async (tx:TransactionType) => {
                    return await operation(tx);
                });
            }
        }

        const operation = async (tx: TransactionType) => {
            //sort roomReservations by checkInDateUTC ascending
            const sortedRoomReservations = roomReservations.sort((a, b) => a.checkInDate.getTime() - b.checkInDate.getTime());

            //update total room charges and room no
            const totalRoomCharges = sortedRoomReservations.filter(rr => rr.modelState !== 'deleted')
            .flatMap(rr => rr.roomCharges.filter(rc => rc.modelState !== 'deleted'))
            .reduce((sum, rc) => sum + Number(rc.totalAmount), 0);
            const taxAmount = totalRoomCharges * Number(reservation.tax) / 100;
            const netAmount = totalRoomCharges + taxAmount - reservation.depositAmount - reservation.discountAmount;
            const dueAmount = netAmount - Number(reservation.paidAmount);

            await tx.update(reservationTable).set(
                { totalAmount: totalRoomCharges.toString(), taxAmount:taxAmount.toString(), netAmount: netAmount.toString(), dueAmount:dueAmount.toString(), roomNo: sortedRoomReservations[0].roomNo, updatedBy: session.user.id }
            )
                .where(eq(reservationTable.id, reservationId));

            for(const roomReservation of sortedRoomReservations) {
                const [room] : RoomEntity[] = await this.dbClient.db.select().from(roomTable)
                .where(eq(roomTable.roomNo, roomReservation.roomNo)).limit(1);
                if(!room)
                    throw new CustomError('Room number is invalid in repository.');

                if(roomReservation.modelState === "deleted"){
                    await tx.delete(roomChargeTable).where(
                        and(
                            eq(roomChargeTable.roomId, roomReservation.roomId),
                            eq(roomChargeTable.reservationId, reservationId)
                        ));
                    await tx.delete(roomReservationTable).where(eq(roomReservationTable.id, roomReservation.id));
                }else if(roomReservation.modelState === "inserted"){
                    roomReservation.roomId = room.id;
                    roomReservation.createdBy = session.user.id;
                    roomReservation.updatedBy = session.user.id;
                    const insertedId = await tx.insert(roomReservationTable).values(roomReservation as unknown as RoomReservationEntity).$returningId();

                    for(const roomCharge of roomReservation.roomCharges){
                        roomCharge.roomId = room.id;
                        roomCharge.roomTypeId = room.roomTypeId;
                        roomCharge.reservationId = reservationId;
                        roomCharge.createdBy = session.user.id;
                        roomCharge.updatedBy = session.user.id;
                    }
                    if(roomReservation.roomCharges.length > 0)
                        await tx.insert(roomChargeTable).values(roomReservation.roomCharges as unknown as RoomChargeEntity[]);
                }else if(roomReservation.modelState === "updated"){
                    roomReservation.roomId = room.id;
                    roomReservation.updatedBy = session.user.id;
                    await tx.update(roomReservationTable).set(roomReservation as unknown as RoomReservationEntity)
                        .where(eq(roomReservationTable.id, roomReservation.id));

                    for(const roomCharge of roomReservation.roomCharges){
                        if(roomCharge.modelState === "deleted"){
                            await tx.delete(roomChargeTable).where(eq(roomChargeTable.id, roomCharge.id));
                        }else if(roomCharge.modelState === "inserted"){
                            roomCharge.roomId = room.id;
                            roomCharge.roomTypeId = room.roomTypeId;
                            roomCharge.reservationId = reservationId;
                            roomCharge.createdBy = session.user.id;
                            roomCharge.updatedBy = session.user.id;
                            await tx.insert(roomChargeTable).values(roomCharge as unknown as RoomChargeEntity);
                        }else if(roomCharge.modelState === "updated"){
                            roomCharge.roomId = room.id;
                            roomCharge.roomTypeId = room.roomTypeId;
                            roomCharge.reservationId = reservationId;
                            roomCharge.updatedBy = session.user.id;
                            await tx.update(roomChargeTable).set(roomCharge as unknown as RoomChargeEntity)
                                .where(eq(roomChargeTable.id, roomCharge.id));
                        }
                    }
                }else{
                    for(const roomCharge of roomReservation.roomCharges){
                        if(roomCharge.modelState === "deleted"){
                            await tx.delete(roomChargeTable).where(eq(roomChargeTable.id, roomCharge.id));
                        }else if(roomCharge.modelState === "inserted"){
                            roomCharge.roomId = room.id;
                            roomCharge.roomTypeId = room.roomTypeId;
                            roomCharge.reservationId = reservationId;
                            roomCharge.createdBy = session.user.id;
                            roomCharge.updatedBy = session.user.id;
                            await tx.insert(roomChargeTable).values(roomCharge as unknown as RoomChargeEntity);
                        }else if(roomCharge.modelState === "updated"){
                            roomCharge.roomId = room.id;
                            roomCharge.roomTypeId = room.roomTypeId;
                            roomCharge.reservationId = reservationId;
                            roomCharge.updatedBy = session.user.id;
                            await tx.update(roomChargeTable).set(roomCharge as unknown as RoomChargeEntity)
                                .where(eq(roomChargeTable.id, roomCharge.id));
                        }
                    }
                }
            }
            return true;
        };

        let result: boolean | PromiseLike<boolean>;
        if(transaction){
            result = await operation(transaction);
        }else{
            result = await this.dbClient.db.transaction(async (tx:TransactionType) => {
                await operation(tx);
            });
        }

        c.fe('ReservationRepository > roomReservationUpdateList');
        return result;
    }


    async roomScheduleGetList(searchParams: SearchParam[]): Promise<Room[]> {
        c.fs('ReservationRepository > roomScheduleGetList');
        c.d(searchParams);

        const session = await auth();
        if (!session)
            throw new CustomError('Repository cannot find valid session');
        //retrieve current user
        const [user]: UserEntity[] = await this.dbClient.db.select().from(userTable)
            .where(eq(userTable.userName, session.user.name)).limit(1);
        if (!user) throw new CustomError('Repository cannot find valid user.');

        //build conditions first for join
        let start: Date, end: Date;
        searchParams.forEach((searchParam: SearchParam) => {
            if (searchParam.searchColumn === 'checkInDateFrom') {
                start = new Date(searchParam.searchValue);
            }
            if (searchParam.searchColumn === 'checkInDateUntil') {
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
                            between(roomReservationTable.checkInDate, start!, end!),
                            between(roomReservationTable.checkOutDate, start!, end!),
                            and(
                                lte(roomReservationTable.checkInDate, start!),
                                gte(roomReservationTable.checkOutDate, end!)
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
                            between(reservationTable.checkInDate, start!, end!),
                            between(reservationTable.checkOutDate, start!, end!),
                            and(
                                lte(reservationTable.checkInDate, start!),
                                gte(reservationTable.checkOutDate, end!)
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
            ))
            .where(and(
                eq(reservationTable.location, user.location),
                eq(roomTable.location, user.location)
            ));

        //c.d(dataQuery.toSQL());
        const dataQueryResult = await dataQuery;
        c.d(dataQueryResult?.length);

        const rooms = dataQueryResult?.reduce((acc: Room[], current: any) => {
            const { room, roomReservation, reservation } = current;
            let currentRoom = acc.find(r => r.id === room.id);
            if (!currentRoom) {
                currentRoom = room;
                currentRoom!.reservations = [];
                currentRoom!.roomReservations = [];
                acc.push(currentRoom!);
            }
            if (reservation)
                currentRoom?.reservations?.push(reservation);
            if (roomReservation)
                currentRoom?.roomReservations?.push(roomReservation);

            return acc;
        }, [] as Room[]);

        c.d(rooms.length);
        c.d(rooms.length > 0 ? rooms[0] : []);
        c.fe('ReservationRepository > roomScheduleGetList');
        return rooms;
    }


    async roomTypeGetAll(location: string): Promise<RoomType[]> {
        c.fs('ReservationRepository > roomTypeGetAll');
        const result: RoomTypeEntity[] = await this.dbClient.db.select()
            .from(roomTypeTable).where(eq(roomTypeTable.location, location));
        const roomTypes: RoomType[] = result.map(rte => {
            const rt = new RoomType();
            Object.assign(rt, rte);
            return rt;
        });

        c.d(roomTypes.length);
        c.d(roomTypes.length > 0 ? roomTypes[0] : []);
        c.fe('ReservationRepository > roomTypeGetAll');
        return roomTypes;
    }


    async reservationUpdateDropOffInfo(id:string, carNo:string, driver:string, transaction?:TransactionType): Promise<void> {
        c.fs('ReservationRepository > reservationUpdateDropOffInfo');
        if (!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');
        if (!carNo || carNo === 'undefined')
            throw new Error('Car number update failed. Car number is required.');

        const session = await auth();

        c.i('Retrieve reservation');
        const [reservation]: ReservationEntity[] = await this.dbClient.db.select().from(reservationTable)
            .where(eq(reservationTable.id, id)).limit(1);
        c.d(reservation);

        if (!reservation)
            throw new Error('Cannot find reservation.');

        c.i('Update reservation');
        let query = this.dbClient.db.update(reservationTable).set(
            {
                dropOffCarNo: carNo,
                dropOffDriver: driver,
                updatedBy: session.user.id
            })
            .where(eq(reservationTable.id, id));

        if(transaction)
            await transaction.execute(query);
        else
            await query;
        

        c.i('Return ReservationRepository > updateDropOffCarNo');
    }


    async reservationUpdatePickUpInfo(id:string, carNo:string, driver:string, transaction?:TransactionType): Promise<void> {
        c.i('ReservationRepository > updatePickUpCarNo');
        if (!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');
        if (!carNo || carNo === 'undefined')
            throw new Error('Car number update failed. Car number is required.');

        const session = await auth();

        c.i('Retrieve reservation');
        const [reservation]: ReservationEntity[] = await this.dbClient.db.select().from(reservationTable)
            .where(eq(reservationTable.id, id)).limit(1);
        c.d(reservation);

        if (!reservation)
            throw new Error('Cannot find reservation.');

        c.i('Update reservation');
        let query = this.dbClient.db.update(reservationTable)
            .set(
                {
                    pickUpCarNo: carNo,
                    pickUpDriver: driver,
                    updatedBy: session.user.id
                })
            .where(eq(reservationTable.id, id));

        if(transaction)
            await transaction.execute(query);
        else
            await query;

        c.fe('ReservationRepository > reservationUpdateDropOffInfo');
    }
}