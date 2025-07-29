import DailySummaryReportRow from "@/domain/dtos/reports/dailysummaryreportrow";


export default interface IReportService {

    getDailySummaryReport(startDate:string, endDate:string) : Promise<DailySummaryReportRow[]>;
    
}