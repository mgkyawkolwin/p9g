import DailySummaryGuestsRoomsReportRow from "@/core/models/dto/reports/DailySummaryGuestsRoomsReportrow";
import DailySummaryIncomeReportRow from "@/core/models/dto/reports/DailySummaryIncomeReportRow";
import DailySummaryPersonReportRow from "@/core/models/dto/reports/DailySummaryPersonReportRow";
import SessionUser from "@/core/models/dto/SessionUser";

export default interface IReportRepository{

    getDailySummaryGuestsRoomsReport(startDate:string, endDate:string, sessionUser: SessionUser) : Promise<DailySummaryGuestsRoomsReportRow[]>;
    getDailySummaryIncomeReport(startDate:string, endDate:string, sessionUser: SessionUser) : Promise<DailySummaryIncomeReportRow[]>;
    getDailySummaryPersonReport(startDate:string, endDate:string, sessionUser: SessionUser) : Promise<DailySummaryPersonReportRow[]>;
}