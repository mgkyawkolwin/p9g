import DailySummaryGuestsRoomsReportRow from "@/core/models/dto/reports/DailySummaryGuestsRoomsReportrow";
import DailySummaryIncomeReportRow from "@/core/models/dto/reports/DailySummaryIncomeReportRow";
import DailySummaryPersonReportRow from "@/core/models/dto/reports/DailySummaryPersonReportRow";

export default interface IReportRepository{

    getDailySummaryGuestsRoomsReport(startDate:string, endDate:string) : Promise<DailySummaryGuestsRoomsReportRow[]>;
    getDailySummaryIncomeReport(startDate:string, endDate:string) : Promise<DailySummaryIncomeReportRow[]>;
    getDailySummaryPersonReport(startDate:string, endDate:string) : Promise<DailySummaryPersonReportRow[]>;
}