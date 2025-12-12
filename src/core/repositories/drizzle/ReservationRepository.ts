import { auth } from "@/app/auth";
import { ConfigGroup } from "@/core/constants";
import { TransactionType } from "@/core/db/mysql/MySqlDatabase";
import Reservation from "@/core/models/domain/Reservation";
import Room from "@/core/models/domain/Room";
import RoomCharge from "@/core/models/domain/RoomCharge";
import RoomReservation from "@/core/models/domain/RoomReservation";
import RoomAndPax from "@/core/models/dto/RoomAndPax";
import RoomReservationDto from "@/core/models/dto/RoomReservationDto";
import SessionUser from "@/core/models/dto/SessionUser";
import ReservationEntity from "@/core/models/entity/ReservationEntity";
import RoomChargeEntity from "@/core/models/entity/RoomChargeEntity";
import RoomEntity from "@/core/models/entity/RoomEntity";
import RoomReservationEntity from "@/core/models/entity/RoomReservationEntity";
import RoomTypeEntity from "@/core/models/entity/RoomTypeEntity";
import UserEntity from "@/core/models/entity/UserEntity";
import { billTable, configTable, customerTable, prepaidTable, promotionTable, reservationCustomerTable, reservationTable, roomChargeTable, roomReservationTable, roomTable, roomTypeTable, userTable } from "@/core/orms/drizzle/mysql/schema";
import { PagerParams, SearchFormFields, TYPES } from "@/core/types";
import type { IDatabaseClient } from "@/lib/db/IDatabase";
import { CustomError } from "@/lib/errors";
import c from "@/lib/loggers/console/ConsoleLogger";
import type IMapper from "@/lib/mappers/IMapper";
import type IQueryTranformer from "@/lib/transformers/IQueryTransformer";
import { getISODateTimeString, getUTCDateMidNight } from "@/lib/utils";
import { and, asc, between, count, desc, eq, gt, gte, like, lt, lte, ne, or } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { inject, injectable } from "inversify";
import { Repository } from "../../../lib/repositories/drizzle/Repository";
import IReservationRepository from "../contracts/IReservationRepository";


@injectable()
export default class ReservationRepository extends Repository<Reservation, ReservationEntity, typeof reservationTable> implements IReservationRepository {

