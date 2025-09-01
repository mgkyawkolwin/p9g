import { configTable, ReservationEntity, reservationTable, reservationCustomerTable, prepaidTable, promotionTable, customerTable, ConfigEntity, roomTable, roomReservationTable, RoomReservationEntity, ReservationCustomerEntity, billTable, BillEntity, userTable, paymentTable, PaymentEntity, roomChargeTable, roomRateTable, roomTypeTable, RoomChargeEntity, RoomTypeEntity, RoomEntity, RoomRateEntity, UserEntity } from "@/data/orm/drizzle/mysql/schema";
import IReservationRepository from "../contracts/IReservationRepository";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/data/db/IDatabase";
import { PagerParams, SearchParam, TYPES } from "@/lib/types";
import { Repository } from "./Repository";
import c from "@/lib/core/logger/ConsoleLogger";
import { SQL, and, count, asc, desc, eq, ne, gte, between, lte, or, like, isNull, sum } from "drizzle-orm";
import Reservation from "@/domain/models/Reservation";
import { TransactionType } from "@/data/orm/drizzle/mysql/db";
import { alias } from "drizzle-orm/mysql-core";
import Room from "@/domain/models/Room";
import RoomReservation from "@/domain/models/RoomReservation";
import { auth } from "@/app/auth";
import Bill from "@/domain/models/Bill";
import { CustomError } from "@/lib/errors";
import { HttpStatusCode } from "@/lib/constants";
import Payment from "@/domain/models/Payment";
import RoomCharge from "@/domain/models/RoomCharge";
import RoomRate from "@/domain/models/RoomRate";
import RoomType from "@/domain/models/RoomType";
import { getMidNightDate } from "@/lib/utils";


@injectable()
export default class ReservationRepository extends Repository<Reservation, typeof reservationTable> implements IReservationRepository {

