import { inject, injectable } from "inversify";
import "reflect-metadata";
import { billTable, configTable, customerTable, paymentTable, reservationCustomerTable, reservationTable, roomTable } from "@/core/orms/drizzle/mysql/schema";
import { TYPES } from "@/core/types";
import { type IDatabaseClient } from "@/lib/db/IDatabase";
import IReportRepository from "../contracts/IReportRepository";
import DailySummaryGuestsRoomsReportRow from "@/core/models/dto/reports/DailySummaryGuestsRoomsReportrow";
import { getUTCDateRange, getUTCFirstDate } from "@/lib/utils";
import { and, count, countDistinct, eq, gt, gte, lt, lte, ne, or, sql, sum, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { CustomError } from "@/lib/errors";
import c from "@/lib/loggers/console/ConsoleLogger";
import DailySummaryIncomeReportRow from "@/core/models/dto/reports/DailySummaryIncomeReportRow";
import DailySummaryPersonReportRow from "@/core/models/dto/reports/DailySummaryPersonReportRow";
import DailySummaryReservationStatusReportRow from "@/core/models/dto/reports/DailySummaryReservationStatusReportRow";
import DailySummaryRoomOccupancyReportRow, { DailySummaryRoomOccupancyCell } from "@/core/models/dto/reports/DailySummaryRoomOccupancyReportRow";
import DailySummaryZoneGuestsReportRow from "@/core/models/dto/reports/DailySummaryZoneGuestsReportRow";
import MonthlySummaryReservationStatusReportRow from "@/core/models/dto/reports/MonthlySummaryReservationStatusReportRow";
import Bill from "@/core/models/domain/Bill";
import Payment from "@/core/models/domain/Payment";
import Reservation from "@/core/models/domain/Reservation";
import SessionUser from "@/core/models/dto/SessionUser";
import DailyReservationDetailReportRow from "@/core/models/dto/reports/DailyReservationDetailReportRow";
import { PickupDropoffReportResponse, PickupDropoffRow, PickupDropoffSummary } from '@/core/models/dto/reports/PickupDropoffReportResponse';
import RoomCharge from "@/core/models/domain/RoomCharge";


@injectable()
export default class ReportRepository implements IReportRepository {

    reservationTypeAlias = alias(configTable, 'reservation_type');
    reservationStatusAlias = alias(configTable, 'reservation_status');
    pickUpAlias = alias(configTable, 'pickUpAlias');
    dropOffAlias = alias(configTable, 'dropOffAlias');

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>
    ) {

    }


    async getDailySummaryGuestsRoomsReport(startDate: string, endDate: string, reservationStatus: string, sessionUser: SessionUser): Promise<DailySummaryGuestsRoomsReportRow[]> {
        c.fs("Repository > getDailySummaryGuestsRoomsReport");
        c.d(startDate);
        c.d(endDate);
        c.d(reservationStatus);

        const reports: DailySummaryGuestsRoomsReportRow[] = [];
        const dateRanges = getUTCDateRange(startDate, endDate);
        c.d(dateRanges);
        if (!dateRanges || dateRanges.length === 0) throw new CustomError("Invalid date range calculated in report generation.");

        let reservationStatusCondition = sql`1=1`;
        if (reservationStatus) {
            const statuses = reservationStatus.split(',').map(item => item.trim().toUpperCase()).filter(Boolean);
            if (statuses.length > 0) {
                reservationStatusCondition = inArray(configTable.value, statuses);
            }
        }

        c.i('Generating report.');
        for (const dr of dateRanges) {
            const start: Date = new Date(dr);
            const report = new DailySummaryGuestsRoomsReportRow();
            report.date = start;

            c.i('Retrieve checkin guests');
            const [guestsCheckIn] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(
                    and(
                        eq(reservationTable.checkInDate, start),
                        reservationStatusCondition,
                        eq(reservationTable.location, sessionUser.location)
                    )).limit(1);
            report.guestsCheckIn = Number(guestsCheckIn.sum ?? 0);
            report.reservationCheckIn = Number(guestsCheckIn.count ?? 0);

            c.i('Retrieve checkout guests');
            const [guestsCheckOut] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(
                    and(
                        eq(reservationTable.checkOutDate, start),
                        reservationStatusCondition,
                        eq(reservationTable.location, sessionUser.location)
                    )).limit(1);
            report.guestsCheckOut = Number(guestsCheckOut.sum ?? 0);
            report.reservationCheckOut = Number(guestsCheckOut.count ?? 0);

            c.i('Retrieve Same day guests');
            const [guestsSameDayCheckOut] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(
                    and(
                        eq(reservationTable.checkInDate, reservationTable.checkOutDate),
                        eq(reservationTable.checkInDate, start),
                        reservationStatusCondition,
                        eq(reservationTable.location, sessionUser.location)
                    )).limit(1);
            report.guestsSameDayCheckOut = Number(guestsSameDayCheckOut.sum ?? 0);

            c.i('Retrieve existing guests');
            const [guestsExisting] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(
                    and(
                        lt(reservationTable.checkInDate, start),
                        gt(reservationTable.checkOutDate, start),
                        reservationStatusCondition,
                        eq(reservationTable.location, sessionUser.location)
                    )).limit(1);

            c.i('Retrieve total room staying');

            const [roomsTotalStaying] = await this.dbClient.db.select({ count: countDistinct(reservationTable.roomNo) })
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(
                    and(
                        lte(reservationTable.checkInDate, start),
                        or(
                            eq(reservationTable.checkOutDate, start),
                            gt(reservationTable.checkOutDate, start)
                        ),
                        reservationStatusCondition,
                        eq(reservationTable.location, sessionUser.location)
                    ));

            report.guestsExisting = Number(guestsExisting.sum ?? 0);
            report.reservationExisting = Number(guestsExisting.count ?? 0);

            report.reservationTotal = report.reservationCheckIn + report.reservationCheckOut + report.reservationExisting - guestsSameDayCheckOut.count;
            report.guestsTotal = report.guestsExisting + report.guestsCheckIn + report.guestsCheckOut - report.guestsSameDayCheckOut;

            c.i('Retrieve total rooms.');
            const [roomsTotal] = await this.dbClient.db.select({ count: count() })
                .from(roomTable).where(eq(roomTable.location, sessionUser.location)).limit(1);

            report.roomsCheckIn = 0;
            report.roomsCheckOut = 0;
            report.roomsExisting = 0;
            report.roomsTotal = roomsTotalStaying.count;
            report.roomsAvailable = roomsTotal.count - report.roomsTotal;
            reports.push(report);
        };
        c.d(reports.length);
        c.d(reports.length > 0 ? reports[0] : []);
        c.fe("Repository > getDailySummaryGuestsRoomsReport");
        return reports;
    }

    async getPickupDropoffReport(
        arrivalStartDateTime: string,
        arrivalEndDateTime: string,
        departureStartDateTime: string,
        departureEndDateTime: string,
        sessionUser: SessionUser
    ): Promise<PickupDropoffReportResponse> {
        c.fs('Repository > getPickupDropoffReport');
        c.d({ arrivalStartDateTime, arrivalEndDateTime, departureStartDateTime, departureEndDateTime, location: sessionUser.location });

        const arrivalStart = new Date(arrivalStartDateTime);
        const arrivalEnd = new Date(arrivalEndDateTime);
        const departureStart = new Date(departureStartDateTime);
        const departureEnd = new Date(departureEndDateTime);

        const checkInRowsRaw = await this.dbClient.db.select({ ...reservationTable, customer: { ...customerTable }, bill: { ...billTable } })
            .from(reservationTable)
            .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
            .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
            .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customerTable.id))
            .leftJoin(billTable, eq(billTable.reservationId, reservationTable.id))
            .where(
                and(
                    gte(reservationTable.arrivalDateTime, arrivalStart),
                    lte(reservationTable.arrivalDateTime, arrivalEnd),
                    ne(configTable.value, 'CCL'),
                    eq(reservationTable.location, sessionUser.location)
                )
            )
            .orderBy(reservationTable.arrivalDateTime, 'asc');

        c.d(`Arrival rows: ${checkInRowsRaw.length}`);
        c.d(checkInRowsRaw.length > 0 ? checkInRowsRaw[0] : {});

        const checkOutRowsRaw = await this.dbClient.db.select({ ...reservationTable, customer: { ...customerTable }, bill: { ...billTable } })
            .from(reservationTable)
            .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
            .leftJoin(reservationCustomerTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
            .leftJoin(customerTable, eq(reservationCustomerTable.customerId, customerTable.id))
            .leftJoin(billTable, eq(billTable.reservationId, reservationTable.id))
            .where(
                and(
                    gte(reservationTable.departureDateTime, departureStart),
                    lte(reservationTable.departureDateTime, departureEnd),
                    ne(configTable.value, 'CCL'),
                    eq(reservationTable.location, sessionUser.location)
                )
            )
            .orderBy(reservationTable.departureDateTime, 'asc');
        c.d(`Departure rows: ${checkOutRowsRaw.length}`);
        c.d(checkOutRowsRaw.length > 0 ? checkOutRowsRaw[0] : {});

        const transform = (rows: any[], isCheckOut = false) => {
            const reservations = rows.reduce((acc: any[], current: any) => {
                const { customer, bill, ...reservation } = current;
                let r = acc.find(x => x.id === current.id);
                if (!r) {
                    r = { ...reservation, customers: [], bills: [] };
                    r.noOfGuests = Number(r.noOfGuests ?? 0);
                    acc.push(r);
                }
                if (customer && !r.customers.find((c: any) => c.id === customer.id)) r.customers.push(customer);
                if (bill && !r.bills.find((b: any) => b.id === bill.id)) r.bills.push(bill);
                return acc;
            }, [] as any[]);

            return reservations.map((r: any) => {
                const arrivalDate = r.arrivalDateTime;
                const arrivalTime = r.arrivalDateTime;
                const dropOffBill = (r.bills || []).find((b: any) => ((b.paymentType || '').toUpperCase() === 'DROPOFF'));
                const sendingFee = dropOffBill ? `${dropOffBill.amount}${dropOffBill.currency}${dropOffBill.isPaid ? '(Paid)' : '(Unpaid)'}` : undefined;
                const remark = isCheckOut ? r.dropOffRemark : r.pickupRemark;
                const driverCar = isCheckOut ? `${r.dropOffDriver ?? ''}(${r.dropOffCarNo ?? ''})`.trim() : `${r.pickUpDriver ?? ''}(${r.pickUpCarNo ?? ''})`.trim();
                const row: PickupDropoffRow = {
                    reservationId: r.id,
                    names: r.customers?.map((c: any) => `${c.englishName} ${c.name}`.trim()),
                    pax: Number(r.noOfGuests ?? 0),
                    arrivalDate,
                    departureDate: r.departureDateTime,
                    arrivalFlightNo: r.arrivalFlight ?? '',
                    departureFlightNo: r.departureFlight ?? '',
                    arrivalTime,
                    departureTime: r.departureDateTime,
                    room: r.roomNo ?? '',
                    remark,
                    driverCar,
                    sendingFee: isCheckOut ? sendingFee : undefined
                };
                return row;
            });
        };

        const checkIn = transform(checkInRowsRaw || [], false);
        const checkOut = transform(checkOutRowsRaw || [], true);

        const summary: PickupDropoffSummary = {
            totalCheckIn: checkIn.length,
            totalCheckInPax: checkIn.reduce((s, r) => s + Number(r.pax ?? 0), 0),
            totalCheckOut: checkOut.length,
            totalCheckOutPax: checkOut.reduce((s, r) => s + Number(r.pax ?? 0), 0)
        };

        c.fe('Repository > getPickupDropoffReport');
        return { summary, checkIn, checkOut } as PickupDropoffReportResponse;
    }


    async getDailySummaryIncomeReport(startDate: string, endDate: string, reservationType: string, reservationStatus: string, sessionUser: SessionUser): Promise<DailySummaryIncomeReportRow[]> {
        c.fs("Repository > getDailySummaryIncomeReport");
        c.d({ startDate, endDate, reservationType, reservationStatus, sessionUser });

        var reservationTypeId = null;
        if (reservationType) {
            const [result] = await this.dbClient.db
                .select().from(configTable)
                .where(and(
                    eq(configTable.value, reservationType),
                    eq(configTable.group, 'RESERVATION_TYPE')
                ));
            if (result) reservationTypeId = result.id;
            c.d(reservationTypeId);
            c.d(result);
        }

        const reports: DailySummaryIncomeReportRow[] = [];
        const dateRanges = getUTCDateRange(startDate, endDate);
        c.d(dateRanges ? dateRanges[0] : []);
        if (!dateRanges || dateRanges.length === 0) throw new CustomError("Invalid date range calculated in report generation.");

        const reservationStatusTable = alias(configTable, "reservationStatus");
        const reservationTypeTable = alias(configTable, "reservationType");

        let reservationStatusCondition = sql`1=1`;
        if (reservationStatus) {
            const statuses = reservationStatus.split(',').map(item => item.trim().toUpperCase()).filter(Boolean);
            if (statuses.length > 0) {
                reservationStatusCondition = inArray(reservationStatusTable.value, statuses);
            }
        }

        c.i('Generating report.');
        for (const dr of dateRanges) {
            const start: Date = new Date(dr);
            const report = new DailySummaryIncomeReportRow();
            report.date = start;
            const conditions = [];
            conditions.push(eq(reservationTable.checkInDate, start));
            conditions.push(ne(reservationStatusTable.value, 'CCL'));
            conditions.push(eq(reservationTable.location, sessionUser.location));
            if (reservationTypeId) {
                conditions.push(eq(reservationTable.reservationTypeId, reservationTypeId));
            }

            const totalCheckInReservations: Reservation[] = await this.dbClient.db
                .select(
                    { ...reservationTable }
                )
                .from(reservationTable)
                .innerJoin(reservationStatusTable, eq(reservationStatusTable.id, reservationTable.reservationStatusId))
                .innerJoin(reservationTypeTable, and(
                    eq(reservationTypeTable.id, reservationTable.reservationTypeId)
                ))
                .where(
                    and(
                        ...conditions,
                        reservationStatusCondition
                    ));
            const query = this.dbClient.db
                .select(
                    { ...reservationTable }
                )
                .from(reservationTable)
                .innerJoin(reservationStatusTable, eq(reservationStatusTable.id, reservationTable.reservationStatusId))
                .innerJoin(reservationTypeTable, and(
                    eq(reservationTypeTable.id, reservationTable.reservationTypeId)
                ))
                .where(
                    and(
                        ...conditions,
                        reservationStatusCondition
                    ));
            report.totalCheckInReservations = Number(totalCheckInReservations.length ?? 0);
            c.d(`Total check-in reservations: ${report.totalCheckInReservations}`);

            for (const reservation of totalCheckInReservations) {
                report.totalRoomCharge = report.totalRoomCharge + Number(reservation.totalAmount ?? 0);
                report.totalDeposit = report.totalDeposit + Number(reservation.depositAmount ?? 0);
                report.totalTaxAmount = report.totalTaxAmount + Number(reservation.taxAmount ?? 0);
                report.totalDiscount = report.totalDiscount + Number(reservation.discountAmount ?? 0);
                report.totalPaid = report.totalPaid + Number(reservation.paidAmount ?? 0);
                report.totalDue = report.totalDue + Number(reservation.dueAmount ?? 0);

                if (reservation.depositPaymentMode === 'BANK') {
                    if (reservation.depositCurrency === 'KWR') {
                        report.totalDepositBankKWR = report.totalDepositBankKWR + Number(reservation.depositAmountInCurrency ?? 0);
                    } else if (reservation.depositCurrency === 'MMK') {
                        report.totalDepositBankMMK = report.totalDepositBankMMK + Number(reservation.depositAmountInCurrency ?? 0);
                    } else if (reservation.depositCurrency === 'THB') {
                        report.totalDepositBankTHB = report.totalDepositBankTHB + Number(reservation.depositAmountInCurrency ?? 0);
                    } else if (reservation.depositCurrency === 'USD') {
                        report.totalDepositBankUSD = report.totalDepositBankUSD + Number(reservation.depositAmountInCurrency ?? 0);
                    }
                } else if (reservation.depositPaymentMode === 'CASH') {
                    if (reservation.depositCurrency === 'KWR') {
                        report.totalDepositCashKWR = report.totalDepositCashKWR + Number(reservation.depositAmountInCurrency ?? 0);
                    } else if (reservation.depositCurrency === 'MMK') {
                        report.totalDepositCashMMK = report.totalDepositCashMMK + Number(reservation.depositAmountInCurrency ?? 0);
                    } else if (reservation.depositCurrency === 'THB') {
                        report.totalDepositCashTHB = report.totalDepositCashTHB + Number(reservation.depositAmountInCurrency ?? 0);
                    } else if (reservation.depositCurrency === 'USD') {
                        report.totalDepositCashUSD = report.totalDepositCashUSD + Number(reservation.depositAmountInCurrency ?? 0);
                    }
                }


                const payments: Payment[] = await this.dbClient.db.select()
                    .from(paymentTable).where(eq(paymentTable.reservationId, reservation.id));
                for (const payment of payments) {
                    if (payment.currency === 'KWR') {
                        report.totalRoomChargeKWR = report.totalRoomChargeKWR + Number(payment.amountInCurrency ?? 0);
                    } else if (payment.currency === 'THB') {
                        report.totalRoomChargeTHB = report.totalRoomChargeTHB + Number(payment.amountInCurrency ?? 0);
                    } else if (payment.currency === 'USD') {
                        report.totalRoomChargeUSD = report.totalRoomChargeUSD + Number(payment.amountInCurrency ?? 0);
                    } else if (payment.currency === 'MMK') {
                        report.totalRoomChargeMMK = report.totalRoomChargeMMK + Number(payment.amountInCurrency ?? 0);
                    }
                    if (payment.paymentMode === 'BANK') {
                        if (payment.currency === 'KWR') {
                            report.totalRoomChargeBankKWR = report.totalRoomChargeBankKWR + Number(payment.amountInCurrency ?? 0);
                        } else if (payment.currency === 'THB') {
                            report.totalRoomChargeBankTHB = report.totalRoomChargeBankTHB + Number(payment.amountInCurrency ?? 0);
                        } else if (payment.currency === 'USD') {
                            report.totalRoomChargeBankUSD = report.totalRoomChargeBankUSD + Number(payment.amountInCurrency ?? 0);
                        } else if (payment.currency === 'MMK') {
                            report.totalRoomChargeBankMMK = report.totalRoomChargeBankMMK + Number(payment.amountInCurrency ?? 0);
                        }
                    } else if (payment.paymentMode === 'CASH') {
                        if (payment.currency === 'KWR') {
                            report.totalRoomChargeCashKWR = report.totalRoomChargeCashKWR + Number(payment.amountInCurrency ?? 0);
                        } else if (payment.currency === 'THB') {
                            report.totalRoomChargeCashTHB = report.totalRoomChargeCashTHB + Number(payment.amountInCurrency ?? 0);
                        } else if (payment.currency === 'USD') {
                            report.totalRoomChargeCashUSD = report.totalRoomChargeCashUSD + Number(payment.amountInCurrency ?? 0);
                        } else if (payment.currency === 'MMK') {
                            report.totalRoomChargeMMK = report.totalRoomChargeMMK + Number(payment.amountInCurrency ?? 0);
                        }
                    }
                }

                const bills: Bill[] = await this.dbClient.db.select()
                    .from(billTable).where(eq(billTable.reservationId, reservation.id));
                for (const bill of bills) {
                    if (bill.paymentMode === 'BANK') {
                        if (bill.paymentType === 'OTHER') {
                            if (bill.currency === 'KWR') {
                                report.totalBillBankKWR = report.totalBillBankKWR + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'MMK') {
                                report.totalBillBankMMK = report.totalBillBankMMK + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'THB') {
                                report.totalBillBankTHB = report.totalBillBankTHB + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'USD') {
                                report.totalBillBankUSD = report.totalBillBankUSD + Number(bill.amount ?? 0);
                            }
                        } else if (bill.paymentType === 'PICKUP') {
                            if (bill.currency === 'KWR') {
                                report.totalPickUpBankKWR = report.totalPickUpBankKWR + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'MMK') {
                                report.totalPickUpBankMMK = report.totalPickUpBankMMK + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'THB') {
                                report.totalPickUpBankTHB = report.totalPickUpBankTHB + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'USD') {
                                report.totalPickUpBankUSD = report.totalPickUpBankUSD + Number(bill.amount ?? 0);
                            }
                        } else if (bill.paymentType === 'DROPOFF') {
                            if (bill.currency === 'KWR') {
                                report.totalDropOffCashKWR = report.totalDropOffCashKWR + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'MMK') {
                                report.totalDropOffBankMMK = report.totalDropOffBankMMK + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'THB') {
                                report.totalDropOffBankTHB = report.totalDropOffBankTHB + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'USD') {
                                report.totalDropOffBankUSD = report.totalDropOffBankUSD + Number(bill.amount ?? 0);
                            }
                        }
                    } else if (bill.paymentMode === 'CASH') {
                        if (bill.paymentType === 'PICKUP') {
                            if (bill.currency === 'KWR') {
                                report.totalPickUpCashKWR = report.totalPickUpCashKWR + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'MMK') {
                                report.totalPickUpCashMMK = report.totalPickUpCashMMK + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'THB') {
                                report.totalPickUpCashTHB = report.totalPickUpCashTHB + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'USD') {
                                report.totalPickUpCashUSD = report.totalPickUpCashUSD + Number(bill.amount ?? 0);
                            }
                        } else if (bill.paymentType === 'DROPOFF') {
                            if (bill.currency === 'KWR') {
                                report.totalDropOffCashKWR = report.totalDropOffCashKWR + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'MMK') {
                                report.totalDropOffCashMMK = report.totalDropOffCashMMK + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'THB') {
                                report.totalDropOffCashTHB = report.totalDropOffCashTHB + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'USD') {
                                report.totalDropOffCashUSD = report.totalDropOffCashUSD + Number(bill.amount ?? 0);
                            }
                        } else {
                            if (bill.currency === 'KWR') {
                                report.totalBillCashKWR = report.totalBillCashKWR + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'MMK') {
                                report.totalBillCashMMK = report.totalBillCashMMK + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'THB') {
                                report.totalBillCashTHB = report.totalBillCashTHB + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'USD') {
                                report.totalBillCashUSD = report.totalBillCashUSD + Number(bill.amount ?? 0);
                            }
                        }
                    }
                }

                report.totalBankKWR = report.totalRoomChargeBankKWR + report.totalDepositBankKWR + report.totalDropOffBankKWR + report.totalPickUpBankKWR + report.totalBillBankKWR;
                report.totalBankMMK = report.totalRoomChargeBankMMK + report.totalDepositBankMMK + report.totalDropOffBankMMK + report.totalPickUpBankMMK + report.totalBillBankMMK;
                report.totalBankTHB = report.totalRoomChargeBankTHB + report.totalDepositBankTHB + report.totalDropOffBankTHB + report.totalPickUpBankTHB + report.totalBillBankTHB;
                report.totalBankUSD = report.totalRoomChargeBankUSD + report.totalDepositBankUSD + report.totalDropOffBankUSD + report.totalPickUpBankUSD + report.totalBillBankUSD;

                report.totalCashKWR = report.totalRoomChargeCashKWR + report.totalDepositCashKWR + report.totalDropOffCashKWR + report.totalPickUpCashKWR + report.totalBillCashKWR;
                report.totalCashMMK = report.totalRoomChargeCashMMK + report.totalDepositCashMMK + report.totalDropOffCashMMK + report.totalPickUpCashMMK + report.totalBillCashMMK;
                report.totalCashTHB = report.totalRoomChargeCashTHB + report.totalDepositCashTHB + report.totalDropOffCashTHB + report.totalPickUpCashTHB + report.totalBillCashTHB;
                report.totalCashUSD = report.totalRoomChargeCashUSD + report.totalDepositCashUSD + report.totalDropOffCashUSD + report.totalPickUpCashUSD + report.totalBillCashUSD;

                report.totalKWR = report.totalBankKWR + report.totalCashKWR;
                report.totalMMK = report.totalBankMMK + report.totalCashMMK;
                report.totalTHB = report.totalBankTHB + report.totalCashTHB;
                report.totalUSD = report.totalBankUSD + report.totalCashUSD;
            }// reservation loop

            reports.push(report);
        }//end for date range
        c.d(reports?.length);
        c.d(reports.length > 0 ? reports[0] : []);
        c.fe("Repository > getDailySummaryIncomeReport");
        return reports;
    }


    async getDailySummaryPersonReport(startDate: string, endDate: string, reservationStatus: string, sessionUser: SessionUser): Promise<DailySummaryPersonReportRow[]> {
        c.fs("Repository > getDailySummaryPersonReport");
        c.d(startDate);
        c.d(endDate);

        const reports: DailySummaryPersonReportRow[] = [];
        const dateRanges = getUTCDateRange(startDate, endDate);
        c.d(dateRanges);
        if (!dateRanges || dateRanges.length === 0) throw new CustomError("Invalid date range calculated in report generation.");

        let reservationStatusCondition = sql`1=1`;
        if (reservationStatus) {
            const statuses = reservationStatus.split(',').map(item => item.trim().toUpperCase()).filter(Boolean);
            if (statuses.length > 0) {
                reservationStatusCondition = inArray(configTable.value, statuses);
            }
        }

        c.i('Generating report.');
        for (const dr of dateRanges) {
            const start: Date = new Date(dr);
            const report = new DailySummaryPersonReportRow();
            report.date = start;

            c.i('Retrieve checkin guests');
            const [guestsCheckIn] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(
                    and(
                        eq(reservationTable.checkInDate, start),
                        reservationStatusCondition,
                        eq(reservationTable.location, sessionUser.location)
                    )).limit(1);
            report.guestsCheckIn = Number(guestsCheckIn.sum ?? 0);

            c.i('Retrieve checkout guests');
            const [guestsCheckOut] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(
                    and(
                        eq(reservationTable.checkOutDate, start),
                        reservationStatusCondition,
                        eq(reservationTable.location, sessionUser.location)
                    )).limit(1);
            report.guestsCheckOut = Number(guestsCheckOut.sum ?? 0);

            c.i('Retrieve Same day guests');
            const [guestsSameDayCheckOut] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(
                    and(
                        eq(reservationTable.checkInDate, reservationTable.checkOutDate),
                            eq(reservationTable.checkInDate, start),
                        reservationStatusCondition,
                        eq(reservationTable.location, sessionUser.location)
                    )).limit(1);
            report.guestsSameDayCheckOut = Number(guestsSameDayCheckOut.sum ?? 0);

            c.i('Retrieve existing guests');
            const [guestsExisting] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(
                    and(
                        lt(reservationTable.checkInDate, start),
                        gt(reservationTable.checkOutDate, start),
                        reservationStatusCondition,
                        eq(reservationTable.location, sessionUser.location)
                    )).limit(1);
            report.guestsTotal = Number(guestsExisting.sum ?? 0) + report.guestsCheckIn + report.guestsCheckOut - report.guestsSameDayCheckOut;

            const [roomsTotal] = await this.dbClient.db.select({ count: countDistinct(reservationTable.roomNo) })
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(
                    and(
                        lte(reservationTable.checkInDate, start),
                        or(
                            eq(reservationTable.checkOutDate, start),
                            gt(reservationTable.checkOutDate, start)
                        ),
                        reservationStatusCondition,
                        eq(reservationTable.location, sessionUser.location)
                    ));

            report.reservationTotal = guestsCheckIn.count + guestsCheckOut.count + guestsExisting.count - guestsSameDayCheckOut.count;

            report.roomsTotal = roomsTotal.count;
            reports.push(report);
        };
        c.d(reports?.length);
        c.d(reports?.length > 0 ? reports[0] : []);
        c.fe("Repository > getDailySummaryPersonReport");
        return reports;
    }

    async getDailySummaryReservationStatusReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryReservationStatusReportRow[]> {
        c.fs("Repository > getDailySummaryReservationStatusReport");
        c.d(startDate);
        c.d(endDate);

        const reports: DailySummaryReservationStatusReportRow[] = [];
        const dateRanges = getUTCDateRange(startDate, endDate);
        c.d(dateRanges);
        if (!dateRanges || dateRanges.length === 0) throw new CustomError("Invalid date range calculated in report generation.");

        c.i('Generating report.');
        for (const dr of dateRanges) {
            const start: Date = new Date(dr);
            const reportDate = new Date(start);

            const conditions: any[] = [
                eq(reservationTable.checkInDate, reportDate),
                eq(reservationTable.location, sessionUser.location)
            ];

            const report = new DailySummaryReservationStatusReportRow();
            report.date = reportDate;

            const rows = await this.dbClient.db.select({
                reservationStatus: configTable.value,
                reservationCount: count(reservationTable.id)
            })
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(and(...conditions))
                .groupBy(configTable.value);

            let total = 0;
            for (const row of rows) {
                const status = row.reservationStatus ?? '';
                const countValue = Number(row.reservationCount ?? 0);
                switch (status) {
                    case 'NEW':
                        report.newCount = countValue;
                        break;
                    case 'CFM':
                        report.confirmedCount = countValue;
                        break;
                    case 'CIN':
                        report.checkedInCount = countValue;
                        break;
                    case 'OUT':
                        report.checkedOutCount = countValue;
                        break;
                    case 'WTG':
                        report.waitingCount = countValue;
                        break;
                    case 'CCL':
                        report.cancelledCount = countValue;
                        break;
                }
                total += countValue;
            }
            reports.push(report);
        }

        c.d(reports?.length);
        c.d(reports?.length > 0 ? reports[0] : []);
        c.fe("Repository > getDailySummaryReservationStatusReport");
        return reports;
    }

    async getDailySummaryRoomOccupancyReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryRoomOccupancyReportRow[]> {
        c.fs("Repository > getDailySummaryRoomOccupancyReport");
        c.d(startDate);
        c.d(endDate);

        const dateRanges = getUTCDateRange(startDate, endDate);
        c.d(dateRanges);
        if (!dateRanges || dateRanges.length === 0) throw new CustomError("Invalid date range calculated in report generation.");

        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);

        const reservations = await this.dbClient.db.select({
            roomNo: reservationTable.roomNo,
            checkInDate: reservationTable.checkInDate,
            checkOutDate: reservationTable.checkOutDate,
            reservationStatus: configTable.value
        })
            .from(reservationTable)
            .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
            .where(
                and(
                    lte(reservationTable.checkInDate, endDateTime),
                    gte(reservationTable.checkOutDate, startDateTime),
                    eq(reservationTable.location, sessionUser.location)
                )
            )
            .orderBy(reservationTable.roomNo);

        const getDateKey = (date: Date) => date.toISOString().split('T')[0];

        const createEmptyCell = (): DailySummaryRoomOccupancyCell => ({
            newCount: 0,
            confirmedCount: 0,
            waitingCount: 0,
            checkedInCount: 0,
            checkedOutCount: 0,
            cancelCount: 0,
            noRoomCount: 0,
            totalCount: 0
        });

        const createRow = (roomNo: string): DailySummaryRoomOccupancyReportRow => {
            const row = new DailySummaryRoomOccupancyReportRow();
            row.roomNo = roomNo;
            for (const date of dateRanges) {
                row.occupancyByDate[getDateKey(date)] = createEmptyCell();
            }
            return row;
        };

        const noRoomRow = createRow('No Room');
        const rooms = new Map<string, DailySummaryRoomOccupancyReportRow>();

        for (const reservation of reservations) {
            const roomNo = reservation.roomNo?.trim() ?? '';
            const targetRow = roomNo ? (rooms.get(roomNo) ?? createRow(roomNo)) : noRoomRow;
            if (roomNo && !rooms.has(roomNo)) {
                rooms.set(roomNo, targetRow);
            }

            const checkInDate = new Date(reservation.checkInDate);
            const checkOutDate = new Date(reservation.checkOutDate);
            const status = reservation.reservationStatus ?? '';

            for (const date of dateRanges) {
                if (date >= checkInDate && date <= checkOutDate) {
                    const key = getDateKey(date);
                    const cell = targetRow.occupancyByDate[key];
                    cell.totalCount = (cell.totalCount ?? 0) + 1;

                    if (!roomNo) {
                        cell.noRoomCount = (cell.noRoomCount ?? 0) + 1;
                    }

                    switch (status) {
                        case 'NEW':
                            cell.newCount = (cell.newCount ?? 0) + 1;
                            break;
                        case 'CFM':
                            cell.confirmedCount = (cell.confirmedCount ?? 0) + 1;
                            break;
                        case 'WTG':
                            cell.waitingCount = (cell.waitingCount ?? 0) + 1;
                            break;
                        case 'CIN':
                            cell.checkedInCount = (cell.checkedInCount ?? 0) + 1;
                            break;
                        case 'OUT':
                            cell.checkedOutCount = (cell.checkedOutCount ?? 0) + 1;
                            break;
                        case 'CCL':
                            cell.cancelCount = (cell.cancelCount ?? 0) + 1;
                            break;
                        default:
                            cell.newCount = (cell.newCount ?? 0) + 1;
                            break;
                    }
                }
            }
        }

        const reportRows = [noRoomRow, ...Array.from(rooms.values()).sort((a, b) => a.roomNo.localeCompare(b.roomNo))];
        c.d(reportRows.length);
        c.d(reportRows.length > 0 ? reportRows[0] : []);
        c.fe("Repository > getDailySummaryRoomOccupancyReport");
        return reportRows;
    }

    async getMonthlySummaryReservationStatusReport(year: string, sessionUser: SessionUser): Promise<MonthlySummaryReservationStatusReportRow[]> {
        c.fs("Repository > getMonthlySummaryReservationStatusReport");
        c.d(year);

        const yearNumber = Number(year);
        if (Number.isNaN(yearNumber) || yearNumber < 1900) {
            throw new CustomError('Invalid year provided for monthly report.');
        }

        const reportRows: MonthlySummaryReservationStatusReportRow[] = [];
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
            const row = new MonthlySummaryReservationStatusReportRow();
            row.month = months[monthIndex];
            row.monthNumber = monthIndex + 1;
            reportRows.push(row);
        }

        const start = new Date(Date.UTC(yearNumber, 0, 1, 0, 0, 0, 0));
        const end = new Date(Date.UTC(yearNumber, 11, 31, 23, 59, 59, 999));

        const rows = await this.dbClient.db.select({
            month: sql`MONTH(${reservationTable.checkInDate})`,
            reservationStatus: configTable.value,
            reservationCount: count(reservationTable.id)
        })
            .from(reservationTable)
            .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
            .where(
                and(
                    gte(reservationTable.checkInDate, start),
                    lte(reservationTable.checkInDate, end),
                    eq(reservationTable.location, sessionUser.location)
                )
            )
            .groupBy(sql`MONTH(${reservationTable.checkInDate})`, configTable.value)
            .orderBy(sql`MONTH(${reservationTable.checkInDate})`, 'asc');

        for (const rowData of rows) {
            const monthValue = Number(rowData.month ?? 0);
            const status = rowData.reservationStatus ?? '';
            const countValue = Number(rowData.reservationCount ?? 0);
            const reportRow = reportRows[monthValue - 1];
            if (!reportRow) continue;

            switch (status) {
                case 'NEW':
                    reportRow.newCount = countValue;
                    break;
                case 'CFM':
                    reportRow.confirmedCount = countValue;
                    break;
                case 'CIN':
                    reportRow.checkedInCount = countValue;
                    break;
                case 'OUT':
                    reportRow.checkedOutCount = countValue;
                    break;
                case 'WTG':
                    reportRow.waitingCount = countValue;
                    break;
                case 'CCL':
                    reportRow.cancelledCount = countValue;
                    break;
            }
            reportRow.totalCount += countValue;
        }

        c.d(reportRows.length);
        c.d(reportRows.length > 0 ? reportRows[0] : []);
        c.fe("Repository > getMonthlySummaryReservationStatusReport");
        return reportRows;
    }


    async getDailySummaryZoneGuestsReport(startDate: string, endDate: string, reservationStatus: string, sessionUser: SessionUser): Promise<DailySummaryZoneGuestsReportRow[]> {
        c.fs("Repository > getDailySummaryZoneGuestsReport");
        c.d(startDate);
        c.d(endDate);
        c.d(reservationStatus);

        const reports: DailySummaryZoneGuestsReportRow[] = [];
        const dateRanges = getUTCDateRange(startDate, endDate);
        c.d(dateRanges);
        if (!dateRanges || dateRanges.length === 0) throw new CustomError("Invalid date range calculated in report generation.");

        let reservationStatusCondition = sql`1=1`;
        if (reservationStatus) {
            const statuses = reservationStatus.split(',').map(item => item.trim().toUpperCase()).filter(Boolean);
            if (statuses.length > 0) {
                reservationStatusCondition = inArray(configTable.value, statuses);
            }
        }

        const zonesResult = await this.dbClient.db.select({ zone: roomTable.zone })
            .from(roomTable)
            .where(eq(roomTable.location, sessionUser.location))
            .groupBy(roomTable.zone);

        const zones = zonesResult.map(z => z.zone);

        c.i('Generating zone-based report.');
        for (const dr of dateRanges) {
            const start: Date = new Date(dr);

            for (const zone of zones) {
                const report = new DailySummaryZoneGuestsReportRow();
                report.date = start;
                report.zone = zone;

                const [guestsCheckIn] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                    .from(reservationTable)
                    .innerJoin(roomTable, eq(roomTable.roomNo, reservationTable.roomNo))
                    .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                    .where(
                        and(
                            eq(reservationTable.checkInDate, start),
                            eq(roomTable.zone, zone),
                            eq(reservationTable.location, sessionUser.location),
                            eq(roomTable.location, sessionUser.location),
                            reservationStatusCondition
                        )).limit(1);
                report.guestsCheckIn = Number(guestsCheckIn.sum ?? 0);

                const [guestsCheckOut] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                    .from(reservationTable)
                    .innerJoin(roomTable, eq(roomTable.roomNo, reservationTable.roomNo))
                    .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                    .where(
                        and(
                            eq(reservationTable.checkOutDate, start),
                            eq(roomTable.zone, zone),
                            eq(reservationTable.location, sessionUser.location),
                            eq(roomTable.location, sessionUser.location),
                            reservationStatusCondition
                        )).limit(1);
                report.guestsCheckOut = Number(guestsCheckOut.sum ?? 0);

                const [guestsSameDayCheckOut] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                    .from(reservationTable)
                    .innerJoin(roomTable, eq(roomTable.roomNo, reservationTable.roomNo))
                    .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                    .where(
                        and(
                            eq(reservationTable.checkInDate, reservationTable.checkOutDate),
                            eq(reservationTable.checkInDate, start),
                            eq(roomTable.zone, zone),
                            eq(reservationTable.location, sessionUser.location),
                            eq(roomTable.location, sessionUser.location),
                            reservationStatusCondition
                        )).limit(1);
                report.guestsSameDayCheckOut = Number(guestsSameDayCheckOut.sum ?? 0);

                const [guestsExisting] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                    .from(reservationTable)
                    .innerJoin(roomTable, eq(roomTable.roomNo, reservationTable.roomNo))
                    .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                    .where(
                        and(
                            lt(reservationTable.checkInDate, start),
                            gt(reservationTable.checkOutDate, start),
                            eq(roomTable.zone, zone),
                            eq(reservationTable.location, sessionUser.location),
                            eq(roomTable.location, sessionUser.location),
                            reservationStatusCondition
                        )).limit(1);

                report.guestsTotal = Number(guestsExisting.sum ?? 0) + report.guestsCheckIn + report.guestsCheckOut - report.guestsSameDayCheckOut;

                const [roomsTotal] = await this.dbClient.db.select({ count: countDistinct(reservationTable.roomNo) })
                    .from(reservationTable)
                    .innerJoin(roomTable, eq(roomTable.roomNo, reservationTable.roomNo))
                    .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                    .where(
                        and(
                            lte(reservationTable.checkInDate, start),
                            or(
                                eq(reservationTable.checkOutDate, start),
                                gt(reservationTable.checkOutDate, start)
                            ),
                            eq(roomTable.zone, zone),
                            eq(reservationTable.location, sessionUser.location),
                            eq(roomTable.location, sessionUser.location),
                            reservationStatusCondition
                        ));

                report.reservationTotal = guestsCheckIn.count + guestsCheckOut.count + guestsExisting.count - guestsSameDayCheckOut.count;
                report.roomsTotal = roomsTotal.count;

                reports.push(report);
            }
        }

        c.d(reports?.length);
        c.d(reports?.length > 0 ? reports[0] : []);
        c.fe("Repository > getDailySummaryZoneGuestsReport");
        return reports;
    }


    async getDailyReservationDetailReport(checkInFrom: string, checkInUntil: string, createdFrom: string, createdUntil: string, updatedFrom: string, updatedUntil: string, reservationType: string, reservationStatus: string, bookingSource: string, sessionUser: SessionUser): Promise<DailyReservationDetailReportRow[]> {
        c.fs("Repository > getDailyReservationDetailReport");
        c.d(checkInFrom);
        c.d(checkInUntil);
        const conditions = [];

        const reports: DailyReservationDetailReportRow[] = [];
        let dateRanges = null;
        if (checkInFrom && checkInUntil)
            dateRanges = getUTCDateRange(checkInFrom, checkInUntil);

        if (createdFrom && createdUntil)
            dateRanges = getUTCDateRange(createdFrom, createdUntil);

        if (updatedFrom && updatedUntil)
            dateRanges = getUTCDateRange(updatedFrom, updatedUntil);

        c.d(dateRanges);
        if (!dateRanges || dateRanges.length === 0) throw new CustomError("Invalid date range calculated in report generation.");

        let reservationTypeId = null;
        if (reservationType) {
            [reservationTypeId] = await this.dbClient.db.select().from(configTable).where(
                and(
                    eq(configTable.group, "RESERVATION_TYPE"),
                    eq(configTable.value, reservationType)
                )
            ); c.d(reservationTypeId); c.d(reservationTypeId.id);
            if (!reservationTypeId) throw new CustomError("Cannot find reservation type id");
            conditions.push(eq(reservationTable.reservationTypeId, reservationTypeId.id));
        }

        let reservationStatusIds: string[] = [];
        if (reservationStatus) {
            const statuses = reservationStatus.split(',').map(item => item.trim().toUpperCase()).filter(Boolean);
            if (statuses.length > 0) {
                const reservationStatuses = await this.dbClient.db.select({ id: configTable.id }).from(configTable).where(
                    and(
                        eq(configTable.group, "RESERVATION_STATUS"),
                        inArray(configTable.value, statuses)
                    )
                );
                reservationStatusIds = reservationStatuses.map((status) => status.id);
                if (reservationStatusIds.length === 0)
                    throw new CustomError("Cannot find reservation status id");
                conditions.push(inArray(reservationTable.reservationStatusId, reservationStatusIds));
            }
        }

        if (bookingSource)
            conditions.push(eq(reservationTable.bookingSource, bookingSource));
        conditions.push(eq(reservationTable.location, sessionUser.location));


        c.i('Generating report.');
        for (const dr of dateRanges) {
            const start: Date = new Date(dr);
            const end = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 23, 59, 59, 999);
            const report = new DailyReservationDetailReportRow();
            report.date = start;
            const localConditions = [...conditions];

            if (checkInFrom)
                localConditions.push(eq(reservationTable.checkInDate, start));
            if (createdFrom) {

                localConditions.push(
                    and(
                        gte(reservationTable.createdAtUTC, start),
                        lte(reservationTable.createdAtUTC, end)
                    )
                );
            }
            if (updatedFrom) {
                localConditions.push(
                    and(
                        gte(reservationTable.updatedAtUTC, start),
                        lte(reservationTable.updatedAtUTC, end)
                    )
                );
            }


            c.i('Retrieve reservation');
            const reservations = await this.dbClient.db.query.reservationTable.findMany({
                with: {
                    reservationStatus: true,
                    reservationType: true,
                    reservationCustomers: {
                        with: {
                            customer: true
                        }
                    },
                    roomCharges: true,
                    bills: true
                },
                where: and(
                    ...localConditions
                ),
            });

            c.i('Looping reservations');
            c.d(`Total reservations: ${reservations.length}`);
            reservations.forEach((r) => {
                c.d(`Processing reservation ID: ${r.id}`);
                const rep = new DailyReservationDetailReportRow();
                rep.date = start;
                rep.bookingSource = r.bookingSource;
                rep.reservationId = r.id;
                rep.reservationStatus = r.reservationStatus.text;
                rep.roomNo = r.roomNo;
                rep.customerNames = r.reservationCustomers.map(rc => rc.customer.name).join(", ");
                rep.customerPhones = r.reservationCustomers.map(rc => rc.customer.phone).join(", ");
                rep.checkInDate = r.checkInDate;
                rep.checkOutDate = r.checkOutDate;
                rep.noOfDays = r.noOfDays;
                rep.noOfGuests = r.noOfGuests;
                rep.reservationType = r.reservationType.text;
                rep.arrivalDateTime = r.arrivalDateTime;
                rep.arrivalFlight = r.arrivalFlight;
                rep.departureDateTime = r.departureDateTime;
                rep.departureFlight = r.departureFlight;

                c.d(`Total bills: ${r.bills?.length ?? 0}`);
                r.bills?.forEach((b: Bill) => {
                    c.d(`Processing bill ID: ${b.id}`);
                    c.d(b);
                    if (b.paymentType === 'PICKUP') {
                        if (b.currency === 'KWR') {
                            rep.pickUpFeeKWR = Number(b.amount ?? 0);
                        } else if (b.currency === 'MMK') {
                            rep.pickUpFeeMMK = Number(b.amount ?? 0);
                        } else if (b.currency === 'THB') {
                            rep.pickUpFeeTHB = Number(b.amount ?? 0);
                        } else if (b.currency === 'USD') {
                            rep.pickUpFeeUSD = Number(b.amount ?? 0);
                        }
                    } else if (b.paymentType === 'DROPOFF') {
                        if (b.currency === 'KWR') {
                            rep.dropOffFeeKWR = Number(b.amount ?? 0);
                        } else if (b.currency === 'MMK') {
                            rep.dropOffFeeMMK = Number(b.amount ?? 0);
                        } else if (b.currency === 'THB') {
                            rep.dropOffFeeTHB = Number(b.amount ?? 0);
                        } else if (b.currency === 'USD') {
                            rep.dropOffFeeUSD = Number(b.amount ?? 0);
                        }
                    } else if (b.paymentType === 'NINETYDAYS') {
                        rep.ninetyDaysAmount = Number(rep.ninetyDaysAmount ?? 0) + Number(b.amount ?? 0);
                    }
                });

                c.d(`Total room charges: ${r.roomCharges?.length ?? 0}`);
                r.roomCharges?.forEach((rc: RoomCharge) => {
                    c.d(`Processing room charge ID: ${rc.id}`);
                    c.d(rc);
                    // rep.roomChargeAmount = Number(rep.roomChargeAmount) + Number((rc.roomRate + rc.seasonSurcharge) * rc.noOfDays * rep.noOfGuests);
                    rep.singleChargeAmount = Number(rep.singleChargeAmount) + Number(rc.singleRate * rc.noOfDays);
                    rep.extraChargeAmount = Number(rep.extraChargeAmount) + Number(rc.roomSurcharge * rc.noOfDays * r.noOfGuests);
                });
                rep.totalAmount = Number(r.totalAmount ?? 0) + Number(rep.ninetyDaysAmount ?? 0);
                rep.extraChargeAmount = Number(rep.extraChargeAmount ?? 0) + Number(rep.ninetyDaysAmount ?? 0);
                rep.paidAmount = Number(r.paidAmount ?? 0);
                rep.depositAmount = Number(r.depositAmount ?? 0);
                rep.discountAmount = Number(r.discountAmount ?? 0);
                rep.taxAmount = Number(r.taxAmount ?? 0);
                rep.netAmount = rep.totalAmount - rep.depositAmount - rep.discountAmount + rep.taxAmount;
                reports.push(rep);
            });
        };
        c.d(reports?.length);
        c.d(reports?.length > 0 ? reports[0] : []);
        c.fe("Repository > getDailyReservationDetailReport");
        return reports;
    }
}