    reservationTypeAlias = alias(configTable, 'reservation_type');
    reservationStatusAlias = alias(configTable, 'reservation_status');
    pickUpAlias = alias(configTable, 'pickUpAlias');
    dropOffAlias = alias(configTable, 'dropOffAlias');

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>,
        @inject(TYPES.IMapper) protected readonly mapper: IMapper,
        @inject(TYPES.IQueryTransformer) protected readonly transformer: IQueryTranformer
    ) {
        super(dbClient, reservationTable, { ...reservationTable }, (q) => q, mapper, Reservation, ReservationEntity, transformer);
    }


    async getRoomsAndPax(drawDate: Date, sessionUser: SessionUser): Promise<RoomAndPax[]> {
        c.fs("ReservationService > getRoomsAndPax");
        const reservations : ReservationEntity[] = await this.dbClient.db.select({...reservationTable})
            .from(reservationTable)
            .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
            .where(
                and(
                    and(
                        lte(reservationTable.checkInDate, drawDate),
                        gt(reservationTable.checkOutDate, drawDate)
                    ),
                    ne(configTable.value, "CCL"),
                    eq(reservationTable.location, sessionUser.location)
                )
            );
        c.d(reservations?.length);
        if(!reservations || reservations.length == 0) return [];
        
        const roomsAndPax : RoomAndPax[] = reservations.reduce((acc: RoomAndPax[], {roomNo, noOfGuests}) : RoomAndPax[] => {
            if(!acc) acc = [];
            const existing = acc.find( rnp => rnp.roomNo === roomNo);
            if(!existing){
                acc.push({roomNo: roomNo, noOfGuests: noOfGuests});
            }
            else{
                existing.noOfGuests = Number(existing.noOfGuests) + Number(noOfGuests);
            }
            return acc;

        }, [] as RoomAndPax[]);
        c.d(roomsAndPax?.length);

        if(!roomsAndPax || roomsAndPax.length === 0) return [];

        const sortedRoomsAndPax = roomsAndPax.sort((a, b) => a.roomNo > b.roomNo ? 1 : -1);
        return sortedRoomsAndPax;
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
                const existingCustomer = rsvn?.customers?.find(c => c.id === customer.id);
                if (!existingCustomer)
                    rsvn?.customers?.push(customer);
            }
            if (bill) {
                const existingBill = rsvn?.bills?.find(b => b.id === bill.id);
                if (!existingBill)
                    rsvn.bills.push(bill);
            }

            return acc;
        }, [] as Reservation[]);

        c.d(reservation);
        c.fe('ReservationRepository > reservationGetById');
        return reservation;
    }


    async reservationGetList(searchFormFields: SearchFormFields, pagerParams: PagerParams, list: string, sessionUser: SessionUser): Promise<[Reservation[], number]> {
        c.fs('ReservationRepository > reservationGetList');
        c.d(searchFormFields);
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

        const conditions = [];

        if (list === 'checkin' || list === 'checkout') {
            const [reservationStatus] = await this.dbClient.db.select().from(configTable)
                .where(and(
                    eq(configTable.group, ConfigGroup.RESERVATION_STATUS),
                    eq(configTable.value, 'CCL')
                )).limit(1);
            if (!reservationStatus) throw new CustomError('Reservation repository cannot find reservation status');
            conditions.push(ne(reservationTable.reservationStatusId, reservationStatus.id));
        }

        if (searchFormFields && Object.entries(searchFormFields).length > 0) {
            c.i('Building condtions');

            if (searchFormFields.searchArrivalDateTime) {
                const startDate = new Date(getISODateTimeString(searchFormFields.searchArrivalDateTime));
                const endDate = getUTCDateMidNight(new Date(searchFormFields.searchArrivalDateTime));
                conditions.push(and(
                    gte(reservationTable.arrivalDateTime, startDate),
                    lte(reservationTable.arrivalDateTime, endDate)
                ));
            }
            if (searchFormFields.searchDepartureDateTime) {
                const startDate = new Date(getISODateTimeString(searchFormFields.searchDepartureDateTime));
                const endDate = getUTCDateMidNight(new Date(searchFormFields.searchDepartureDateTime));
                conditions.push(and(
                    gte(reservationTable.departureDateTime, startDate),
                    lte(reservationTable.departureDateTime, endDate)
                ));
            }
            if (searchFormFields.searchRemark) {
                conditions.push(like(reservationTable.remark, `%${searchFormFields.searchRemark}%`));
            }
            if (searchFormFields.searchReservationStatus) {
                conditions.push(eq(reservationStatusAlias.value, searchFormFields.searchReservationStatus));
            }
            if (searchFormFields.searchReservationType) {
                conditions.push(eq(reservationTypeAlias.value, searchFormFields.searchReservationType));
            }
            if (searchFormFields.searchCheckInDate) {
                let d: Date = new Date(getISODateTimeString(searchFormFields.searchCheckInDate));
                conditions.push(eq(reservationTable.checkInDate, d));
            }
            if (searchFormFields.searchCheckOutDate) {
                let d: Date = new Date(getISODateTimeString(searchFormFields.searchCheckOutDate));
                conditions.push(eq(reservationTable.checkOutDate, d));
            }
            if (searchFormFields.searchCheckInDateFrom) {
                let d: Date = new Date(getISODateTimeString(searchFormFields.searchCheckInDateFrom));
                conditions.push(gte(reservationTable.checkInDate, d));
            }
            if (searchFormFields.searchCheckInDateUntil) {
                let d: Date = new Date(getISODateTimeString(searchFormFields.searchCheckInDateUntil));
                conditions.push(lte(reservationTable.checkInDate, d));
            }
            if (searchFormFields.searchName) {
                conditions.push(or(
                    like(customerTable.name, `%${searchFormFields.searchName}%`),
                    like(customerTable.englishName, `%${searchFormFields.searchName}%`)
                ));
            }
            if (searchFormFields.searchId) {
                conditions.push(like(reservationTable.id, `%${searchFormFields.searchId}%`));
            }
            if (searchFormFields.searchPrepaidPackage) {
                conditions.push(eq(prepaidTable.value, searchFormFields.searchPrepaidPackage));
            }
            if (searchFormFields.searchPromotionPackage) {
                conditions.push(eq(promotionTable.value, searchFormFields.searchPromotionPackage));
            }
            if (searchFormFields.searchNationalId) {
                conditions.push(like(customerTable.nationalId, `%${searchFormFields.searchNationalId}%`));
            }
            if (searchFormFields.searchPassport) {
                conditions.push(like(customerTable.passport, `%${searchFormFields.searchPassport}%`));
            }
            if (searchFormFields.searchPhone) {
                conditions.push(like(customerTable.phone, `%${searchFormFields.searchPhone}%`));
            }
            if (searchFormFields.searchCreatedDateFrom) {
                conditions.push(gte(reservationTable.createdAtUTC, new Date(searchFormFields.searchCreatedDateFrom)));
            }
            if (searchFormFields.searchCreatedDateUntil) {
                conditions.push(lte(reservationTable.createdAtUTC, new Date(searchFormFields.searchCreatedDateUntil)));
            }
            if (searchFormFields.searchExistingReservations) {
                const [config] = await this.dbClient.db.select().from(configTable)
                    .where(and(eq(configTable.group, ConfigGroup.RESERVATION_STATUS), eq(configTable.value, 'CCL'))).limit(1);
                if (!config) throw new CustomError('Reservation repository cannot find config');
                conditions.push(
                    and(
                        lt(reservationTable.checkInDate, new Date(searchFormFields.searchExistingReservations)),
                        gt(reservationTable.checkOutDate, new Date(searchFormFields.searchExistingReservations)),
                        ne(reservationTable.reservationStatusId, config.id)
                    ));
            }
        }

        if (conditions) {
            countQuery.where(and(...conditions, eq(reservationTable.location, sessionUser.location)));
            dataQuery.where(and(...conditions, eq(reservationTable.location, sessionUser.location)));
        } else {
            countQuery.where(eq(reservationTable.location, sessionUser.location));
            dataQuery.where(eq(reservationTable.location, sessionUser.location));
        }

        //order
        dataQuery.orderBy(pagerParams.orderDirection === 'desc' ? desc(reservationTable[pagerParams.orderBy as keyof ReservationEntity]) : asc(reservationTable[pagerParams.orderBy as keyof ReservationEntity]));
        c.d(dataQuery.toSQL());
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
        return [reservations, countResult.count];
    }


    async roomAndReservationGetList(searchFormFields: SearchFormFields, sessionUser: SessionUser): Promise<RoomReservationDto[]> {
        c.fs('ReservationRepository > roomAndReservationGetList');
        c.d(searchFormFields);

        const asRsv = this.dbClient.db
            .select({
                roomId: roomReservationTable.roomId,
                reservationId: reservationTable.id,
                checkInDate: roomReservationTable.checkInDate,
                checkOutDate: roomReservationTable.checkOutDate,
                noOfDays: reservationTable.noOfDays,
                noOfGuests: reservationTable.noOfGuests,
            })
            .from(reservationTable)
            .innerJoin(roomReservationTable,
                and(
                    eq(roomReservationTable.reservationId, reservationTable.id),
                    and(
                        lte(roomReservationTable.checkInDate, new Date(searchFormFields.date)),
                        gte(roomReservationTable.checkOutDate, new Date(searchFormFields.date))
                    )
                )
            )
            .where(
                and(
                    eq(reservationTable.location, sessionUser.location),
                    ne(reservationTable.reservationStatusId, 'f705afcd-58be-11f0-ad6b-b88d122a4ff4')
                )
            ).as('asRsv');
        c.i('Subquery constructed.');

        const dataQuery = this.dbClient.db
            .select({
                roomNo: roomTable.roomNo,
                roomTypeText: roomTypeTable.roomTypeText,
                reservationId: asRsv.reservationId,
                checkInDate: asRsv.checkInDate,
                checkOutDate: asRsv.checkOutDate,
                noOfDays: asRsv.noOfDays,
                noOfGuests: asRsv.noOfGuests,
                customer: customerTable
            })
            .from(roomTable)
            .innerJoin(roomTypeTable, eq(roomTypeTable.id, roomTable.roomTypeId))
            .leftJoin(asRsv, eq(asRsv.roomId, roomTable.id))
            .leftJoin(reservationCustomerTable, eq(reservationCustomerTable.reservationId, asRsv.reservationId))
            .leftJoin(customerTable, eq(customerTable.id, reservationCustomerTable.customerId))
            .where(
                eq(roomTable.location, sessionUser.location)
            ).orderBy(asc(roomTypeTable.roomTypeText), asc(roomTable.roomNo));

        c.d(dataQuery.toSQL());
        const dataQueryResult = await dataQuery;

        c.d(dataQueryResult.length);
        c.d(dataQueryResult.length > 0 ? dataQueryResult[0] : []);

        const roomReservations = dataQueryResult.reduce((acc: RoomReservationDto[], row) => {
            let room = acc.find(r => r.roomNo === row.roomNo && r.reservationId === row.reservationId);

            if (!room) {
                room = row;
                acc.push(room);
                room.customers = [];
            }

            if (row.customer) {
                room.customers.push(row.customer);
            }

            return acc;
        }, [] as RoomReservationDto[])

        c.fe('ReservationRepository > roomAndReservationGetList');
        return roomReservations;
    }


    async roomReservationGetListById(reservationId: string, includeChildren: boolean = false, sessionUser: SessionUser): Promise<[RoomReservation[], number]> {
        c.fs('ReservationRepository > roomReservationGetListById');
        c.d(reservationId);

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
                eq(roomTypeTable.location, sessionUser.location),
                eq(roomTable.location, sessionUser.location)
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
        return [roomReservations, 0];
    }


    async roomReservationUpdateList(reservationId: string, roomReservations: RoomReservation[], sessionUser: SessionUser, transaction?: TransactionType): Promise<void> {
        c.fs('ReservationRepository > roomReservationUpdateList');
        c.d(roomReservations);

        //retrieve original reservation
        const reservation: Reservation = await this.reservationGetById(reservationId);
        if (!reservation)
            throw new CustomError('Cannot find reservation in repository.');

        //if list is empty, delete all room reservations and room charges
        if (roomReservations.length === 0) {
            c.i('List is empty, removing existing records.');
            const operation = async (tx: TransactionType) => {
                await tx.delete(roomChargeTable).where(eq(roomChargeTable.reservationId, reservationId));
                await tx.delete(roomReservationTable).where(eq(roomReservationTable.reservationId, reservationId));
                await tx.update(reservationTable).set({ totalAmount: '0', netAmount: '0', taxAmount: '0', roomNo: '', dueAmount: '0', updatedBy: sessionUser.id })
                    .where(eq(reservationTable.id, reservationId));
            };
            if (transaction) {
                await operation(transaction);
            } else {
                return await this.dbClient.db.transaction(async (tx: TransactionType) => {
                    await operation(tx);
                });
            }
            return;
        }

        const operation = async (tx: TransactionType) => {
            c.i('List is not empty, updating.');
            const sortedRoomReservations = roomReservations.sort((a, b) => a.checkInDate.getTime() - b.checkInDate.getTime());

            c.i('Calculating charges');
            const totalRoomCharges = sortedRoomReservations.filter(rr => rr.modelState !== 'deleted')
                .flatMap(rr => rr.roomCharges.filter(rc => rc.modelState !== 'deleted'))
                .reduce((sum, rc) => sum + Number(rc.totalAmount), 0);
            const taxAmount = totalRoomCharges * Number(reservation.tax) / 100;
            const netAmount = totalRoomCharges + taxAmount - reservation.depositAmount - reservation.discountAmount;
            const dueAmount = netAmount - Number(reservation.paidAmount);

            c.i('Updating reservation');
            await tx.update(reservationTable).set(
                { totalAmount: totalRoomCharges.toString(), taxAmount: taxAmount.toString(), netAmount: netAmount.toString(), dueAmount: dueAmount.toString(), roomNo: sortedRoomReservations[0].roomNo, updatedBy: sessionUser.id }
            ).where(eq(reservationTable.id, reservationId));

            for (const roomReservation of sortedRoomReservations) {
                const [room]: RoomEntity[] = await this.dbClient.db.select().from(roomTable)
                    .where(eq(roomTable.roomNo, roomReservation.roomNo)).limit(1);
                if (!room)
                    throw new CustomError('Room number is invalid in repository.');

                if (roomReservation.modelState === "deleted") {
                    c.i('Deleting data for room reservation.');
                    await tx.delete(roomChargeTable).where(
                        and(
                            eq(roomChargeTable.roomId, roomReservation.roomId),
                            eq(roomChargeTable.reservationId, reservationId)
                        ));
                    await tx.delete(roomReservationTable).where(eq(roomReservationTable.id, roomReservation.id));
                } else if (roomReservation.modelState === "inserted") {
                    c.i('Inserting data for room reservation.');
                    roomReservation.roomId = room.id;
                    roomReservation.createdBy = sessionUser.id;
                    roomReservation.updatedBy = sessionUser.id;
                    const insertedId = await tx.insert(roomReservationTable).values(roomReservation as unknown as RoomReservationEntity).$returningId();

                    for (const roomCharge of roomReservation.roomCharges) {
                        roomCharge.roomId = room.id;
                        roomCharge.roomTypeId = room.roomTypeId;
                        roomCharge.reservationId = reservationId;
                        roomCharge.createdBy = sessionUser.id;
                        roomCharge.updatedBy = sessionUser.id;
                    }
                    if (roomReservation.roomCharges.length > 0)
                        await tx.insert(roomChargeTable).values(roomReservation.roomCharges as unknown as RoomChargeEntity[]);
                } else if (roomReservation.modelState === "updated") {
                    c.i('Updating data for room reservation.');
                    roomReservation.roomId = room.id;
                    roomReservation.updatedBy = sessionUser.id;
                    await tx.update(roomReservationTable).set(roomReservation as unknown as RoomReservationEntity)
                        .where(eq(roomReservationTable.id, roomReservation.id));

                    for (const roomCharge of roomReservation.roomCharges) {
                        if (roomCharge.modelState === "deleted") {
                            await tx.delete(roomChargeTable).where(eq(roomChargeTable.id, roomCharge.id));
                        } else if (roomCharge.modelState === "inserted") {
                            roomCharge.roomId = room.id;
                            roomCharge.roomTypeId = room.roomTypeId;
                            roomCharge.reservationId = reservationId;
                            roomCharge.createdBy = sessionUser.id;
                            roomCharge.updatedBy = sessionUser.id;
                            await tx.insert(roomChargeTable).values(roomCharge as unknown as RoomChargeEntity);
                        } else if (roomCharge.modelState === "updated") {
                            roomCharge.roomId = room.id;
                            roomCharge.roomTypeId = room.roomTypeId;
                            roomCharge.reservationId = reservationId;
                            roomCharge.updatedBy = sessionUser.id;
                            await tx.update(roomChargeTable).set(roomCharge as unknown as RoomChargeEntity)
                                .where(eq(roomChargeTable.id, roomCharge.id));
                        }
                    }
                } else {
                    c.i('Handling room charges');
                    for (const roomCharge of roomReservation.roomCharges) {
                        if (roomCharge.modelState === "deleted") {
                            c.i('Deleting room charges');
                            await tx.delete(roomChargeTable).where(eq(roomChargeTable.id, roomCharge.id));
                        } else if (roomCharge.modelState === "inserted") {
                            c.i('Inserting room charges');
                            roomCharge.roomId = room.id;
                            roomCharge.roomTypeId = room.roomTypeId;
                            roomCharge.reservationId = reservationId;
                            roomCharge.createdBy = sessionUser.id;
                            roomCharge.updatedBy = sessionUser.id;
                            await tx.insert(roomChargeTable).values(roomCharge as unknown as RoomChargeEntity);
                        } else if (roomCharge.modelState === "updated") {
                            c.i('Updating room charges');
                            roomCharge.roomId = room.id;
                            roomCharge.roomTypeId = room.roomTypeId;
                            roomCharge.reservationId = reservationId;
                            roomCharge.updatedBy = sessionUser.id;
                            await tx.update(roomChargeTable).set(roomCharge as unknown as RoomChargeEntity)
                                .where(eq(roomChargeTable.id, roomCharge.id));
                        }
                    }
                }
            }
            //return true;
        };

        if (transaction) {
            await operation(transaction);
        } else {
            await this.dbClient.db.transaction(async (tx: TransactionType) => {
                await operation(tx);
            });
        }

        c.fe('ReservationRepository > roomReservationUpdateList');
    }


    async roomScheduleGetList(searchFormFields: SearchFormFields, sessionUser: SessionUser): Promise<[Room[], number]> {
        c.fs('ReservationRepository > roomScheduleGetList');
        c.d(searchFormFields);

        //build conditions first for join
        let start: Date, end: Date;
        start = new Date(searchFormFields.searchCheckInDateFrom);
        end = new Date(searchFormFields.searchCheckInDateUntil);

        const dataQuery = this.dbClient.db
            .select({
                room: roomTable,
                reservation: reservationTable,
                roomReservation: roomReservationTable
            })
            .from(roomTable)
            .leftJoin(roomReservationTable,
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
                )
            )
            .leftJoin(reservationTable,
                and(
                    eq(reservationTable.id, roomReservationTable.reservationId),
                    eq(reservationTable.location, sessionUser.location),
                    ne(reservationTable.reservationStatusId, 'f705afcd-58be-11f0-ad6b-b88d122a4ff4')
                )
            )
            .where(
                eq(roomTable.location, sessionUser.location)
            );

        c.d(dataQuery.toSQL());
        const dataQueryResult = await dataQuery;
        c.d(dataQueryResult?.length);
        c.d(dataQueryResult?.length > 0 ? dataQueryResult[0] : []);

        const rooms = dataQueryResult?.reduce((acc: Room[], current: any) => {
            const { room, roomReservation, reservation } = current;
            let currentRoom = acc.find(r => r.id === room.id);
            if (!currentRoom) {
                currentRoom = room;
                currentRoom!.reservations = [];
                currentRoom!.roomReservations = [];
                acc.push(currentRoom!);
            }
            if (reservation) {
                currentRoom?.reservations?.push(reservation);
                //only push room reservation if there is a reservation
                if (roomReservation)
                    currentRoom?.roomReservations?.push(roomReservation);
            }


            return acc;
        }, [] as Room[]);

        c.d(rooms.length);
        c.d(rooms.length > 0 ? rooms[0] : []);
        c.fe('ReservationRepository > roomScheduleGetList');
        return [rooms, 0];
    }

}