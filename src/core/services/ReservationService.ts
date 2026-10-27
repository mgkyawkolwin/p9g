import IReservationService from "./contracts/IReservationService";
import { inject, injectable } from "inversify";
import type IReservationRepository from "@/core/repositories/contracts/IReservationRepository";
import { PagerParams, SearchFormFields, TYPES } from "@/core/types";
import Reservation from "@/core/models/domain/Reservation";
import c from "@/lib/loggers/console/ConsoleLogger";
import Room from "../models/domain/Room";
import { ConfigGroup } from "@/core/constants";
import Bill from "../models/domain/Bill";
import Invoice from "../models/dto/Invoice";
import CurrencyTotal from "../models/dto/CurrencyTotal";
import Payment from "../models/domain/Payment";
import RoomCharge from "../models/domain/RoomCharge";
import RoomRateEngine from "@/core/engines/RoomRateEngine";
import { CustomError } from "@/lib/errors";
import RoomReservation from "../models/domain/RoomReservation";
import type IUserService from "./contracts/IUserService";
import type { IDatabaseClient } from "@/lib/db/IDatabase";
import { TransactionType } from "@/core/db/mysql/MySqlDatabase";
import type IRepository from "@/lib/repositories/IRepository";
import User from "../models/domain/User";
import Config from "../models/domain/Config";
import SessionUser from "../models/dto/SessionUser";
import RoomRate from "../models/domain/RoomRate";
import RoomType from "../models/domain/RoomType";
import ReservationCustomer from "../models/domain/ReservationCustomer";
import PrepaidEntity from "@/core/models/entity/PrepaidEntity";
import PromotionEntity from "@/core/models/entity/PromotionEntity";
import { and, asc, desc, eq, ne, or } from "@/lib/transformers/types";
import RoomReservationDto from "../models/dto/RoomReservationDto";
import { timeStamp } from "console";
import { and as drizzleAnd, asc as drizzleAsc, eq as drizzleEq, gte as drizzleGte, sql } from "drizzle-orm";
import { packageUsageTable, prepaidPackageTable, reservationCustomerTable } from "@/core/orms/drizzle/mysql/schema";

@injectable()
export default class ReservationService implements IReservationService {


    constructor(
        @inject(TYPES.IBillRepository) private billRepository: IRepository<Bill>,
        @inject(TYPES.IConfigRepository) protected readonly configRepository: IRepository<Config>,
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>,
        @inject(TYPES.IPaymentRepository) private paymentRepository: IRepository<Payment>,
        @inject(TYPES.IPrepaidRepository) private prepaidRepository: IRepository<PrepaidEntity>,
        @inject(TYPES.IPromotionRepository) private promotionRepository: IRepository<PromotionEntity>,
        @inject(TYPES.IReservationRepository) private reservationRepository: IReservationRepository,
        @inject(TYPES.IReservationCustomerRepository) private reservationCustomerRepository: IRepository<ReservationCustomer>,
        @inject(TYPES.IRoomRateRepository) private roomRateRepository: IRepository<RoomRate>,
        @inject(TYPES.IRoomRepository) private roomRepository: IRepository<Room>,
        @inject(TYPES.IRoomChargeRepository) private roomChargeRepository: IRepository<RoomCharge>,
        @inject(TYPES.IRoomReservationRepository) private roomReservationRepository: IRepository<RoomReservation>,
        @inject(TYPES.IRoomTypeRepository) private roomTypeRepository: IRepository<RoomType>,
        @inject(TYPES.IUserRepository) private userRepository: IRepository<User>,
        @inject(TYPES.IUserService) private userService: IUserService) {

    }


    private async getPrepaidPackageTypeValue(reservation: Reservation): Promise<string> {
        if (!reservation.prepaidPackageId?.trim()) return '';

        const prepaidPackageType = await this.prepaidRepository.findById(reservation.prepaidPackageId);
        if (!prepaidPackageType) throw new CustomError('Reservation service cannot find prepaid package type.');
        return prepaidPackageType.value;
    }


    async billDeleteById(reservationId: string, billId: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > billDeleteById');
        if (!reservationId) throw new CustomError('Service: Reservation id is required.');
        if (!billId) throw new CustomError('Service: Reservation id is required.');

        return await this.billRepository.delete(billId);
    }


    async billGetListById(reservationId: string, sessionUser: SessionUser): Promise<[Bill[], number]> {
        c.fs('ReservationService > billGetListById');
        return await this.billRepository.findMany(eq("reservationId", reservationId));
    }


    async billUpdateList(reservationId: string, bills: Bill[], sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > billUpdateList');
        c.d(`Bills: ${bills.length}`);
        c.d(bills);

        c.i('Preparing data based on model state.');
        const updateList = bills.filter(b => b.modelState == 'updated');
        const insertList = bills.filter(b => b.modelState == "inserted");
        const deleteList = bills.filter(b => b.modelState == "deleted");
        c.i(`Update counts: ${updateList.length}`);
        c.i(`Insert counts: ${insertList.length}`);
        c.i(`Delete counts: ${deleteList.length}`);

        c.i('Updating update information.');
        updateList.forEach(bill => {
            bill.updatedAtUTC = new Date();
            bill.updatedBy = sessionUser.id;
        });

        insertList.forEach(bill => {
            bill.createdAtUTC = new Date();
            bill.createdBy = sessionUser.id;
            bill.updatedAtUTC = new Date();
            bill.updatedBy = sessionUser.id;
        });

        await this.dbClient.db.transaction(async (tx: any) => {
            c.i('Deleting bills');
            for (const bill of deleteList) {
                await this.billRepository.delete(bill.id);
            }

            c.i('Updating bills.');
            for (const bill of updateList) {
                await this.billRepository.update(bill.id, bill, tx);
            };

            c.i('Inserting bills.');
            for (const bill of insertList) {
                await this.billRepository.create(bill, tx);
            };
        });
        c.fe('ReservationService > billUpdateList');
    }


    private calculateAllAmount(reservation: Reservation): Reservation {
        reservation.taxAmount = Number(reservation.totalAmount ?? 0) * Number(reservation.tax ?? 0) / 100;
        reservation.netAmount = Number(reservation.totalAmount ?? 0) + Number(reservation.taxAmount ?? 0) - Number(reservation.discountAmount ?? 0) - Number(reservation.depositAmount ?? 0);
        reservation.dueAmount = Number(reservation.netAmount ?? 0) - Number(reservation.paidAmount ?? 0);
        return reservation;
    }

