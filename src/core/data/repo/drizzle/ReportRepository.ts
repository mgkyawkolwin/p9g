import { inject, injectable } from "inversify";
import "reflect-metadata";
import { billTable, configTable, customerTable, paymentTable, reservationTable, roomTable, userTable } from "@/core/data/orm/drizzle/mysql/schema";
import { Repository } from "./Repository";
import { TYPES } from "@/core/lib/types";
import { type IDatabaseClient } from "@/core/data/db/IDatabase";
import Customer from "@/core/domain/models/Customer";
import IReportRepository from "../contracts/IReportRepository";
import DailySummaryGuestsRoomsReportRow from "@/core/domain/dtos/reports/DailySummaryGuestsRoomsReportrow";
import { getDateRange } from "@/core/lib/utils";
import { and, count, eq, gt, gte, lt, lte, ne, sum } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { CustomError } from "@/core/lib/errors";
import c from "@/core/loggers/console/ConsoleLogger";
import { auth } from "@/app/auth";
import DailySummaryIncomeReportRow from "@/core/domain/dtos/reports/DailySummaryIncomeReportRow";
import Bill from "@/core/domain/models/Bill";
import Payment from "@/core/domain/models/Payment";
import Reservation from "@/core/domain/models/Reservation";
import DailySummaryPersonReportRow from "@/core/domain/dtos/reports/DailySummaryPersonReportRow";


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


    async getDailySummaryGuestsRoomsReport(startDate: string, endDate: string): Promise<DailySummaryGuestsRoomsReportRow[]> {
        c.fs("Repository > getDailySummaryGuestsRoomsReport");
        c.d(startDate);
        c.d(endDate);
        const session = await auth();
        if (!session || !session.user) throw new CustomError('Repository cannot get session.');

        const [user] = await this.dbClient.db.select()
            .from(userTable).where(eq(userTable.id, session.user.id)).limit(1);
        if (!user) throw new CustomError('Repository cannot find user.');

        const reports: DailySummaryGuestsRoomsReportRow[] = [];
        const dateRanges = getDateRange(startDate, endDate);
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
                        eq(reservationTable.location, user.location)
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
                        eq(reservationTable.location, user.location)
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
                        eq(reservationTable.location, user.location)
                    )).limit(1);
            report.guestsExisting = Number(guestsExisting.sum ?? 0);
            report.reservationExisting = Number(guestsExisting.count ?? 0);

            report.reservationTotal = report.reservationCheckIn + report.reservationCheckOut + report.reservationExisting;
            report.guestsTotal = report.guestsExisting + report.guestsCheckIn + report.guestsCheckOut;

            c.i('Retrieve total rooms.');
            const [roomsTotal] = await this.dbClient.db.select({ count: count() })
                .from(roomTable).where(eq(roomTable.location, user.location)).limit(1);

            report.roomsCheckIn = report.reservationCheckIn;
            report.roomsCheckOut = report.reservationCheckOut;
            report.roomsExisting = report.reservationExisting;
            report.roomsTotal = report.reservationCheckIn + report.reservationExisting + report.reservationCheckOut;
            report.roomsAvailable = roomsTotal.count - report.roomsTotal;
            reports.push(report);
        };
        c.d(reports.length);
        c.d(reports.length > 0 ? reports[0] : []);
        c.fe("Repository > getDailySummaryGuestsRoomsReport");
        return reports;
    }


    async getDailySummaryIncomeReport(startDate: string, endDate: string): Promise<DailySummaryIncomeReportRow[]> {
        c.fs("Repository > getDailySummaryIncomeReport");
        c.d(startDate);
        c.d(endDate);
        const session = await auth();
        if (!session || !session.user) throw new CustomError('Repository cannot get session.');

        const [user] = await this.dbClient.db.select()
            .from(userTable).where(eq(userTable.id, session.user.id)).limit(1);
        if (!user) throw new CustomError('Repository cannot find user.');

        const reports: DailySummaryIncomeReportRow[] = [];
        const dateRanges = getDateRange(startDate, endDate);
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
                        eq(reservationTable.location, user.location)
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
                        // report.totalKWR = Number(reservation.depositAmountInCurrency ?? 0);
                        // report.totalBankKWR = Number(reservation.depositAmountInCurrency ?? 0);
                        report.totalDepositBankKWR = report.totalDepositBankKWR + Number(reservation.depositAmountInCurrency ?? 0);
                    } else if (reservation.depositCurrency === 'MMK') {
                        // report.totalMMK = Number(reservation.depositAmountInCurrency ?? 0);
                        // report.totalBankMMK = Number(reservation.depositAmountInCurrency ?? 0);
                        report.totalDepositBankMMK = report.totalDepositBankMMK + Number(reservation.depositAmountInCurrency ?? 0);
                    } else if (reservation.depositCurrency === 'THB') {
                        // report.totalTHB = Number(reservation.depositAmountInCurrency ?? 0);
                        // report.totalBankTHB = Number(reservation.depositAmountInCurrency ?? 0);
                        report.totalDepositBankTHB = report.totalDepositBankTHB + Number(reservation.depositAmountInCurrency ?? 0);
                    } else if (reservation.depositCurrency === 'USD') {
                        // report.totalUSD = Number(reservation.depositAmountInCurrency ?? 0);
                        // report.totalBankUSD = Number(reservation.depositAmountInCurrency ?? 0);
                        report.totalDepositBankUSD = report.totalDepositBankUSD + Number(reservation.depositAmountInCurrency ?? 0);
                    }
                } else if (reservation.depositPaymentMode === 'CASH') {
                    if (reservation.depositCurrency === 'KWR') {
                        // report.totalKWR = Number(reservation.depositAmountInCurrency ?? 0);
                        // report.totalCashKWR = Number(reservation.depositAmountInCurrency ?? 0);
                        report.totalDepositCashKWR = report.totalDepositCashKWR + Number(reservation.depositAmountInCurrency ?? 0);
                    } else if (reservation.depositCurrency === 'MMK') {
                        // report.totalMMK = Number(reservation.depositAmountInCurrency ?? 0);
                        // report.totalCashMMK = Number(reservation.depositAmountInCurrency ?? 0);
                        report.totalDepositCashMMK = report.totalDepositCashMMK + Number(reservation.depositAmountInCurrency ?? 0);
                    } else if (reservation.depositCurrency === 'THB') {
                        // report.totalTHB = Number(reservation.depositAmountInCurrency ?? 0);
                        // report.totalCashTHB = Number(reservation.depositAmountInCurrency ?? 0);
                        report.totalDepositCashTHB = report.totalDepositCashTHB + Number(reservation.depositAmountInCurrency ?? 0);
                    } else if (reservation.depositCurrency === 'USD') {
                        // report.totalUSD = Number(reservation.depositAmountInCurrency ?? 0);
                        // report.totalCashUSD = Number(reservation.depositAmountInCurrency ?? 0);
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
                    // if (bill.currency === 'KWR') {
                    //     report.totalKWR = report.totalKWR + Number(bill.amount ?? 0);
                    // } else if (bill.currency === 'MMK') {
                    //     report.totalMMK = report.totalMMK + Number(bill.amount ?? 0);
                    // } else if (bill.currency === 'THB') {
                    //     report.totalTHB = report.totalTHB + Number(bill.amount ?? 0);
                    // } else if (bill.currency === 'USD') {
                    //     report.totalUSD = report.totalUSD + Number(bill.amount ?? 0);
                    // }
                    if (bill.paymentMode === 'BANK') {
                        // if (bill.currency === 'KWR') {
                        //     report.totalBankKWR = report.totalBankKWR + Number(bill.amount ?? 0);
                        // } else if (bill.currency === 'MMK') {
                        //     report.totalBankMMK = report.totalBankMMK + Number(bill.amount ?? 0);
                        // } else if (bill.currency === 'THB') {
                        //     report.totalBankTHB = report.totalBankTHB + Number(bill.amount ?? 0);
                        // } else if (bill.currency === 'USD') {
                        //     report.totalBankUSD = report.totalBankUSD + Number(bill.amount ?? 0);
                        // }
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
                        // if (bill.currency === 'KWR') {
                        //     report.totalCashKWR = report.totalCashKWR + Number(bill.amount ?? 0);
                        // } else if (bill.currency === 'MMK') {
                        //     report.totalCashMMK = report.totalCashMMK + Number(bill.amount ?? 0);
                        // } else if (bill.currency === 'THB') {
                        //     report.totalCashTHB = report.totalCashTHB + Number(bill.amount ?? 0);
                        // } else if (bill.currency === 'USD') {
                        //     report.totalCashUSD = report.totalCashUSD + Number(bill.amount ?? 0);
                        // }
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


    async getDailySummaryPersonReport(startDate: string, endDate: string): Promise<DailySummaryPersonReportRow[]> {
        c.fs("Repository > getDailySummaryPersonReport");
        c.d(startDate);
        c.d(endDate);
        const session = await auth();
        if (!session || !session.user) throw new CustomError('Repository cannot get session.');

        const [user] = await this.dbClient.db.select()
            .from(userTable).where(eq(userTable.id, session.user.id)).limit(1);
        if (!user) throw new CustomError('Repository cannot find user.');

        const reports: DailySummaryPersonReportRow[] = [];
        const dateRanges = getDateRange(startDate, endDate);
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
                        eq(reservationTable.location, user.location)
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
                        eq(reservationTable.location, user.location)
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
                        eq(reservationTable.location, user.location)
                    )).limit(1);
            report.guestsExisting = Number(guestsExisting.sum ?? 0);
            report.reservationExisting = Number(guestsExisting.count ?? 0);

            report.reservationTotal = report.reservationCheckIn + report.reservationCheckOut + report.reservationExisting;
            report.guestsTotal = report.guestsExisting + report.guestsCheckIn + report.guestsCheckOut;

            c.i('Retrieve total rooms.');
            const [roomsTotal] = await this.dbClient.db.select({ count: count() })
                .from(roomTable).where(eq(roomTable.location, user.location)).limit(1);

            report.roomsCheckIn = report.reservationCheckIn;
            report.roomsCheckOut = report.reservationCheckOut;
            report.roomsExisting = report.reservationExisting;
            report.roomsTotal = report.reservationCheckIn + report.reservationExisting + report.reservationCheckOut;
            report.roomsAvailable = roomsTotal.count - report.roomsTotal;
            reports.push(report);
        };
        c.d(reports?.length);
        c.d(reports?.length > 0 ? reports[0] : []);
        c.fe("Repository > getDailySummaryPersonReport");
        return reports;
    }
}