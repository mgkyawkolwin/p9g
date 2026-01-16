import DailyReservationDetailReportRow from "@/core/models/dto/reports/DailyReservationDetailReportRow";
import DailySummaryGuestsRoomsReportRow from "@/core/models/dto/reports/DailySummaryGuestsRoomsReportrow";
import DailySummaryIncomeReportRow from "@/core/models/dto/reports/DailySummaryIncomeReportRow";
import DailySummaryPersonReportRow from "@/core/models/dto/reports/DailySummaryPersonReportRow";
import SessionUser from "@/core/models/dto/SessionUser";

export default interface IReportRepository {

    getDailyReservationDetailReport(checkInFrom: string, checkInUntil: string, createdFrom: string, createdUntil: string, updatedFrom: string, updatedUntil: string, reservationType: string, reservationStatus: string, bookingSource: string, sessionUser: SessionUser): Promise<DailyReservationDetailReportRow[]>;
    getDailySummaryGuestsRoomsReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryGuestsRoomsReportRow[]>;
    getDailySummaryIncomeReport(startDate: string, endDate: string, reservationType: string, sessionUser: SessionUser): Promise<DailySummaryIncomeReportRow[]>;
    getDailySummaryPersonReport(startDate: string, endDate: string, reservationStatus: string, sessionUser: SessionUser): Promise<DailySummaryPersonReportRow[]>;

}