    private async reconcilePackageUsage(reservation: Reservation, sessionUser: SessionUser, tx: TransactionType): Promise<void> {
        c.fs('ReservationService > reconcilePackageUsage');

        // Restore and delete any existing usages
        const existingUsages = await tx.select().from(packageUsageTable)
            .where(drizzleEq(packageUsageTable.reservationId, reservation.id));

        for (const usage of existingUsages) {
            await tx.update(prepaidPackageTable)
                .set({
                    daysUsed: sql`${prepaidPackageTable.daysUsed} - ${usage.days}`,
                    packageStatus: sql<string>`CASE
                        WHEN ${prepaidPackageTable.daysUsed} - ${usage.days} <= 0 THEN 'New'
                        WHEN ${prepaidPackageTable.daysUsed} - ${usage.days} >= ${prepaidPackageTable.noOfDays} THEN 'Finished'
                        ELSE 'In Use'
                    END`,
                    updatedAtUTC: new Date(),
                    updatedBy: sessionUser.id
                })
                .where(drizzleEq(prepaidPackageTable.id, usage.prepaidPackageId));

            c.d(`Restored ${usage.days} days for usage ${usage.id}`);
        }

        if (existingUsages.length > 0) {
            await tx.delete(packageUsageTable)
                .where(drizzleEq(packageUsageTable.reservationId, reservation.id));
        }

        // Exit if no prepaid package assigned
        if (!reservation.prepaidPackageId) {
            c.fe('ReservationService > reconcilePackageUsage');
            return;
        }

        // The reservation stores the prepaid package type id. Any package of that
        // type can be used, regardless of which customer owns it.
        await this.getPrepaidPackageTypeValue(reservation);

        // Validate dates
        const checkInDate = reservation.checkInDate;
        const checkOutDate = reservation.checkOutDate;
        if (!(checkInDate instanceof Date) || Number.isNaN(checkInDate.getTime()) ||
            !(checkOutDate instanceof Date) || Number.isNaN(checkOutDate.getTime()) ||
            checkOutDate < checkInDate) {
            throw new CustomError('Valid reservation dates are required to use a prepaid package.');
        }

        // Calculate total usage: pax x days
        const days = Number(reservation.noOfDays);
        const pax = Number(reservation.noOfGuests);
        if (!Number.isInteger(days) || days <= 0 || !Number.isInteger(pax) || pax <= 0) {
            throw new CustomError('Positive reservation days and guest count are required to use a prepaid package.');
        }
        const totalDaysToDeduct = days * pax;
        c.d(`Total days to deduct: ${totalDaysToDeduct} (days: ${days}, pax: ${pax})`);

        // Get unique customers for this reservation
        const customers = await tx.select({ customerId: reservationCustomerTable.customerId })
            .from(reservationCustomerTable)
            .where(drizzleEq(reservationCustomerTable.reservationId, reservation.id));
        const customerIds = [...new Set(customers.map(({ customerId }) => customerId))].sort();

        if (customerIds.length === 0) {
            throw new CustomError('At least one reservation customer is required to use a prepaid package.');
        }

        c.d(`Processing ${customerIds.length} customer(s)`);

        // Distribute total days equally among all customers for usage records
        const daysPerCustomer = Math.floor(totalDaysToDeduct / customerIds.length);
        let remainingDays = totalDaysToDeduct % customerIds.length;

        // Calculate each customer's share
        const customerUsageShare = new Map<string, number>();
        for (const customerId of customerIds) {
            let daysForThisCustomer = daysPerCustomer;
            if (remainingDays > 0) {
                daysForThisCustomer += 1;
                remainingDays -= 1;
            }
            customerUsageShare.set(customerId, daysForThisCustomer);
            c.d(`Customer ${customerId} usage share: ${daysForThisCustomer} days`);
        }

        // Collect all prepaid packages of this type. Package ownership is not
        // relevant when the package type and effective period are valid.
        interface PackageForDeduction {
            packageId: string;
            noOfDays: number;
            daysUsed: number;
        }
        const packagePool: PackageForDeduction[] = [];

        const packages = await tx.select().from(prepaidPackageTable)
            .where(drizzleAnd(
                drizzleEq(prepaidPackageTable.prepaidPackageTypeId, reservation.prepaidPackageId),
                drizzleGte(prepaidPackageTable.effectiveEndDate, checkInDate)
            ))
            .orderBy(drizzleAsc(prepaidPackageTable.effectiveEndDate))
            .for('update');

        for (const pkg of packages) {
            const availableDays = Number(pkg.noOfDays) - Number(pkg.daysUsed ?? 0);
            if (availableDays > 0) {
                packagePool.push({
                    packageId: pkg.id,
                    noOfDays: Number(pkg.noOfDays),
                    daysUsed: Number(pkg.daysUsed ?? 0)
                });
                c.d(`Package ${pkg.id}: ${availableDays} days available (${pkg.daysUsed}/${pkg.noOfDays})`);
            }
        }

        c.d(`Total prepaid packages in pool: ${packagePool.length}`);

        // Deduct total from the shared package pool
        let remainingToDeduct = totalDaysToDeduct;

        const packageAllocations: Array<{ packageId: string; days: number }> = [];
        for (const pkg of packagePool) {
            if (remainingToDeduct === 0) break;

            const availableDays = pkg.noOfDays - pkg.daysUsed;
            const usageDays = Math.min(availableDays, remainingToDeduct);

            c.d(`Deducting ${usageDays} days from package ${pkg.packageId}`);

            // Increment daysUsed in prepaid package
            await tx.update(prepaidPackageTable)
                .set({
                    daysUsed: sql`${prepaidPackageTable.daysUsed} + ${usageDays}`,
                    packageStatus: sql<string>`CASE
                        WHEN ${prepaidPackageTable.daysUsed} + ${usageDays} <= 0 THEN 'New'
                        WHEN ${prepaidPackageTable.daysUsed} + ${usageDays} >= ${prepaidPackageTable.noOfDays} THEN 'Finished'
                        ELSE 'In Use'
                    END`,
                    updatedAtUTC: new Date(),
                    updatedBy: sessionUser.id
                })
                .where(drizzleEq(prepaidPackageTable.id, pkg.packageId));

            pkg.daysUsed += usageDays;
            remainingToDeduct -= usageDays;
            packageAllocations.push({ packageId: pkg.packageId, days: usageDays });
        }

        // Verify sufficient funds were deducted
        if (remainingToDeduct > 0) {
            throw new CustomError(`Insufficient total prepaid package days. Required: ${totalDaysToDeduct}, Deducted: ${totalDaysToDeduct - remainingToDeduct}.`);
        }

        c.d(`Total deducted: ${totalDaysToDeduct - remainingToDeduct} days from shared pool`);

        // Keep each usage row tied to the package from which its days were
        // deducted so restoring a reservation reverses the exact allocations.
        for (const customerId of customerIds) {
            let remainingCustomerDays = customerUsageShare.get(customerId)!;

            for (const allocation of packageAllocations) {
                if (remainingCustomerDays === 0) break;

                const usageDays = Math.min(allocation.days, remainingCustomerDays);
                if (usageDays === 0) continue;
                c.d(`Inserting usage record for customer ${customerId}: ${usageDays} days from package ${allocation.packageId}`);

                await tx.insert(packageUsageTable).values({
                    reservationId: reservation.id,
                    customerId,
                    prepaidPackageId: allocation.packageId,
                    startDate: checkInDate,
                    endDate: checkOutDate,
                    days: usageDays,
                    createdBy: sessionUser.id,
                    updatedBy: sessionUser.id
                });
                remainingCustomerDays -= usageDays;
                allocation.days -= usageDays;
            }
        }

        c.fe('ReservationService > reconcilePackageUsage');
    }


