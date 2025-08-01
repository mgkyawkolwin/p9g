import DailySummaryGuestsRoomsReportRow from "@/domain/dtos/reports/DailySummaryGuestsRoomsReportrow";
import IRepository from "./IRepository";
import Customer from "@/domain/models/Customer";
import DailySummaryIncomeReportRow from "@/domain/dtos/reports/DailySummaryIncomeReportRow";

export default interface IReportRepository extends IRepository<Customer>{

    getDailySummaryGuestsRoomsReport(startDate:string, endDate:string) : Promise<DailySummaryGuestsRoomsReportRow[]>;
    getDailySummaryIncomeReport(startDate:string, endDate:string) : Promise<DailySummaryIncomeReportRow[]>;
}