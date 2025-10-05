import { inject, injectable } from "inversify";
import "reflect-metadata";
import { billTable, configTable, paymentTable, reservationTable, roomTable } from "@/core/orms/drizzle/mysql/schema";
import { TYPES } from "@/core/types";
import { type IDatabaseClient } from "@/lib/db/IDatabase";
import IReportRepository from "../contracts/IReportRepository";
import DailySummaryGuestsRoomsReportRow from "@/core/models/dto/reports/DailySummaryGuestsRoomsReportrow";
import { getUTCDateRange } from "@/lib/utils";
import { and, count, countDistinct, eq, gt, gte, lt, lte, ne, or, sum } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { CustomError } from "@/lib/errors";
import c from "@/lib/loggers/console/ConsoleLogger";
import DailySummaryIncomeReportRow from "@/core/models/dto/reports/DailySummaryIncomeReportRow";
import Bill from "@/core/models/domain/Bill";
import Payment from "@/core/models/domain/Payment";
import Reservation from "@/core/models/domain/Reservation";
import DailySummaryPersonReportRow from "@/core/models/dto/reports/DailySummaryPersonReportRow";
import SessionUser from "@/core/models/dto/SessionUser";
import DailyReservationDetailReportRow from "@/core/models/dto/reports/DailyReservationDetailReportRow";
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


    async getDailySummaryGuestsRoomsReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryGuestsRoomsReportRow[]> {
        c.fs("Repository > getDailySummaryGuestsRoomsReport");
        c.d(startDate);
        c.d(endDate);

        const reports: DailySummaryGuestsRoomsReportRow[] = [];
        const dateRanges = getUTCDateRange(startDate, endDate);
        c.d(dateRanges);
        if (!dateRanges || dateRanges.length === 0) throw new CustomError("Invalid date range calculated in report generation.");

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
                        ne(configTable.value, 'CCL'),
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
                        ne(configTable.value, 'CCL'),
                        eq(reservationTable.location, sessionUser.location)
                    )).limit(1);
            report.guestsCheckOut = Number(guestsCheckOut.sum ?? 0);
            report.reservationCheckOut = Number(guestsCheckOut.count ?? 0);

            c.i('Retrieve existing guests');
            const [guestsExisting] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(
                    and(
                        lt(reservationTable.checkInDate, start),
                        gt(reservationTable.checkOutDate, start),
                        ne(configTable.value, 'CCL'),
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
                        ne(configTable.value, 'CCL'),
                        eq(reservationTable.location, sessionUser.location)
                    ));

            report.guestsExisting = Number(guestsExisting.sum ?? 0);
            report.reservationExisting = Number(guestsExisting.count ?? 0);

            report.reservationTotal = report.reservationCheckIn + report.reservationCheckOut + report.reservationExisting;
            report.guestsTotal = report.guestsExisting + report.guestsCheckIn + report.guestsCheckOut;

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


    async getDailySummaryIncomeReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryIncomeReportRow[]> {
        c.fs("Repository > getDailySummaryIncomeReport");
        c.d(startDate);
        c.d(endDate);

        const reports: DailySummaryIncomeReportRow[] = [];
        const dateRanges = getUTCDateRange(startDate, endDate);
        c.d(dateRanges);
        if (!dateRanges || dateRanges.length === 0) throw new CustomError("Invalid date range calculated in report generation.");

        c.i('Generating report.');
        for (const dr of dateRanges) {
            const start: Date = new Date(dr);
            const report = new DailySummaryIncomeReportRow();
            report.date = start;

            c.i('Retrieve reservation');
            const totalCheckInReservations: Reservation[] = await this.dbClient.db
                .select(
                    { ...reservationTable }
                )
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(
                    and(
                        eq(reservationTable.checkInDate, start),
                        ne(configTable.value, 'CCL'),
                        eq(reservationTable.location, sessionUser.location)
                    ));
            report.totalCheckInReservations = Number(totalCheckInReservations.length ?? 0);

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
                        if (bill.paymentType === 'OTHER') {
                            if (bill.currency === 'KWR') {
                                report.totalBillCashKWR = report.totalBillCashKWR + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'MMK') {
                                report.totalBillCashMMK = report.totalBillCashMMK + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'THB') {
                                report.totalBillCashTHB = report.totalBillCashTHB + Number(bill.amount ?? 0);
                            } else if (bill.currency === 'USD') {
                                report.totalBillCashUSD = report.totalBillCashUSD + Number(bill.amount ?? 0);
                            }
                        } else if (bill.paymentType === 'PICKUP') {
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


    async getDailySummaryPersonReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryPersonReportRow[]> {
        c.fs("Repository > getDailySummaryPersonReport");
        c.d(startDate);
        c.d(endDate);

        const reports: DailySummaryPersonReportRow[] = [];
        const dateRanges = getUTCDateRange(startDate, endDate);
        c.d(dateRanges);
        if (!dateRanges || dateRanges.length === 0) throw new CustomError("Invalid date range calculated in report generation.");

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
                        ne(configTable.value, 'CCL'),
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
                        ne(configTable.value, 'CCL'),
                        eq(reservationTable.location, sessionUser.location)
                    )).limit(1);
            report.guestsCheckOut = Number(guestsCheckOut.sum ?? 0);

            c.i('Retrieve existing guests');
            const [guestsExisting] = await this.dbClient.db.select({ sum: sum(reservationTable.noOfGuests), count: count(reservationTable.id) })
                .from(reservationTable)
                .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
                .where(
                    and(
                        lt(reservationTable.checkInDate, start),
                        gt(reservationTable.checkOutDate, start),
                        ne(configTable.value, 'CCL'),
                        eq(reservationTable.location, sessionUser.location)
                    )).limit(1);
            report.guestsTotal = Number(guestsExisting.sum ?? 0) + report.guestsCheckIn + report.guestsCheckOut;

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
                        ne(configTable.value, 'CCL'),
                        eq(reservationTable.location, sessionUser.location)
                    ));

            report.reservationTotal = guestsCheckIn.count + guestsCheckOut.count + guestsExisting.count;

            report.roomsTotal = roomsTotal.count;
            reports.push(report);
        };
        c.d(reports?.length);
        c.d(reports?.length > 0 ? reports[0] : []);
        c.fe("Repository > getDailySummaryPersonReport");
        return reports;
    }


    async getDailyReservationDetailReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailyReservationDetailReportRow[]> {
        c.fs("Repository > getDailyReservationDetailReport");
        c.d(startDate);
        c.d(endDate);

        const reports: DailyReservationDetailReportRow[] = [];
        const dateRanges = getUTCDateRange(startDate, endDate);
        c.d(dateRanges);
        if (!dateRanges || dateRanges.length === 0) throw new CustomError("Invalid date range calculated in report generation.");

        c.i('Generating report.');
        for (const dr of dateRanges) {
            const start: Date = new Date(dr);
            const report = new DailyReservationDetailReportRow();
            report.date = start;

            c.i('Retrieve reservation');
            const reservations = await this.dbClient.db.query.reservationTable.findMany({
                with: {
                    reservationType: true,
                    reservationCustomers: {
                        with: {
                            customer: true
                        }
                    },
                    roomCharges: true
                },
                where: and(
                    eq(reservationTable.checkInDate, start),
                    eq(reservationTable.location, sessionUser.location)
                ),
            });

            reservations.forEach(r => {
                const rep = new DailyReservationDetailReportRow();
                rep.date = start;
                rep.reservationId = r.id;
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
                rep.totalAmount = Number(r.totalAmount ?? 0);
                rep.paidAmount = Number(r.paidAmount ?? 0);
                rep.depositAmount = Number(r.depositAmount ?? 0);
                rep.discountAmount = Number(r.discountAmount ?? 0);
                rep.taxAmount = Number(r.taxAmount ?? 0);
                rep.netAmount = Number(r.netAmount ?? 0);

                r.bills?.forEach((b: Bill) => {
                    if (b.paymentType === 'PICKUP') {
                        if(b.currency === 'KWR') {
                            rep.pickUpFeeKWR = Number(b.amount ?? 0);
                        } else if(b.currency === 'MMK') {
                            rep.pickUpFeeMMK = Number(b.amount ?? 0);
                        } else if(b.currency === 'THB') {
                            rep.pickUpFeeTHB = Number(b.amount ?? 0);
                        } else if(b.currency === 'USD') {
                            rep.pickUpFeeUSD = Number(b.amount ?? 0);
                        }
                    } else if (b.paymentType === 'DROPOFF') {
                        if(b.currency === 'KWR') {
                            rep.dropOffFeeKWR = Number(b.amount ?? 0);
                        } else if(b.currency === 'MMK') {
                            rep.dropOffFeeMMK = Number(b.amount ?? 0);
                        } else if(b.currency === 'THB') {
                            rep.dropOffFeeTHB = Number(b.amount ?? 0);
                        } else if(b.currency === 'USD') {
                            rep.dropOffFeeUSD = Number(b.amount ?? 0);
                        }
                    }
                });

                r.roomCharges?.forEach((rc: RoomCharge) => {
                    rep.singleChargeAmount = rep.singleChargeAmount + Number(rc.singleRate * rc.noOfDays);
                    rep.extraChargeAmount = Number(rep.extraChargeAmount) + Number(rc.roomSurcharge * rc.noOfDays * r.noOfGuests);
                });
                reports.push(rep);
            });
        };
        c.d(reports?.length);
        c.d(reports?.length > 0 ? reports[0] : []);
        c.fe("Repository > getDailyReservationDetailReport");
        return reports;
    }
}