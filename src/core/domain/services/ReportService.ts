import DailySummaryGuestsRoomsReportRow from "../dtos/reports/DailySummaryGuestsRoomsReportrow";
import IReportService from "./contracts/IReportService";
import { injectable, inject } from 'inversify';
import { TYPES } from '@/core/lib/types';
import type IReportRepository from "@/core/data/repo/contracts/IReportRepository";
import DailySummaryIncomeReportRow from "../dtos/reports/DailySummaryIncomeReportRow";
import DailySummaryPersonReportRow from "../dtos/reports/DailySummaryPersonReportRow";
import c from "@/core/loggers/console/ConsoleLogger";

@injectable()
export default class ReportService implements IReportService{

    constructor(@inject(TYPES.IReportRepository) private reportRepository : IReportRepository){

    }


    async getDailySummaryGuestsRoomsReport(startDate: string, endDate: string): Promise<DailySummaryGuestsRoomsReportRow[]> {
        c.fs('ReportService > getDailySummaryGuestsRoomsReport');
        return await this.reportRepository.getDailySummaryGuestsRoomsReport(startDate, endDate);
    }


    async getDailySummaryIncomeReport(startDate: string, endDate: string): Promise<DailySummaryIncomeReportRow[]> {
        c.fs('ReportService > getDailySummaryIncomeReport');
        return await this.reportRepository.getDailySummaryIncomeReport(startDate, endDate);
    }


    async getDailySummaryPersonReport(startDate: string, endDate: string): Promise<DailySummaryPersonReportRow[]> {
        c.fs('ReportService > getDailySummaryPersonReport');
        return await this.reportRepository.getDailySummaryPersonReport(startDate, endDate);
    }

}