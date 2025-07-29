import { inject, injectable } from "inversify";
import "reflect-metadata";
import { configTable, customerTable, reservationTable, roomTable, userTable } from "@/data/orm/drizzle/mysql/schema";
import { Repository } from "./Repository";
import { TYPES } from "@/lib/types";
import { type IDatabase } from "@/data/db/IDatabase";
import ICustomerRepository from "../contracts/ICustomerRepository";
import Customer from "@/domain/models/Customer";
import IReportRepository from "../contracts/IReportRepository";
import DailySummaryReportRow from "@/domain/dtos/reports/dailysummaryreportrow";
import { getDateRange } from "@/lib/utils";
import { and, count, eq, gt, gte, lt, lte, ne, sum } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { CustomError } from "@/lib/errors";
import c from "@/lib/core/logger/ConsoleLogger";
import { auth } from "@/app/auth";


@injectable()
export default class ReportRepository extends Repository<Customer, typeof customerTable> implements IReportRepository {

    reservationTypeAlias = alias(configTable, 'reservation_type');
    reservationStatusAlias = alias(configTable, 'reservation_status');
    pickUpAlias = alias(configTable, 'pickUpAlias');
    dropOffAlias = alias(configTable, 'dropOffAlias');
    
    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabase<any>
    ) {
        super(dbClient, customerTable);
    }

    async  getDailySummaryReport(startDate: string, endDate: string): Promise<DailySummaryReportRow[]> {
        c.i("getDailySummaryReport");
        c.d(startDate);
        c.d(endDate);
        const session = await auth();
        if(!session || !session.user) throw new CustomError('Repository cannot get session.');

        const [user] = await this.dbClient.db.select()
        .from(userTable).where(eq(userTable.id, session.user.id)).limit(1);
        if(!user) throw new CustomError('Repository cannot find user.');

        const reports : DailySummaryReportRow[] = [];
        const dateRanges = getDateRange(startDate, endDate);
        c.d(dateRanges);
        if(!dateRanges || dateRanges.length === 0) throw new CustomError("Invalid date range calculated in report generation.");

        c.i('Generating report.');
        for(const dr of dateRanges){
            const start : Date = new Date(dr);
            const end : Date = new Date(dr);
            end.setDate(end.getDate() + 1);
            end.setHours(0);
            const report = new DailySummaryReportRow();
            report.date = start;

            c.i('Retrieve checkin guests');
            const [guestsCheckIn] = await this.dbClient.db.select({sum: sum(reservationTable.noOfGuests)})
            .from(reservationTable)
            .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
            .where(
                and(
                    gte(reservationTable.checkInDateUTC, start),
                    lte(reservationTable.checkInDateUTC, end),
                    ne(configTable.value, 'CCL'),
                    eq(reservationTable.location, user.location)
                )).limit(1);
            report.guestsCheckIn = guestsCheckIn.sum;

            c.i('Retrieve checkout guests');
            const [guestsCheckOut] = await this.dbClient.db.select({sum: sum(reservationTable.noOfGuests)})
            .from(reservationTable)
            .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
            .where(
                and(
                    gte(reservationTable.checkOutDateUTC, start),
                    lte(reservationTable.checkOutDateUTC, end),
                    ne(configTable.value, 'CCL'),
                    eq(reservationTable.location, user.location)
                )).limit(1);
            report.guestsCheckOut = guestsCheckOut.sum;

            c.i('Retrieve existing guests');
            const [guestsExisting] = await this.dbClient.db.select({sum: sum(reservationTable.noOfGuests)})
            .from(reservationTable)
            .innerJoin(configTable, eq(configTable.id, reservationTable.reservationStatusId))
            .where(
                and(
                    lt(reservationTable.checkInDateUTC, start),
                    gt(reservationTable.checkOutDateUTC, end),
                    ne(configTable.value, 'CCL'),
                    eq(reservationTable.location, user.location)
                )).limit(1);
            report.guestsExisting = guestsExisting.sum;

            c.i('Retrieve total rooms.');
            const [roomsTotal] = await this.dbClient.db.select({count:count()})
            .from(roomTable).where(eq(roomTable.location, user.location)).limit(1);
            report.roomsTotal = roomsTotal.count;

            report.roomsCheckIn = Math.ceil(report.guestsCheckIn/2);
            report.roomsCheckOut = Math.ceil(report.guestsCheckOut/2);
            report.roomsExisting = Math.ceil(report.guestsExisting/2);
            report.roomsAvailable = report.roomsTotal - report.roomsExisting + report.roomsCheckIn - report.roomsCheckOut;
            reports.push(report);
            c.d(report);
        };
        c.d(reports);
        return reports;
    }
}