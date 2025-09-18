import DailySummaryGuestsRoomsReportRow from "../models/dto/reports/DailySummaryGuestsRoomsReportrow";
import IReportService from "./contracts/IReportService";
import { injectable, inject } from 'inversify';
import { TYPES } from '@/lib/types';
import type IReportRepository from "@/core/data/repo/contracts/IReportRepository";
import DailySummaryIncomeReportRow from "../models/dto/reports/DailySummaryIncomeReportRow";
import DailySummaryPersonReportRow from "../models/dto/reports/DailySummaryPersonReportRow";
import c from "@/lib/loggers/console/ConsoleLogger";

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