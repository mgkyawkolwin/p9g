import DailySummaryGuestsRoomsReportRow from "../models/dto/reports/DailySummaryGuestsRoomsReportrow";
import IReportService from "./contracts/IReportService";
import { injectable, inject } from 'inversify';
import { TYPES } from '@/core/types';
import type IReportRepository from "@/core/repositories/contracts/IReportRepository";
import DailySummaryIncomeReportRow from "../models/dto/reports/DailySummaryIncomeReportRow";
import DailySummaryPersonReportRow from "../models/dto/reports/DailySummaryPersonReportRow";
import c from "@/lib/loggers/console/ConsoleLogger";
import SessionUser from "../models/dto/SessionUser";

@injectable()
export default class ReportService implements IReportService{

    constructor(@inject(TYPES.IReportRepository) private reportRepository : IReportRepository){

    }


    async getDailySummaryGuestsRoomsReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryGuestsRoomsReportRow[]> {
        c.fs('ReportService > getDailySummaryGuestsRoomsReport');
        return await this.reportRepository.getDailySummaryGuestsRoomsReport(startDate, endDate, sessionUser);
    }


    async getDailySummaryIncomeReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryIncomeReportRow[]> {
        c.fs('ReportService > getDailySummaryIncomeReport');
        return await this.reportRepository.getDailySummaryIncomeReport(startDate, endDate, sessionUser);
    }


    async getDailySummaryPersonReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryPersonReportRow[]> {
        c.fs('ReportService > getDailySummaryPersonReport');
        return await this.reportRepository.getDailySummaryPersonReport(startDate, endDate, sessionUser);
    }

}