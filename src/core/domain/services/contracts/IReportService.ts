import DailySummaryGuestsRoomsReportRow from "@/core/domain/dtos/reports/DailySummaryGuestsRoomsReportrow";
import DailySummaryIncomeReportRow from "@/core/domain/dtos/reports/DailySummaryIncomeReportRow";
import DailySummaryPersonReportRow from "@/core/domain/dtos/reports/DailySummaryPersonReportRow";


export default interface IReportService {

    getDailySummaryGuestsRoomsReport(startDate:string, endDate:string) : Promise<DailySummaryGuestsRoomsReportRow[]>;
    getDailySummaryIncomeReport(startDate:string, endDate:string) : Promise<DailySummaryIncomeReportRow[]>;
    getDailySummaryPersonReport(startDate:string, endDate:string) : Promise<DailySummaryPersonReportRow[]>;
    
}