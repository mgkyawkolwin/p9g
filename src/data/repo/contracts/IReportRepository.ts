import DailySummaryReportRow from "@/domain/dtos/reports/dailysummaryreportrow";
import IRepository from "./IRepository";
import Customer from "@/domain/models/Customer";

export default interface IReportRepository extends IRepository<Customer>{

    getDailySummaryReport(startDate:string, endDate:string) : Promise<DailySummaryReportRow[]>;
}