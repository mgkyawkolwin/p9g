import DailySummaryGuestsRoomsReportRow from "@/core/domain/dtos/reports/DailySummaryGuestsRoomsReportrow";
import IRepository from "./IRepository";
import Customer from "@/core/domain/models/Customer";
import DailySummaryIncomeReportRow from "@/core/domain/dtos/reports/DailySummaryIncomeReportRow";
import DailySummaryPersonReportRow from "@/core/domain/dtos/reports/DailySummaryPersonReportRow";

export default interface IReportRepository{

    getDailySummaryGuestsRoomsReport(startDate:string, endDate:string) : Promise<DailySummaryGuestsRoomsReportRow[]>;
    getDailySummaryIncomeReport(startDate:string, endDate:string) : Promise<DailySummaryIncomeReportRow[]>;
    getDailySummaryPersonReport(startDate:string, endDate:string) : Promise<DailySummaryPersonReportRow[]>;
}