    async invoiceGet(reservationId: string, sessionUser: SessionUser): Promise<Invoice> {
        c.fs('ReservationService > invoiceGet');
        const invoice = new Invoice();
        const [paidBills, paidBillsCount] = await this.billRepository.findMany(and(eq("reservationId", reservationId), eq("isPaid", true)));
        invoice.PaidBills = paidBills;
        invoice.PaidTotals = Object.entries(
            paidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({ total: total, currency: currency }) as CurrencyTotal);

        const [unPaidBills, unPaidBillsCount] = await this.billRepository.findMany(and(eq("reservationId", reservationId), eq("isPaid", false)));
        invoice.UnPaidBills = unPaidBills;
        invoice.UnPaidTotals = Object.entries(
            unPaidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({ total: total, currency: currency }) as CurrencyTotal);
        c.fe('ReservationService > invoiceGet');
        return invoice;
    }


    async paymentDeleteById(reservationId: string, paymentId: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > paymentDeleteById');
        if (!reservationId) throw new CustomError('Service: Reservation id is required.');
        if (!paymentId) throw new CustomError('Service: Reservation id is required.');
        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            c.i('Retrieving existing reservation');
            const reservation = await this.reservationRepository.findById(reservationId);
            if (!reservation) throw new CustomError('Rerservation service cannot find reservation.');

            c.i('Retrieving existing payment');
            const payment = await this.paymentRepository.findById(paymentId);
            if (!payment) throw new CustomError('Reservation service cannot find payment.');

            reservation.paidAmount -= payment.amount;
            reservation.dueAmount += payment.amount;

            c.i('Updating reservation.');
            await this.reservationRepository.update(reservationId, { paidAmount: reservation.paidAmount, dueAmount: reservation.dueAmount } as Reservation, tx as any);

            c.i('Deleting payment.');
            await this.paymentRepository.delete(paymentId, tx as any);
        });
    }


    async paymentGetListById(reservationId: string, sessionUser: SessionUser): Promise<[Payment[], number]> {
        c.fs('ReservationService > paymentGetListById');
        return await this.paymentRepository.findMany(eq('reservationId', reservationId));
    }


    async paymentUpdateList(reservationId: string, payments: Payment[], sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > paymentUpdateList');

        const updateList = payments.filter(p => p.modelState === 'updated');
        const insertList = payments.filter(p => p.modelState === 'inserted');
        const deleteList = payments.filter(p => p.modelState === 'deleted');
        c.i(`Update counts: ${updateList.length}`);
        c.i(`Insert counts: ${insertList.length}`);
        c.i(`Delete counts: ${deleteList.length}`);

        updateList.forEach(payment => {
            payment.updatedAtUTC = new Date();
            payment.updatedBy = sessionUser.id;
        });

        insertList.forEach(payment => {
            payment.createdAtUTC = new Date();
            payment.createdBy = sessionUser.id;
            payment.updatedAtUTC = new Date();
            payment.updatedBy = sessionUser.id;
        });

        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            c.i('Deleting payments');
            for (const payment of deleteList) {
                await this.paymentRepository.delete(payment.id);
            }

            c.i('Updating payments');
            for (const payment of updateList) {
                await this.paymentRepository.update(payment.id, payment);
            }

            c.i('Inserting payments');
            if (insertList && insertList.length >= 1) {
                await this.paymentRepository.createMany(insertList, tx as any);
            }

            const totalPaid = payments.reduce((acc, p) => (acc + p.amount), 0);

            let reservation: Reservation = await this.reservationRepository.findById(reservationId);
            if (!reservation) throw new CustomError('Reservation service cannot find reservation');

            reservation.paidAmount = totalPaid;
            reservation = this.calculateAllAmount(reservation);

            c.i('Updating reservation');
            await this.reservationRepository.update(reservationId, { paidAmount: reservation.paidAmount, dueAmount: reservation.dueAmount } as Reservation, tx as any);
        });
    }


    async paymentsView(reservationId: string, sessionUser: SessionUser): Promise<Invoice> {
        c.fs('ReservationService > paymentsView');
        const invoice = new Invoice();
        const [paidBills, paidBillsCount] = await this.billRepository.findMany(and(eq('reservationId', reservationId), eq("isPaid", true)));
        invoice.PaidBills = paidBills;
        invoice.PaidTotals = Object.entries(
            paidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({ total: total, currency: currency }) as CurrencyTotal);

        const [unPaidBills, unPaidBillsCount] = await this.billRepository.findMany(and(eq('reservationId', reservationId), eq("isPaid", false)));
        invoice.UnPaidBills = unPaidBills;
        invoice.UnPaidTotals = Object.entries(
            unPaidBills.reduce((acc, bill) => {
                const currency = bill.currency;
                acc[currency] = (Number(acc[currency]) || 0) + Number(bill.amount);
                return acc;
            }, {})
        ).map(([currency, total]) => ({ total: total, currency: currency }) as CurrencyTotal);

        return invoice;
    }


    async reservationCancel(id: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationCancel');
        c.d(id);
        const config = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_STATUS), eq("value", "CCL")));
        if (!config) throw new CustomError('Cannot find config in reservation service.');

        const reservation = await this.reservationRepository.findById(id);
        if (!reservation) throw new CustomError('Cannot find reservation to cancel.');

        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            await this.reconcilePackageUsage({ ...reservation, prepaidPackageId: null }, sessionUser, tx);
            await this.reservationRepository.update(id, {
                reservationStatusId: config.id,
                updatedAtUTC: new Date(),
                updatedBy: sessionUser.id
            } as Reservation, tx as any);
        });
    }


    async reservationCheckIn(id: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationCheckIn');
        c.fs('ReservationService > reservationCancel');
        c.d(id);
        const config = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_STATUS), eq("value", "CIN")));
        if (!config) throw new CustomError('Cannot find config in reservation service.');

        await this.reservationRepository.update(id, { reservationStatusId: config.id, updatedBy: sessionUser.id } as Reservation);
    }


    async reservationGetList(searchFormFields: SearchFormFields, pagerParams: PagerParams, list: string, sessionUser: SessionUser): Promise<[Reservation[], number]> {
        c.fs('ReservationService > reservationGetList');
        c.d(searchFormFields);
        c.d(pagerParams);
        c.d(list);
        pagerParams.orderBy = "checkInDate";
        pagerParams.orderDirection = "desc";
        if (list === 'checkin') {
            return await this.reservationRepository.reservationGetList(searchFormFields, pagerParams, list, sessionUser);
        }
        else if (list === 'checkout') {
            return await this.reservationRepository.reservationGetList(searchFormFields, pagerParams, list, sessionUser);
        }
        else if (list === 'pickup') {
            return await this.reservationRepository.reservationGetList(searchFormFields, pagerParams, list, sessionUser);
        }
        else if (list === 'dropoff') {
            return await this.reservationRepository.reservationGetList(searchFormFields, pagerParams, list, sessionUser);
        }
        else if (list === 'top') {
            pagerParams.orderBy = 'createdAtUTC';
            pagerParams.orderDirection = 'desc';
            pagerParams.pageIndex = 1;
            pagerParams.pageSize = 10;
            return await this.reservationRepository.reservationGetList(searchFormFields, pagerParams, null, sessionUser);
        }
        else {
            return await this.reservationRepository.reservationGetList(searchFormFields, pagerParams, null, sessionUser);
        }
    }


    async reservationCheckOut(id: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationCheckOut');
        c.d(id);
        const config = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_STATUS), eq("value", "OUT")));
        if (!config) throw new CustomError('Cannot find config in reservation service.');

        await this.reservationRepository.update(id, { reservationStatusId: config.id, updatedBy: sessionUser.id } as Reservation);
    }


    async reservationCreate(reservation: Reservation, sessionUser: SessionUser): Promise<Reservation> {
        c.fs('ReservationService > reservationCreate');
        c.d(reservation);

        c.i('Preparing reservation to insert');
        reservation.createdAtUTC = new Date();
        reservation.createdBy = sessionUser.id;
        reservation.updatedBy = sessionUser.id;
        reservation.updatedAtUTC = new Date();
        reservation.location = sessionUser.location;

        c.i('Retrieveing reservation status id');
        const reservationStatus = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_STATUS), eq("value", reservation.reservationStatus)));
        if (!reservationStatus) throw new CustomError('Reservation service cannot find reservation status');
        reservation.reservationStatusId = reservationStatus.id;

        c.i('Retrieveing reservation type id');
        const reservationType = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_TYPE), eq("value", reservation.reservationType)));
        if (!reservationType) throw new CustomError('Reservation service cannot find reservation type');
        reservation.reservationTypeId = reservationType.id;

        if (reservation.prepaidPackage) {
            c.i('Retrieveing prepaid package id');
            const prepaidPackage = await this.prepaidRepository.findOne(eq("value", reservation.prepaidPackage));
            if (!prepaidPackage) throw new CustomError('Reservation service cannot find prepaid package');
            reservation.prepaidPackageId = prepaidPackage.id;
        }

        if (reservation.promotionPackage) {
            c.i('Retrieveing promotion package id');
            const prromotionPackage = await this.promotionRepository.findOne(eq("value", reservation.promotionPackage));
            if (!prromotionPackage) throw new CustomError('Reservation service cannot find promotion package');
            reservation.promotionPackageId = prromotionPackage.id;
        }

        if (reservation.invoiceStatus) {
            c.i('Retrieveing invoice status id');
            const invoiceStatus = await this.configRepository.findOne(or(
                and(eq("group", "INVOICE_STATUS"), eq("value", reservation.invoiceStatus)),
                and(eq("group", "INVOICE_STATUS"), eq("text", reservation.invoiceStatus))
            ));
            if (!invoiceStatus) throw new CustomError('Reservation service cannot find invoice status');
            reservation.invoiceStatusId = invoiceStatus.id;
        }

        if (reservation.pickUpType) {
            c.i('Retrieveing pickup type id');
            const pickupType = await this.configRepository.findOne(and(eq("group", ConfigGroup.RIDE_TYPE), eq("value", reservation.pickUpType)));
            if (!pickupType) throw new CustomError('Reservation service cannot find pickup type.');
            reservation.pickUpTypeId = pickupType.id;
        }

        if (reservation.dropOffType) {
            c.i('Retrieveing pickup type id');
            const dropOffType = await this.configRepository.findOne(and(eq("group", ConfigGroup.RIDE_TYPE), eq("value", reservation.dropOffType)));
            if (!dropOffType) throw new CustomError('Reservation service cannot find drop off type.');
            reservation.dropOffTypeId = dropOffType.id;
        }

        let room: Room;
        if (reservation.roomNo) {
            c.i('Retrieveing room info');
            room = await this.roomRepository.findOne(eq("roomNo", reservation.roomNo));
        }

        const result = this.dbClient.db.transaction(async (tx: any) => {

            c.i('Creating reservation');
            reservation = this.calculateAllAmount(reservation);
            const createdReservation = await this.reservationRepository.create(reservation, tx);
            if (!createdReservation || !createdReservation.id)
                throw new CustomError('Reservation creation failed.');
            c.d(createdReservation);

            if (reservation.customers && reservation.customers.length > 0) {
                c.i('Customers exist. Prepare to insert.');
                const newReservationCustomers = await Promise.all(reservation.customers.map(async (customer) => {
                    c.i('Retrieve TDAC status for customers');
                    const tdacStatusConfig = await this.configRepository.findOne(and(eq("group", ConfigGroup.TDAC_STATUS), eq("value", customer.tdacStatus)));
                    if (!tdacStatusConfig) throw new CustomError('Cannot find TDAC status config for customer.');
                    const rc = new ReservationCustomer();
                    rc.reservationId = createdReservation.id;
                    rc.customerId = customer.id;
                    rc.tdacStatusId = tdacStatusConfig.id;
                    rc.createdAtUTC = new Date();
                    rc.createdBy = sessionUser.id;
                    rc.updatedAtUTC = new Date();
                    rc.updatedBy = sessionUser.id
                    return rc;
                }));
                c.d(newReservationCustomers?.length);

                await this.reservationCustomerRepository.createMany(newReservationCustomers, tx);
            }

            await this.reconcilePackageUsage(createdReservation, sessionUser, tx);

            if (reservation.roomNo && room) {
                c.i('Creating room reservation');
                const rrResult = await this.roomReservationCreate(createdReservation, sessionUser, tx);
                if (!rrResult)
                    throw new Error('Room reservation creation failed.');

                c.i('Calculating room charges');
                const [roomTypes, trc] = await this.roomTypeRepository.findMany(eq('location', reservation.location));
                const [roomRates, rrc] = await this.roomRateRepository.findMany(eq('location', reservation.location));
                const prepaidPackageTypeValue = await this.getPrepaidPackageTypeValue(reservation);
                const roomCharges = await RoomRateEngine.calculate(reservation, [rrResult], roomTypes, roomRates, prepaidPackageTypeValue);
                if (!roomCharges || roomCharges.length === 0)
                    throw new Error('Invalid room charge calculation.');

                for (const roomCharge of roomCharges) {
                    roomCharge.createdBy = sessionUser.id;
                    roomCharge.updatedBy = sessionUser.id;
                }

                c.i('Creating room charges');
                await this.roomChargeRepository.createMany(roomCharges, tx);

                const totalRoomCharges = roomCharges.reduce((accu, rc) => accu += rc.totalAmount, 0);
                reservation.totalAmount = totalRoomCharges;
                reservation = this.calculateAllAmount(reservation);
                await this.reservationRepository.update(reservation.id, reservation, tx);
            }

            c.fe('ReservationService > reservationCreate');
            return createdReservation;
        }, { isolationLevel: "read committed", accessMode: "read write" });
        return result;
    }


    async reservationGetById(id: string, sessionUser: SessionUser): Promise<Reservation | undefined> {
        c.fs('ReservationService > reservationGetById');
        return this.reservationRepository.reservationGetById(id);
    }


    async reservationMoveRoom(id: string, roomNo: string, date: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationMoveRoom');
        c.d(id);
        c.d(roomNo);

        c.i('retrieve new room info');
        const room: Room = await this.roomRepository.findOne(and(eq("roomNo", roomNo), eq("location", sessionUser.location)));
        if (!room) throw new CustomError('Cannot find room while moving room');

        c.i('Retrieve reservation.');
        let reservation: Reservation = await this.reservationRepository.findById(id);
        if (!reservation) throw new CustomError('Cannot find reservation while moving room');

        let [roomReservations, count]: [RoomReservation[], Number] = await this.roomReservationRepository.findMany(eq('reservationId', id));
        if (!roomReservations) throw new CustomError('Cannot find room reservations.');

        roomReservations = roomReservations.sort((a, b) => a.checkInDate.getTime() - b.checkInDate.getTime());
        const roomReservation = roomReservations[0];

        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            c.i('Inside transaction');
            const newCheckInDate = new Date(date);
            const checkOutDate = new Date(date);
            checkOutDate.setDate(checkOutDate.getDate() - 1);
            c.i('Update current roomReservation record');
            roomReservation.updatedAtUTC = new Date();
            roomReservation.updatedBy = sessionUser.id;
            roomReservation.checkOutDate = checkOutDate;
            await this.roomReservationRepository.update(roomReservation.id, { checkOutDate: checkOutDate, updatedAtUTC: new Date(), updatedBy: sessionUser.id } as RoomReservation, tx as any);

            c.i('Create new roomReservation record');
            const newRoomReservation = new RoomReservation();
            newRoomReservation.reservationId = id;
            newRoomReservation.roomId = room.id;
            newRoomReservation.checkInDate = newCheckInDate;
            newRoomReservation.checkOutDate = reservation.checkOutDate;
            newRoomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
            newRoomReservation.roomTypeId = room.roomTypeId;
            newRoomReservation.createdAtUTC = new Date();
            newRoomReservation.createdBy = sessionUser.id;
            newRoomReservation.updatedAtUTC = new Date();
            newRoomReservation.updatedBy = sessionUser.id;

            roomReservations.push(newRoomReservation);

            await this.roomReservationRepository.create(newRoomReservation, tx as any);

            await this.roomChargeRepository.deleteWhere(eq('reservationId', id), tx as any);

            const [roomTypes, rtc] = await this.roomTypeRepository.findMany(eq("location", reservation.location));
            if (!roomTypes) throw new CustomError('Service cannot find room types.');

            const [roomRates, rrc] = await this.roomRateRepository.findMany(eq("location", reservation.location));
            if (!roomRates) throw new CustomError('Service cannot find room rates.');

            const prepaidPackageTypeValue = await this.getPrepaidPackageTypeValue(reservation);
            const roomCharges = await RoomRateEngine.calculate(reservation, roomReservations, roomTypes, roomRates, prepaidPackageTypeValue);
            if (!roomCharges || roomCharges.length === 0)
                throw new Error('Invalid room charge calculation.');
            console.log(`Room Charges: ${roomCharges.length}`);

            for (const roomCharge of roomCharges) {
                roomCharge.createdAtUTC = new Date();
                roomCharge.createdBy = sessionUser.id;
                roomCharge.updatedAtUTC = new Date();
                roomCharge.updatedBy = sessionUser.id;
            }
            await this.roomChargeRepository.createMany(roomCharges, tx as any);

            const totalRoomCharges = roomCharges.reduce((accu, rc) => accu += rc.totalAmount, 0);
            reservation.roomNo = roomNo;
            reservation.totalAmount = totalRoomCharges;
            reservation = this.calculateAllAmount(reservation); console.log(reservation);
            await this.reservationRepository.update(reservation.id, reservation, tx as any);
        }, {
            isolationLevel: "read uncommitted",
            accessMode: "read write",
            withConsistentSnapshot: false,
        });
    }


    async reservationPatch(id: string, reservation: Reservation, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationPatch');

        if (!id || id === 'undefined') {
            throw new Error('Reservation update failed. Id is required.');
        }

        if (!reservation) {
            throw new Error('Reservation update failed. Reservation is required.');
        }

        if (!sessionUser) {
            throw new Error('Reservation update failed. Invalid session.');
        }

        c.i('Preparing reservation to update');
        reservation.updatedBy = sessionUser.id;
        reservation.updatedAtUTC = new Date();

        c.i('Updating reservation.');
        await this.reservationRepository.update(id, reservation);
    }


    async reservationUpdateDropOffInfo(id: string, carNo: string, driver: string, dropOffRemark: string, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationUpdateDropOffInfo');
        if (!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');

        return await this.reservationRepository.update(id, { dropOffCarNo: carNo, dropOffDriver: driver, dropOffRemark } as Reservation);
    }


    async reservationUpdatePickUpInfo(id: string, carNo: string, driver: string, pickupRemark: string, sessionUser: SessionUser): Promise<void> {
        c.i('ReservationService > reservationUpdatePickUpInfo');
        if (!id || id === 'undefined')
            throw new Error('Car number update failed. Id is required.');

        return await this.reservationRepository.update(id, { pickUpCarNo: carNo, pickUpDriver: driver, pickupRemark } as Reservation);
    }


    async reservationUpdateInvoiceStatus(id: string, invoiceStatus: string, invoiceNumber: string | undefined, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationUpdateInvoiceStatus');

        if (!id || id === 'undefined') {
            throw new Error('Reservation update failed. Id is required.');
        }

        if (!sessionUser) {
            throw new Error('Reservation update failed. Invalid session.');
        }

        c.i('Retrieving invoice status id');
        const invoiceStatusConfig = await this.configRepository.findOne(or(
            and(eq("group", "INVOICE_STATUS"), eq("value", invoiceStatus)),
            and(eq("group", "INVOICE_STATUS"), eq("text", invoiceStatus))
        ));
        if (!invoiceStatusConfig) throw new CustomError('Reservation service cannot find invoice status');

        c.i('Preparing reservation invoice status update');
        const reservation = {
            updatedBy: sessionUser.id,
            updatedAtUTC: new Date(),
            invoiceNumber: invoiceNumber || '',
            invoiceStatus: invoiceStatus,
            invoiceStatusId: invoiceStatusConfig.id
        };

        c.i('Updating reservation invoice status');
        await this.reservationRepository.update(id, reservation as any as Reservation);
    }


    async reservationUpdate(id: string, reservation: Reservation, sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > reservationUpdate');

        if (!id || id === 'undefined') {
            throw new Error('Reservation update failed. Id is required.');
        }

        if (!reservation) {
            throw new Error('Reservation update failed. Reservation is required.');
        }

        let reCalculate = false;

        c.i('Preparing reservation to update');
        reservation.updatedBy = sessionUser.id;
        reservation.updatedAtUTC = new Date();

        c.i('Retrieveing reservation status id');
        const reservationStatus = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_STATUS), eq("value", reservation.reservationStatus)));
        if (!reservationStatus) throw new CustomError('Reservation service cannot find reservation status');
        reservation.reservationStatusId = reservationStatus.id;

        c.i('Retrieveing reservation type id');
        const reservationType = await this.configRepository.findOne(and(eq("group", ConfigGroup.RESERVATION_TYPE), eq("value", reservation.reservationType)));
        if (!reservationType) throw new CustomError('Reservation service cannot find reservation type');
        reservation.reservationTypeId = reservationType.id;

        if (reservation.prepaidPackage) {
            c.i('Retrieveing prepaid package id');
            const prepaidPackage = await this.prepaidRepository.findOne(eq("value", reservation.prepaidPackage));
            if (!prepaidPackage) throw new CustomError('Reservation service cannot find prepaid package');
            reservation.prepaidPackageId = prepaidPackage.id;
        } else {
            reservation.prepaidPackageId = null;
        }

        if (reservation.promotionPackage) {
            c.i('Retrieveing promotion package id');
            const prromotionPackage = await this.promotionRepository.findOne(eq("value", reservation.promotionPackage));
            if (!prromotionPackage) throw new CustomError('Reservation service cannot find promotion package');
            reservation.promotionPackageId = prromotionPackage.id;
        } else {
            reservation.promotionPackageId = null;
        }

        if (reservation.invoiceStatus) {
            c.i('Retrieveing invoice status id');
            const invoiceStatus = await this.configRepository.findOne(or(
                and(eq("group", "INVOICE_STATUS"), eq("value", reservation.invoiceStatus)),
                and(eq("group", "INVOICE_STATUS"), eq("text", reservation.invoiceStatus))
            ));
            if (!invoiceStatus) throw new CustomError('Reservation service cannot find invoice status');
            reservation.invoiceStatusId = invoiceStatus.id;
        }

        if (reservation.pickUpType) {
            c.i('Retrieveing pickup type id');
            const pickupType = await this.configRepository.findOne(and(eq("group", ConfigGroup.RIDE_TYPE), eq("value", reservation.pickUpType)));
            if (!pickupType) throw new CustomError('Reservation service cannot find pickup type.');
            reservation.pickUpTypeId = pickupType.id;
        } else {
            reservation.pickUpTypeId = null;
        }

        if (reservation.dropOffType) {
            c.i('Retrieveing pickup type id');
            const dropOffType = await this.configRepository.findOne(and(eq("group", ConfigGroup.RIDE_TYPE), eq("value", reservation.dropOffType)));
            if (!dropOffType) throw new CustomError('Reservation service cannot find drop off type.');
            reservation.dropOffTypeId = dropOffType.id;
        } else {
            reservation.dropOffTypeId = null;
        }

        c.i('Retrieveing original reservation');
        const originalReservation = await this.reservationRepository.findById(id);
        if (!originalReservation)
            throw new CustomError('Cannot find original reservation.');

        const result = this.dbClient.db.transaction(async (tx: TransactionType) => {

            c.i('Updating reservation');
            reservation.totalAmount = originalReservation.totalAmount;
            reservation.paidAmount = originalReservation.paidAmount;
            reservation = this.calculateAllAmount(reservation);
            await this.reservationRepository.update(id, reservation, tx as any);

            c.i('Checking and comparing customers');
            const [existingCustomers, _] = await this.reservationCustomerRepository.findMany(eq("reservationId", id));
            if (existingCustomers) {
                c.i('Existing customers for the reservation.');
                if (reservation.customers?.length > 0) {
                    c.i('There are customers for the reservation. Compare customers.');
                    for(const incomingCustomer of reservation.customers){
                        const foundCustomer = existingCustomers.find(ec => incomingCustomer.id === ec.customerId);
                        if(!foundCustomer){
                            c.i('New customer not found in existing, insert new');
                            c.i(`Find tdac status for new customer with value: ${incomingCustomer.tdacStatus}`);
                            const tdacStatusConfig = await this.configRepository.findOne(and(eq("group", ConfigGroup.TDAC_STATUS), eq("value", incomingCustomer.tdacStatus)));
                            if (!tdacStatusConfig) throw new CustomError('Cannot find TDAC status config for customer.');
                            const rc = new ReservationCustomer();
                            rc.reservationId = reservation.id;
                            rc.tdacStatusId = tdacStatusConfig.id;
                            rc.customerId = incomingCustomer.id;
                            rc.createdAtUTC = new Date();
                            rc.createdBy = sessionUser.id;
                            rc.updatedAtUTC = new Date();
                            rc.updatedBy = sessionUser.id;
                            await this.reservationCustomerRepository.create(rc, tx as any);
                        }else{
                            c.i('Existing customer found in new list. Compare TDAC status.');
                            const tdacStatusConfig = await this.configRepository.findOne(and(eq("group", ConfigGroup.TDAC_STATUS), eq("value", incomingCustomer.tdacStatus)));
                            if (!tdacStatusConfig) throw new CustomError('Cannot find TDAC status config for customer.');
                            if(foundCustomer.tdacStatusId !== tdacStatusConfig.id){
                                c.i('TDAC status changed. Update.');
                                await this.reservationCustomerRepository.update(foundCustomer.id, { tdacStatusId: tdacStatusConfig.id, updatedAtUTC: new Date(), updatedBy: sessionUser.id } as ReservationCustomer, tx as any);
                            }
                        }
                    }
                    c.i('Removing existing customers if not exit in new customer list.');
                    for(const ec of existingCustomers){
                        const foundCustomer = reservation.customers.find(nc => nc.id === ec.customerId);
                        if(!foundCustomer){
                            c.i('Existing customer not found in new list. Delete');
                            await this.reservationCustomerRepository.delete(ec.id, tx as any);
                        }
                    }
                } else {
                    c.i('There are no customers for the reservation. Deleting existing');
                    await this.reservationCustomerRepository.deleteWhere(eq("reservationId", id));
                }
            } else {
                c.i('No existing customers for the reservation.');
                if (reservation.customers?.length > 0) {
                    c.i('There are new customers for the reservation');
                    const newReservationCustomers = await Promise.all(reservation.customers.map(async (customer) => {
                        c.i(`Find tdac status for new customer with value: ${customer.tdacStatus}`);
                        const tdacStatusConfig = await this.configRepository.findOne(and(eq("group", ConfigGroup.TDAC_STATUS), eq("value", customer.tdacStatus)));
                        if (!tdacStatusConfig) throw new CustomError('Cannot find TDAC status config for customer.');
                        const rc = new ReservationCustomer();
                        rc.reservationId = reservation.id;
                        rc.customerId = customer.id;
                        rc.tdacStatusId = tdacStatusConfig.id;
                        rc.createdAtUTC = new Date();
                        rc.createdBy = sessionUser.id;
                        rc.updatedAtUTC = new Date();
                        rc.updatedBy = sessionUser.id;
                        return rc;
                    }));
                    await this.reservationCustomerRepository.createMany(newReservationCustomers, tx as any);
                } else {
                    c.i('There are no new customers for the reservation. Do nothing.');
                }
            }

            await this.reconcilePackageUsage(reservation, sessionUser, tx);

            const room = await this.roomRepository.findOne(eq("roomNo", reservation.roomNo));
            if (room && reservation.roomNo && originalReservation.roomNo !== reservation.roomNo) {
                reCalculate = true; console.log('room no changed');
            } else if (reservation.checkInDate.getTime() !== originalReservation.checkInDate.getTime()) {
                reCalculate = true; console.log('check in date changed');
            } else if (reservation.checkOutDate.getTime() !== originalReservation.checkOutDate.getTime()) {
                reCalculate = true; console.log('check out date changed');
            } else if (reservation.isSingleOccupancy !== originalReservation.isSingleOccupancy) {
                reCalculate = true; console.log('is single occupancy changed');
            } else if (reservation.noOfGuests !== originalReservation.noOfGuests) {
                reCalculate = true; console.log('no of guests changed');
            } else if (reservation.reservationTypeId !== originalReservation.reservationTypeId) {
                reCalculate = true; console.log('reservation type changed');
            } else if (reservation.prepaidPackageId !== originalReservation.prepaidPackageId && ((reservation.prepaidPackageId && originalReservation.prepaidPackageId) || (reservation.prepaidPackageId && !originalReservation.prepaidPackageId) || (!reservation.prepaidPackageId && originalReservation.prepaidPackageId))) {
                reCalculate = true; console.log(`prepaid package changed: ${reservation.prepaidPackageId} - ${originalReservation.prepaidPackageId}`);
            } else if (reservation.promotionPackageId !== originalReservation.promotionPackageId && ((reservation.promotionPackageId && originalReservation.promotionPackageId) || (reservation.promotionPackageId && !originalReservation.promotionPackageId) || (!reservation.promotionPackageId && originalReservation.promotionPackageId))) {
                reCalculate = true; console.log('promotion package changed');
            }


            if (reservation.roomNo && reCalculate) {

                c.i('vital changed, delete all room reservations and room charges');
                await this.roomReservationRepository.deleteWhere(eq("reservationId", reservation.id), tx as any);
                await this.roomChargeRepository.deleteWhere(eq("reservationId", reservation.id), tx as any);

                const room = await this.roomRepository.findOne(and(eq("roomNo", reservation.roomNo), eq("location", sessionUser.location)));
                if (!room) throw new CustomError('Room not found.');

                const roomReservation = new RoomReservation();
                roomReservation.reservationId = reservation.id;
                roomReservation.roomId = room.id;
                roomReservation.roomTypeId = room.roomTypeId;
                roomReservation.roomNo = room.roomNo;
                roomReservation.checkInDate = reservation.checkInDate;
                roomReservation.checkOutDate = reservation.checkOutDate;
                roomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
                roomReservation.createdBy = sessionUser.id;
                roomReservation.updatedAtUTC = new Date();
                roomReservation.updatedBy = sessionUser.id;
                const rrResult = await this.roomReservationRepository.create(roomReservation, tx as any);
                if (!rrResult)
                    throw new Error('Room reservation creation failed.');

                const [roomTypes, rtc] = await this.roomTypeRepository.findMany(eq("location", reservation.location));
                if (!roomTypes) throw new CustomError('Service cannot find room types.');

                const [roomRates, rrc] = await this.roomRateRepository.findMany(eq("location", reservation.location));
                if (!roomRates) throw new CustomError('Service cannot find room rates.');

                const prepaidPackageTypeValue = await this.getPrepaidPackageTypeValue(reservation);
                const roomCharges = await RoomRateEngine.calculate(reservation, [roomReservation], roomTypes, roomRates, prepaidPackageTypeValue);
                if (!roomCharges || roomCharges.length === 0)
                    throw new Error('Invalid room charge calculation.');

                for (const roomCharge of roomCharges) {
                    roomCharge.createdAtUTC = new Date();
                    roomCharge.createdBy = sessionUser.id;
                    roomCharge.updatedAtUTC = new Date();
                    roomCharge.updatedBy = sessionUser.id;
                    const result = await this.roomChargeRepository.create(roomCharge, tx as any);
                    if (!result)
                        throw new Error('Room charges saved failed.');
                }

                const totalRoomCharges = roomCharges.reduce((accu, rc) => accu += rc.totalAmount, 0);
                reservation.totalAmount = totalRoomCharges;
                reservation = this.calculateAllAmount(reservation);
                await this.reservationRepository.update(reservation.id, reservation, tx as any);
            } else if (!reservation.roomNo) {
                c.i('no room number, clear all room reservations and room charges');
                await this.roomReservationRepository.deleteWhere(eq("reservationId", reservation.id), tx as any);
                await this.roomChargeRepository.deleteWhere(eq("reservationId", reservation.id), tx as any);
                reservation.totalAmount = 0;
                reservation = this.calculateAllAmount(reservation);
                await this.reservationRepository.update(reservation.id, reservation, tx as any);
            }
        });

        return result;
    }


    async roomReservationCreate(reservation: Reservation, sessionUser: SessionUser, transaction: TransactionType): Promise<RoomReservation> {
        const room = await this.roomRepository.findOne(and(eq("roomNo", reservation.roomNo), eq("location", sessionUser.location)));
        if (!room) throw new Error('Cannot find room while saving room reservation.');

        const roomReservation = new RoomReservation();
        roomReservation.reservationId = reservation.id;
        roomReservation.roomId = room.id;
        roomReservation.roomTypeId = room.roomTypeId;
        roomReservation.roomNo = room.roomNo;
        roomReservation.checkInDate = reservation.checkInDate;
        roomReservation.checkOutDate = reservation.checkOutDate;
        roomReservation.isSingleOccupancy = reservation.isSingleOccupancy;
        roomReservation.createdBy = sessionUser.id;
        roomReservation.updatedBy = sessionUser.id;
        const rrResult = await this.roomReservationRepository.create(roomReservation, transaction as any);

        if (!rrResult) throw new CustomError('Room reservation creation failed.');

        return rrResult as RoomReservation;
    }


    async roomChargeGetListById(reservationId: string, sessionUser: SessionUser): Promise<RoomCharge[]> {
        c.fs('ReservationService > roomChargeGetListById');
        const [result] = await this.roomChargeRepository.findMany(eq("reservationId", reservationId), asc("startDate"));
        return result;
    }


    async roomReservationGetListById(reservationId: string, includeChildren: boolean, sessionUser: SessionUser): Promise<[RoomReservation[], number]> {
        c.fs('ReservationService > roomReservationGetListById');
        return await this.reservationRepository.roomReservationGetListById(reservationId, includeChildren, sessionUser);
    }


    async roomReservationGetList(searchFormFields: SearchFormFields, sessionUser: SessionUser): Promise<RoomReservationDto[]> {
        c.fs('ReservationService > roomReservationGetList');
        return await this.reservationRepository.roomAndReservationGetList(searchFormFields, sessionUser);
    }


    async roomReservationUpdateList(reservationId: string, roomReservations: RoomReservation[], sessionUser: SessionUser): Promise<void> {
        c.fs('ReservationService > roomReservationUpdateList');
        if (!reservationId || reservationId === 'undefined')
            throw new Error('Room reservation update failed. Reservation id is required.');
        if (!roomReservations || roomReservations.length === 0)
            throw new Error('Room reservation update failed. No data to process.');
        await this.reservationRepository.roomReservationUpdateList(reservationId, roomReservations, sessionUser);
    }


    async roomScheduleGetList(searchFormFields: SearchFormFields, sessionUser: SessionUser): Promise<[Room[], number]> {
        c.fs('ReservationService > roomScheduleGetList');
        return await this.reservationRepository.roomScheduleGetList(searchFormFields, sessionUser);
    }

}