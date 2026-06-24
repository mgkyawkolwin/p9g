import DailyReservationDetailReportRow from "@/core/models/dto/reports/DailyReservationDetailReportRow";
import DailySummaryGuestsRoomsReportRow from "@/core/models/dto/reports/DailySummaryGuestsRoomsReportrow";
import DailySummaryIncomeReportRow from "@/core/models/dto/reports/DailySummaryIncomeReportRow";
import DailySummaryPersonReportRow from "@/core/models/dto/reports/DailySummaryPersonReportRow";
import DailySummaryReservationStatusReportRow from "@/core/models/dto/reports/DailySummaryReservationStatusReportRow";
import DailySummaryZoneGuestsReportRow from "@/core/models/dto/reports/DailySummaryZoneGuestsReportRow";
import DailySummaryRoomOccupancyReportRow from "@/core/models/dto/reports/DailySummaryRoomOccupancyReportRow";
import MonthlySummaryReservationStatusReportRow from "@/core/models/dto/reports/MonthlySummaryReservationStatusReportRow";
import SessionUser from "@/core/models/dto/SessionUser";
import { PickupDropoffReportResponse } from '@/core/models/dto/reports/PickupDropoffReportResponse';

export default interface IReportService {

    getDailyReservationDetailReport(checkInFrom: string, checkInUntil: string, createdFrom: string, createdUntil: string, updatedFrom: string, updatedUntil: string, reservationType: string, reservationStatus: string, bookingSource: string, sessionUser: SessionUser): Promise<DailyReservationDetailReportRow[]>;
    getDailySummaryGuestsRoomsReport(startDate: string, endDate: string, reservationStatus: string, sessionUser: SessionUser): Promise<DailySummaryGuestsRoomsReportRow[]>;
    getDailySummaryIncomeReport(startDate: string, endDate: string, reservationType: string, reservationStatus: string, sessionUser: SessionUser): Promise<DailySummaryIncomeReportRow[]>;
    getDailySummaryPersonReport(startDate: string, endDate: string, reservationStatus: string, sessionUser: SessionUser): Promise<DailySummaryPersonReportRow[]>;
    getDailySummaryReservationStatusReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryReservationStatusReportRow[]>;
    getDailySummaryRoomOccupancyReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryRoomOccupancyReportRow[]>;
    getMonthlySummaryReservationStatusReport(year: string, sessionUser: SessionUser): Promise<MonthlySummaryReservationStatusReportRow[]>;
    getDailySummaryZoneGuestsReport(startDate: string, endDate: string, reservationStatus: string, sessionUser: SessionUser): Promise<DailySummaryZoneGuestsReportRow[]>;
    getPickupDropoffReport(arrivalStartDateTime: string, arrivalEndDateTime: string, departureStartDateTime: string, departureEndDateTime: string, sessionUser: SessionUser): Promise<PickupDropoffReportResponse>;
}