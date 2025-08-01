import DailySummaryGuestsRoomsReportRow from "../dtos/reports/DailySummaryGuestsRoomsReportrow";
import IReportService from "./contracts/IReportService";
import { injectable, inject } from 'inversify';
import { TYPES } from '@/lib/types';
import type ILogRepository from '@/data/repo/contracts/ILogRepository';
import type IReportRepository from "@/data/repo/contracts/IReportRepository";
import DailySummaryIncomeReportRow from "../dtos/reports/DailySummaryIncomeReportRow";

@injectable()
export default class ReportService implements IReportService{

    constructor(@inject(TYPES.IReportRepository) private reportRepository : IReportRepository){

    }

    async getDailySummaryGuestsRoomsReport(startDate: string, endDate: string): Promise<DailySummaryGuestsRoomsReportRow[]> {
        return await this.reportRepository.getDailySummaryGuestsRoomsReport(startDate, endDate);
    }

    async getDailySummaryIncomeReport(startDate: string, endDate: string): Promise<DailySummaryIncomeReportRow[]> {
        return await this.reportRepository.getDailySummaryIncomeReport(startDate, endDate);
    }

}