    reservationTypeAlias = alias(configTable, 'reservation_type');
    reservationStatusAlias = alias(configTable, 'reservation_status');
    pickUpAlias = alias(configTable, 'pickUpAlias');
    dropOffAlias = alias(configTable, 'dropOffAlias');

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, reservationTable);
    }


    async billDelete(reservationId: string, billId: string): Promise<void> {
        if (!reservationId) throw new CustomError('Reservation id is required.');
        if (!billId) throw new CustomError('Bill id is required.');

        const session = await auth();

        await this.dbClient.db.delete(billTable)
            .where(and(
                eq(billTable.reservationId, reservationId),
                eq(billTable.id, billId)
            ));
    }


    async billGetListById(reservationId: string): Promise<Bill[]> {
        c.i('ReservationRepository > billsGetAll');
        const result: BillEntity[] = await this.dbClient.db.select().from(billTable).where(eq(billTable.reservationId, reservationId));

        c.i('original')
        c.d(result);
        const bills: Bill[] = result.map((b: BillEntity) => {
            const bill = new Bill();
            bill.id = b.id;
            bill.reservationId = b.reservationId;
            bill.amount = Number(b.amount);
            bill.currency = b.currency;
            bill.dateUTC = b.dateUTC;
            bill.isPaid = Boolean(b.isPaid);
            bill.itemName = b.itemName;
            bill.paidOnUTC = b.paidOnUTC;
            bill.paymentMode = b.paymentMode;
            bill.paymentType = b.paymentType;
            bill.quantity = Number(b.quantity);
            bill.unitPrice = Number(b.unitPrice);
            bill.createdAtUTC = b.createdAtUTC;
            bill.createdBy = b.createdBy;
            bill.updatedAtUTC = b.updatedAtUTC;
            bill.updatedBy = b.updatedBy;
            //bills.push(bill);
            return bill;
        }); c.i('BILLS')
        c.d(bills);
        return bills;
    }


    async billGetListPaid(reservationId: string): Promise<Bill[]> {
        c.i('ReservationRepository > billsGetPaids');
        const result: BillEntity[] = await this.dbClient.db.select().from(billTable)
            .where(and(
                eq(billTable.reservationId, reservationId),
                eq(billTable.isPaid, true)
            ));

        const bills: Bill[] = result.map((b: BillEntity) => {
            const bill = new Bill();
            bill.id = b.id;
            bill.amount = Number(b.amount);
            bill.currency = b.currency;
            bill.dateUTC = b.dateUTC;
            bill.isPaid = Boolean(b.isPaid);
            bill.itemName = b.itemName;
            bill.paidOnUTC = b.paidOnUTC;
            bill.paymentMode = b.paymentMode;
            bill.paymentType = b.paymentType;
            bill.quantity = Number(b.quantity);
            bill.unitPrice = Number(b.unitPrice);
            bill.createdAtUTC = b.createdAtUTC;
            bill.createdBy = b.createdBy;
            bill.updatedAtUTC = b.updatedAtUTC;
            bill.updatedBy = b.updatedBy;
            // bills.push(bill);
            return bill;
        });
        return bills;
    }


    async billGetListUnpaid(reservationId: string): Promise<Bill[]> {
        c.i('ReservationRepository > billsGetUnPaids');
        const result: BillEntity[] = await this.dbClient.db.select().from(billTable)
            .where(and(
                eq(billTable.reservationId, reservationId),
                eq(billTable.isPaid, false)
            ));

        const bills: Bill[] = result.map((b: BillEntity) => {
            const bill = new Bill();
            bill.id = b.id;
            bill.amount = Number(b.amount);
            bill.currency = b.currency;
            bill.dateUTC = b.dateUTC;
            bill.isPaid = Boolean(b.isPaid);
            bill.itemName = b.itemName;
            bill.paidOnUTC = b.paidOnUTC;
            bill.paymentMode = b.paymentMode;
            bill.paymentType = b.paymentType;
            bill.quantity = Number(b.quantity);
            bill.unitPrice = Number(b.unitPrice);
            bill.createdAtUTC = b.createdAtUTC;
            bill.createdBy = b.createdBy;
            bill.updatedAtUTC = b.updatedAtUTC;
            bill.updatedBy = b.updatedBy;
            //bills.push(bill);
            return bill;
        });
        return bills;
    }


    async billUpdateList(reservationId: string, bills: Bill[]): Promise<void> {
        c.i('ReservationRepository > billsSave');
        c.d(bills);
        const session = await auth();

        //get list to update and insert
        const updateList = bills.filter(p => typeof p.id !== 'undefined');
        const insertList = bills.filter(p => typeof p.id === 'undefined');

        updateList.forEach(bill => {
            bill.updatedBy = session.user.id;
        });

        insertList.forEach(bill => {
            bill.createdBy = session.user.id;
            bill.updatedBy = session.user.id;
        });

        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            //update existing records
            updateList.forEach(async bill => {
                const usql = tx.update(billTable).set(bill as unknown as BillEntity)
                    .where(eq(billTable.id, bill.id));
                c.d(usql.toSQL());
                await usql;
            });

            //insert new records
            if (insertList && insertList.length >= 1) {
                const msql = tx.insert(billTable).values(insertList as unknown as BillEntity[]);
                c.d(msql.toSQL());
                await msql;
            }

        });
        c.i('Return > ReservationRepository > billsSave');
    }


    async paymentDelete(reservationId: string, paymentId: string): Promise<void> {
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
    }


    async paymentGetListById(reservationId: string): Promise<Payment[]> {
        c.i('ReservationRepository > paymentsGetAll');
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

        return payments;

    }


    async paymentUpdateList(reservationId: string, payments: Payment[]): Promise<void> {
        c.i('ReservationRepository > paymentsSave');
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

        c.i('Return > ReservationRepository > paymentsSave');
    }


    async reservationCancel(id: string): Promise<void> {
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
        const [reservationStatus]: ConfigEntity[] = await this.dbClient.db.select().from(configTable).where(
            and(
                eq(configTable.group, "RESERVATION_STATUS"),
                eq(configTable.value, "CCL")
            )
        ).limit(1);

        c.d(reservationStatus);

        await this.dbClient.db.update(reservationTable)
            .set({ reservationStatusId: reservationStatus.id, updatedBy: session.user.id })
            .where(eq(reservationTable.id, id));
        c.i('Return from ReservationRepository > cancel');
    }


    async reservationCheckIn(id: string): Promise<void> {
        c.i('ReservationRepository > checkIn');
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
        c.i('Return from ReservationRepository > checkIn');
    }


    async reservationGetListCheckIn(searchParams: SearchParam[], pagerParams: PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('ReservationRepository > reservationCheckInList');
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
                    if (searchParam.searchColumn === 'reservationStatus') {
                        return eq(reservationStatusAlias.value, searchParam.searchValue);
                    }
                    if (searchParam.searchColumn === 'reservationType') {
                        return eq(reservationTypeAlias.value, searchParam.searchValue);
                    }
                    if (searchParam.searchColumn === 'checkInDateUTC') {
                        let d: Date = new Date(searchParam.searchValue);
                        return eq(reservationTable.checkInDateUTC, d);
                    }
                    if (searchParam.searchColumn === 'checkOutDateUTC') {
                        let d: Date = new Date(searchParam.searchValue);
                        return eq(reservationTable.checkOutDateUTC, d);
                    }
                    if (searchParam.searchColumn === 'createdFrom') {
                        let d: Date = new Date(searchParam.searchValue);
                        return gte(reservationTable.createdAtUTC, d);
                    }
                    if (searchParam.searchColumn === 'createdUntil') {
                        const d = getMidNightDate(new Date(searchParam.searchValue));
                        return lte(reservationTable.createdAtUTC, d);
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
                    if (searchParam.searchColumn === 'remark') {
                        return like(reservationTable.remark, `%${searchParam.searchValue}%`);
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
                countQuery.where(
                    and(
                        ...conditions,
                        eq(reservationTable.location, user.location),
                        or(
                            eq(reservationStatusAlias.value, 'CIN'),
                            eq(reservationStatusAlias.value, 'NEW')
                        )
                    ));
                dataQuery.where(
                    and(
                        ...conditions,
                        eq(reservationTable.location, user.location),
                        or(
                            eq(reservationStatusAlias.value, 'CIN'),
                            eq(reservationStatusAlias.value, 'NEW')
                        )
                    ));
            }
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

        c.i('Return ReservationRepository > reservtionFindMany');
        return [reservations, pagerParams];
    }


    async reservationCheckOut(id: string): Promise<void> {
        c.i('ReservationRepository > checkOut');
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
        c.i('Return from ReservationRepository > checkOut');
    }


    async reservationGetListCheckOut(searchParams: SearchParam[], pagerParams: PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('ReservationRepository > reservationCheckOutList');
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
                    if (searchParam.searchColumn === 'reservationStatus') {
                        return eq(reservationStatusAlias.value, searchParam.searchValue);
                    }
                    if (searchParam.searchColumn === 'reservationType') {
                        return eq(reservationTypeAlias.value, searchParam.searchValue);
                    }
                    if (searchParam.searchColumn === 'checkInDateUTC') {
                        let d: Date = new Date(searchParam.searchValue);
                        return eq(reservationTable.checkInDateUTC, d);
                    }
                    if (searchParam.searchColumn === 'checkOutDateUTC') {
                        let d: Date = new Date(searchParam.searchValue);
                        return eq(reservationTable.checkOutDateUTC, d);
                    }
                    if (searchParam.searchColumn === 'createdFrom') {
                        let d: Date = new Date(searchParam.searchValue);
                        return gte(reservationTable.createdAtUTC, d);
                    }
                    if (searchParam.searchColumn === 'createdUntil') {
                        const d = getMidNightDate(new Date(searchParam.searchValue));
                        return lte(reservationTable.createdAtUTC, d);
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
                    if (searchParam.searchColumn === 'remark') {
                        return like(reservationTable.remark, `%${searchParam.searchValue}%`);
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
                countQuery.where(
                    and(
                        ...conditions,
                        eq(reservationTable.location, user.location),
                        or(
                            eq(reservationStatusAlias.value, 'CIN'),
                            eq(reservationStatusAlias.value, 'OUT')
                        )
                    ));
                dataQuery.where(
                    and(
                        ...conditions,
                        eq(reservationTable.location, user.location),
                        or(
                            eq(reservationStatusAlias.value, 'CIN'),
                            eq(reservationStatusAlias.value, 'OUT')
                        )
                    ));
            }
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

        c.i('Return ReservationRepository > reservtionFindMany');
        return [reservations, pagerParams];
    }



    async reservationCreate(reservation: Reservation): Promise<Reservation> {
        c.i("ReservationRepository > createReservation");
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
                        createdBy: session.user.id,
                        updatedBy: session.user.id
                    };
                });
                c.d(newReservationCustomers?.length);
                //insert using transaction
                await tx.insert(reservationCustomerTable).values(newReservationCustomers as unknown as ReservationCustomerEntity[]);
            }

            //insert roomReservation
            if (reservation.roomNo) {
                //retrieve room id
                const [room]: RoomEntity[] = await this.dbClient.db.select()
                    .from(roomTable)
                    .where(and(
                        eq(roomTable.roomNo, reservation.roomNo),
                        eq(roomTable.location, user.location)
                    )).limit(1);
                if (!room)
                    throw new Error('Repository cannot find valid room.');
                //insert into roomReservation
                const roomReservation = new RoomReservation();
                roomReservation.roomId = room.id;
                roomReservation.reservationId = reservation.id;
                roomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
                roomReservation.checkInDateUTC = reservation.checkInDateUTC;
                roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
                roomReservation.createdBy = session.user.id;
                roomReservation.updatedBy = session.user.id;
                await tx.insert(roomReservationTable).values(roomReservation as unknown as RoomReservationEntity);
            }

            return reservation;
        });
    }


    async reservationGetById(id: string): Promise<Reservation | undefined> {
        c.i('ReservationRepository > reservationFindById');
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
        c.i('Returning result from ReservationRepository > reservationFindById');
        return reservation;
    }


    async reservationGetList(searchParams: SearchParam[], pagerParams: PagerParams): Promise<[Reservation[], PagerParams]> {
        c.i('ReservationRepository > reservationFindMany');
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
                    if (searchParam.searchColumn === 'arrivalDateTimeUTC') {
                        const startDate = new Date(searchParam.searchValue);
                        const endDate = getMidNightDate(new Date(searchParam.searchValue));
                        return and(
                            gte(reservationTable.arrivalDateTimeUTC, startDate),
                            lte(reservationTable.arrivalDateTimeUTC, endDate)
                        );
                    }
                    if (searchParam.searchColumn === 'departureDateTimeUTC') {
                        const startDate = new Date(searchParam.searchValue);
                        const endDate = getMidNightDate(new Date(searchParam.searchValue));
                        return and(
                            gte(reservationTable.departureDateTimeUTC, startDate),
                            lte(reservationTable.departureDateTimeUTC, endDate)
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
                    if (searchParam.searchColumn === 'checkInDateUTC') {
                        let d: Date = new Date(searchParam.searchValue);
                        return eq(reservationTable.checkInDateUTC, d);
                    }
                    if (searchParam.searchColumn === 'checkOutDateUTC') {
                        let d: Date = new Date(searchParam.searchValue);
                        return eq(reservationTable.checkOutDateUTC, d);
                    }
                    if (searchParam.searchColumn === 'createdFrom') {
                        let d: Date = new Date(searchParam.searchValue);
                        return gte(reservationTable.createdAtUTC, d);
                    }
                    if (searchParam.searchColumn === 'createdUntil') {
                        let d: Date = new Date(searchParam.searchValue);
                        d.setUTCHours(23, 59, 59, 999);
                        return lte(reservationTable.createdAtUTC, d);
                    }
                    if (searchParam.searchColumn === 'checkInDateFrom') {
                        let d: Date = new Date(searchParam.searchValue);
                        return gte(reservationTable.checkInDateUTC, d);
                    }
                    if (searchParam.searchColumn === 'checkInDateUntil') {
                        let d: Date = new Date(searchParam.searchValue);
                        d.setUTCHours(23, 59, 59, 999);
                        return lte(reservationTable.checkInDateUTC, d);
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

        c.i('Return ReservationRepository > reservtionFindMany');
        return [reservations, pagerParams];
    }



    reservationGetConditions(searchParams: SearchParam[]) {
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
                        return eq(reservationTable.checkInDateUTC, new Date(searchParam.searchValue));
                    }
                    if (searchParam.searchColumn === 'checkOutDateUTC') {
                        return eq(reservationTable.checkOutDateUTC, new Date(searchParam.searchValue));
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
    }


    reservationGetSelect() {
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
    }


    reservationGetQuery(q) {
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
        return query;
    }


    async reservationMoveRoom(id: string, roomNo: string): Promise<void> {
        c.i('ReservationRepository > moveRoom');
        c.d(id);
        c.d(roomNo);

        const session = await auth();
        if (!session)
            throw new CustomError('Repository cannot find valid session');
        //retrieve current user
        const [user]: UserEntity[] = await this.dbClient.db.select().from(userTable)
            .where(eq(userTable.userName, session.user.name)).limit(1);
        if (!user) throw new CustomError('Repository cannot find valid user.');

        c.i('retrieve new room info');
        const [room]: RoomEntity[] = await this.dbClient.db.select().from(roomTable).where(
            and(
                eq(roomTable.roomNo, roomNo),
                eq(roomTable.location, user.location)
            )
        ).limit(1);
        c.d(room);

        c.i('Retrieve reservation.');
        const [reservation]: ReservationEntity[] = await this.dbClient.db.select().from(reservationTable).where(
            eq(reservationTable.id, id)
        ).limit(1);

        c.i('Return from ReservationRepository > moveRoom');
        return await this.dbClient.db.transaction(async (tx: TransactionType) => {
            c.i('Inside transaction');
            const date = new Date(new Date().toISOString());
            c.i('Update current roomReservation record');
            await tx.update(roomReservationTable)
                .set({ checkOutDateUTC: date, updatedBy: session.user.id })
                .where(eq(roomReservationTable.reservationId, id));

            c.i('Create new roomReservation record');
            await tx.insert(roomReservationTable)
                .values(
                    {
                        reservationId: id,
                        roomId: room.id,
                        checkInDateUTC: date,
                        checkOutDateUTC: reservation.checkOutDateUTC,
                        createdBy: session.user.id,
                        updatedBy: session.user.id
                    });

            c.i('Update reservation table.');
            await tx.update(reservationTable)
                .set({ roomNo: roomNo })
                .where(eq(reservationTable.id, id));
        });
    }


    async reservationPrepare(reservation: Reservation) {
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


        c.i("Prepared entity for insert/update.");
        c.d(reservation);
        return reservation;
    }


    async reservationTranformData(result: Reservation[]) {
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

        return reservations;
    }


    async reservationUpdate(id: string, reservation: Reservation): Promise<Reservation> {
        c.i("ReservationRepository > updateReservationxxx");
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

        c.i('Retrieve existing reservation for comparison');
        const existingReservation: Reservation = await this.reservationGetById(id);

        // Use transaction
        await this.dbClient.db.transaction(async (tx: TransactionType) => {
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

            c.i('Check there is existing room reservation, sorted by check out date to get latest records.');
            const [existingRoomReservation]: RoomReservation[] = await this.dbClient.db.select().from(roomReservationTable)
                .where(eq(roomReservationTable.reservationId, id)).orderBy(desc(roomReservationTable.checkOutDateUTC)).limit(1);
            c.d(existingRoomReservation);

            //room is provided, no room previously
            if (reservation.roomNo && (!existingReservation.roomNo || existingReservation.roomNo.trim() === '')) {
                c.i('Room no is provided and there is no room previously. Insert new');
                //retrieve room id
                const [room]: RoomEntity[] = await this.dbClient.db.select()
                    .from(roomTable)
                    .where(and(
                        eq(roomTable.roomNo, reservation.roomNo),
                        eq(roomTable.location, user.location)
                    )).limit(1);
                if (!room)
                    throw new Error('Roon number is invalid in repository.');

                const roomReservation = new RoomReservation();
                roomReservation.reservationId = reservation.id;
                roomReservation.roomId = room.id;
                roomReservation.noOfExtraBed = 0;
                roomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
                roomReservation.checkInDateUTC = reservation.checkInDateUTC;
                roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
                roomReservation.createdBy = session.user.id;
                roomReservation.updatedBy = session.user.id;
                await tx.insert(roomReservationTable).values(roomReservation as unknown as RoomReservationEntity);
            } else if (reservation.roomNo && reservation.roomNo !== existingReservation.roomNo) {
                c.i('Room no is provided and room no is different from previous room number.');
                //retrieve room id
                const [room]: RoomEntity[] = await this.dbClient.db.select()
                    .from(roomTable)
                    .where(and(
                        eq(roomTable.roomNo, reservation.roomNo),
                        eq(roomTable.location, user.location)
                    )).limit(1);
                if (!room)
                    throw new Error('Roon number is invalid in repository.');

                if (existingRoomReservation && existingRoomReservation.checkInDateUTC < new Date(new Date().toDateString())) {
                    c.i('Existing room reservation and date passed. Move room.');
                    existingRoomReservation.checkOutDateUTC = new Date(new Date().toDateString());
                    existingRoomReservation.updatedBy = session.user.id;
                    await tx.update(roomReservationTable).set(existingRoomReservation as unknown as RoomReservationEntity);

                    const roomReservation = new RoomReservation();
                    roomReservation.reservationId = reservation.id;
                    roomReservation.roomId = room.id;
                    roomReservation.noOfExtraBed = 0;
                    roomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
                    roomReservation.checkInDateUTC = new Date(new Date().toDateString());
                    roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
                    roomReservation.createdBy = session.user.id;
                    roomReservation.updatedBy = session.user.id;
                    await tx.insert(roomReservationTable).values(roomReservation as unknown as RoomReservationEntity);
                } else if (existingRoomReservation && existingRoomReservation.checkInDateUTC >= new Date(new Date().toDateString())) {
                    c.i('Existing room reservation and date not passed. Update room rsv. ');

                    existingRoomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
                    existingRoomReservation.checkInDateUTC = reservation.checkInDateUTC;
                    existingRoomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
                    existingRoomReservation.updatedBy = session.user.id;
                    await tx.update(roomReservationTable).set(existingRoomReservation)
                        .where(eq(roomReservationTable.id, existingRoomReservation.id));
                } else if (!existingRoomReservation) {
                    c.i('No existing room reservation. Insert new');
                    const roomReservation = new RoomReservation();
                    roomReservation.reservationId = reservation.id;
                    roomReservation.roomId = room.id;
                    roomReservation.noOfExtraBed = 0;
                    roomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
                    roomReservation.checkInDateUTC = reservation.checkInDateUTC;
                    roomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
                    roomReservation.createdBy = session.user.id;
                    roomReservation.updatedBy = session.user.id;
                    await tx.insert(roomReservationTable).values(roomReservation as unknown as RoomReservationEntity);
                }
            } else if (reservation.roomNo && reservation.roomNo === existingReservation.roomNo) {
                c.i('Room no is provided and room no is same as previous room number.');
                //retrieve room id
                const [room]: RoomEntity[] = await this.dbClient.db.select()
                    .from(roomTable)
                    .where(and(
                        eq(roomTable.roomNo, reservation.roomNo),
                        eq(roomTable.location, user.location)
                    )).limit(1);
                if (!room)
                    throw new Error('Roon number is invalid.');

                //check number of room reservations, if there are multiple room reservations (room moved)
                //and check-in check-out dates between reservation and room reservation are different
                //throw exception
                // const rrresult : RoomReservationEntity[] = await this.dbClient.db.select()
                // .from(roomReservationTable).where(eq(roomReservationTable.reservationId, reservation.id))
                // .orderBy(asc(roomReservationTable.checkInDateUTC));
                // if(rrresult.length >= 2 && rrresult[0].checkInDateUTC !== reservation.checkInDateUTC)
                //     throw new CustomError('Reservation check-in date and room reservation check-in dates are different in repository.');

                // if(rrresult.length == 1)
                //     existingRoomReservation.checkInDateUTC = reservation.checkInDateUTC;

                // existingRoomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
                // existingRoomReservation.checkOutDateUTC = reservation.checkOutDateUTC;
                // existingRoomReservation.updatedBy = session.user.id;
                // await tx.update(roomReservationTable).set(existingRoomReservation)
                //     .where(eq(roomReservationTable.id, existingRoomReservation.id));
            } else if (!reservation.roomNo) {
                c.i('No room provided, delete room reservation list');
                await tx.delete(roomReservationTable).where(eq(roomReservationTable.reservationId, reservation.id))
            }


        });

        const updatedReservation = await this.reservationGetById(reservation.id);
        c.i('Return > ReservationRepository > updateReservation');
        return updatedReservation;
    }


    async roomAndReservationGetList(searchParams: SearchParam[]): Promise<Room[]> {
        c.i('ReservationRepository > roomAndReservationList');
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

        return rooms;
    }


    async roomChargeGetListById(reservationId: string): Promise<RoomCharge[]> {
        const result = await this.dbClient.db.select()
            .from(roomChargeTable)
            .innerJoin(roomTypeTable, eq(roomTypeTable.id, roomChargeTable.roomTypeId))
            .innerJoin(roomTable, eq(roomTable.id, roomChargeTable.roomId))
            .where(eq(roomChargeTable.reservationId, reservationId));

        const roomCharges: RoomCharge[] = result?.map((row: { roomCharge: RoomChargeEntity, roomType: RoomTypeEntity, room: RoomEntity }) => {
            const rc = new RoomCharge();
            rc.id = row.roomCharge.id;
            rc.endDateUTC = row.roomCharge.endDateUTC;
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
            rc.startDateUTC = row.roomCharge.startDateUTC;
            rc.totalAmount = Number(row.roomCharge.totalAmount);
            rc.totalRate = Number(row.roomCharge.totalRate);
            rc.createdAtUTC = row.roomCharge.createdAtUTC;
            rc.createdBy = row.roomCharge.createdBy;
            rc.updatedAtUTC = row.roomCharge.updatedAtUTC;
            rc.updatedBy = row.roomCharge.updatedBy;
            return rc;
        });

        return roomCharges;
    }


    async roomChargeUpdateList(reservationId: string, roomCharges: RoomCharge[]): Promise<boolean> {
        c.i('ReservationRepository > roomChargesSave');
        const session = await auth();
        roomCharges.forEach(rc => {
            rc.createdBy = session.user.id;
            rc.updatedBy = session.user.id
        })
        const result = await this.dbClient.db.transaction(async (tx: TransactionType) => {
            await tx.delete(roomChargeTable).where(eq(roomChargeTable.reservationId, reservationId));
            await tx.insert(roomChargeTable).values(roomCharges as unknown as RoomChargeEntity[]);
            return true;
        });
        return result;
    }


    // async roomReservationsGetByReservationId(reservationId: string): Promise<RoomReservation[]> {
    //     const result = await this.dbClient.db.select()
    //         .from(roomReservationTable)
    //         .innerJoin(roomTable, eq(roomTable.id, roomChargeTable.roomId))
    //         .innerJoin(roomTypeTable, eq(roomTypeTable.id, roomTable.roomTypeId))
    //         .where(eq(roomReservationTable.reservationId, reservationId));

    //     const roomReservations: RoomReservation[] = result?.map((row: { roomReservation: RoomReservationEntity, roomType: RoomTypeEntity, room: RoomEntity }) => {
    //         const rr = new RoomReservation();
    //         rr.id = row.roomReservation.id;
    //         rr.checkInDateUTC = row.roomReservation.checkInDateUTC;
    //         rr.checkOutDateUTC = row.roomReservation.checkOutDateUTC;
    //         rr.isSingleOccupancy = row.roomReservation.isSingleOccupancy;
    //         rr.noOfExtraBed = row.roomReservation.noOfExtraBed;
    //         rr.reservationId = row.roomReservation.reservationId;
    //         rr.roomId = row.roomReservation.roomId;
    //         rr.roomNo = row.room.roomNo;
    //         rr.roomType = row.roomType.roomType;
    //         rr.roomTypeId = row.roomType.id;
    //         rr.createdAtUTC = row.roomReservation.createdAtUTC;
    //         rr.createdBy = row.roomReservation.createdBy;
    //         rr.updatedAtUTC = row.roomReservation.updatedAtUTC;
    //         rr.updatedBy = row.roomReservation.updatedBy;
    //         return rr;
    //     });

    //     return roomReservations;
    // }


    async roomRateGetAll(location: string): Promise<RoomRate[]> {
        c.i('ReservationRepository > roomRateGetAll');
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
        return roomRates;
    }


    async roomReservationGetListById(reservationId: string, includeChildren: boolean = false): Promise<RoomReservation[]> {
        c.i('ReservationRepository > roomReservationGetListById');
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
            ));

        const roomReservations = result?.reduce((acc: RoomReservation[], row: { roomReservation: RoomReservationEntity, roomCharge: RoomChargeEntity, roomType: RoomTypeEntity, room: RoomEntity }) => {
            let roomReservation = acc.find(entry => entry.id === row.roomReservation.id);

            if (!roomReservation) {
                roomReservation = new RoomReservation();
                roomReservation.id = row.roomReservation.id;
                roomReservation.checkInDateUTC = row.roomReservation.checkInDateUTC;
                roomReservation.checkOutDateUTC = row.roomReservation.checkOutDateUTC;
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
                roomCharge.startDateUTC = row.roomCharge.startDateUTC;
                roomCharge.endDateUTC = row.roomCharge.endDateUTC;
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


        return roomReservations;
    }


    async roomReservationUpdateList(reservationId: string, roomReservations: RoomReservation[]): Promise<boolean> {
        c.i('ReservationRepository > roomReservationUpdateList');
        c.d(roomReservations);
        const session = await auth();

        const result = await this.dbClient.db.transaction(async (tx: TransactionType) => {
            const totalRoomCharges = roomReservations.filter(rr => rr.modelState !== 'deleted')
            .flatMap(rr => rr.roomCharges.filter(rc => rc.modelState !== 'deleted'))
            .reduce((sum, rc) => sum + Number(rc.totalAmount), 0);
            await tx.update(reservationTable).set({ totalAmount: totalRoomCharges.toString(), updatedBy: session.user.id })
                .where(eq(reservationTable.id, reservationId));

            for(const roomReservation of roomReservations) {
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
        });
        return result;
    }


    async roomScheduleGetList(searchParams: SearchParam[]): Promise<Room[]> {
        c.i('ReservationRepository > roomScheduleList');
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

        return rooms;
    }


    async roomTypeGetAll(location: string): Promise<RoomType[]> {
        c.i('ReservationRepository > roomTypeGetAll');
        const result: RoomTypeEntity[] = await this.dbClient.db.select()
            .from(roomTypeTable).where(eq(roomTypeTable.location, location));
        const roomTypes: RoomType[] = result.map(rte => {
            const rt = new RoomType();
            Object.assign(rt, rte);
            return rt;
        });
        return roomTypes;
    }


    async reservationUpdateDropOffInfo(id: string, carNo: string, driver: string): Promise<void> {
        c.i('ReservationRepository > updateDropOffCarNo');
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
        await this.dbClient.db.update(reservationTable).set(
            {
                dropOffCarNo: carNo,
                dropOffDriver: driver,
                updatedBy: session.user.id
            })
            .where(eq(reservationTable.id, id));

        c.i('Return ReservationRepository > updateDropOffCarNo');
    }


    async reservationUpdatePickUpInfo(id: string, carNo: string, driver: string): Promise<void> {
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
        await this.dbClient.db.update(reservationTable)
            .set(
                {
                    pickUpCarNo: carNo,
                    pickUpDriver: driver,
                    updatedBy: session.user.id
                })
            .where(eq(reservationTable.id, id));

        c.i('Return ReservationRepository > updatePickUpCarNo');
    }
}