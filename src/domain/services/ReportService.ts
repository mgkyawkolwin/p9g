import DailySummaryReportRow from "../dtos/reports/dailysummaryreportrow";
import IReportService from "./contracts/IReportService";
import { injectable, inject } from 'inversify';
import { TYPES } from '@/lib/types';
import type ILogRepository from '@/data/repo/contracts/ILogRepository';
import type IReportRepository from "@/data/repo/contracts/IReportRepository";

@injectable()
export default class ReportService implements IReportService{

    constructor(@inject(TYPES.IReportRepository) private reportRepository : IReportRepository){

    }

    async getDailySummaryReport(startDate: string, endDate: string): Promise<DailySummaryReportRow[]> {
        return await this.reportRepository.getDailySummaryReport(startDate, endDate);
    }

}