import DailySummaryGuestsRoomsReportRow from "../models/dto/reports/DailySummaryGuestsRoomsReportrow";
import IReportService from "./contracts/IReportService";
import { injectable, inject } from 'inversify';
import { TYPES } from '@/core/types';
import type IReportRepository from "@/core/repositories/contracts/IReportRepository";
import DailySummaryIncomeReportRow from "../models/dto/reports/DailySummaryIncomeReportRow";
import DailySummaryPersonReportRow from "../models/dto/reports/DailySummaryPersonReportRow";
import DailySummaryReservationStatusReportRow from "../models/dto/reports/DailySummaryReservationStatusReportRow";
import DailySummaryZoneGuestsReportRow from "../models/dto/reports/DailySummaryZoneGuestsReportRow";
import DailySummaryRoomOccupancyReportRow from "../models/dto/reports/DailySummaryRoomOccupancyReportRow";
import MonthlySummaryReservationStatusReportRow from "../models/dto/reports/MonthlySummaryReservationStatusReportRow";
import c from "@/lib/loggers/console/ConsoleLogger";
import SessionUser from "../models/dto/SessionUser";
import { PickupDropoffReportResponse } from '@/core/models/dto/reports/PickupDropoffReportResponse';
import DailyReservationDetailReportRow from "../models/dto/reports/DailyReservationDetailReportRow";

@injectable()
export default class ReportService implements IReportService {

    constructor(@inject(TYPES.IReportRepository) private reportRepository: IReportRepository) {

    }


    async getDailyReservationDetailReport(checkInFrom: string, checkInUntil: string, createdFrom: string, createdUntil: string, updatedFrom: string, updatedUntil: string, reservationType: string, reservationStatus: string, bookingSource: string, sessionUser: SessionUser): Promise<DailyReservationDetailReportRow[]> {
        c.fs('ReportService > getDailyReservationDetailReport');
        return await this.reportRepository.getDailyReservationDetailReport(checkInFrom, checkInUntil, createdFrom, createdUntil, updatedFrom, updatedUntil, reservationType, reservationStatus, bookingSource, sessionUser);
    }


    async getDailySummaryGuestsRoomsReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryGuestsRoomsReportRow[]> {
        c.fs('ReportService > getDailySummaryGuestsRoomsReport');
        return await this.reportRepository.getDailySummaryGuestsRoomsReport(startDate, endDate, sessionUser);
    }


    async getDailySummaryIncomeReport(startDate: string, endDate: string, reservationType: string, sessionUser: SessionUser): Promise<DailySummaryIncomeReportRow[]> {
        c.fs('ReportService > getDailySummaryIncomeReport');
        c.d({startDate, endDate, reservationType, sessionUser});
        return await this.reportRepository.getDailySummaryIncomeReport(startDate, endDate, reservationType, sessionUser);
    }


    async getDailySummaryPersonReport(startDate: string, endDate: string, reservationStatus: string, sessionUser: SessionUser): Promise<DailySummaryPersonReportRow[]> {
        c.fs('ReportService > getDailySummaryPersonReport');
        return await this.reportRepository.getDailySummaryPersonReport(startDate, endDate, reservationStatus, sessionUser);
    }

    async getDailySummaryReservationStatusReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryReservationStatusReportRow[]> {
        c.fs('ReportService > getDailySummaryReservationStatusReport');
        return await this.reportRepository.getDailySummaryReservationStatusReport(startDate, endDate, sessionUser);
    }

    async getDailySummaryRoomOccupancyReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryRoomOccupancyReportRow[]> {
        c.fs('ReportService > getDailySummaryRoomOccupancyReport');
        return await this.reportRepository.getDailySummaryRoomOccupancyReport(startDate, endDate, sessionUser);
    }

    async getMonthlySummaryReservationStatusReport(year: string, sessionUser: SessionUser): Promise<MonthlySummaryReservationStatusReportRow[]> {
        c.fs('ReportService > getMonthlySummaryReservationStatusReport');
        return await this.reportRepository.getMonthlySummaryReservationStatusReport(year, sessionUser);
    }

    async getDailySummaryZoneGuestsReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryZoneGuestsReportRow[]> {
        c.fs('ReportService > getDailySummaryZoneGuestsReport');
        return await this.reportRepository.getDailySummaryZoneGuestsReport(startDate, endDate, sessionUser);
    }

    async getPickupDropoffReport(
        arrivalStartDateTime: string,
        arrivalEndDateTime: string,
        departureStartDateTime: string,
        departureEndDateTime: string,
        sessionUser: SessionUser
    ): Promise<PickupDropoffReportResponse> {
        c.fs('ReportService > getPickupDropoffReport');
        return await this.reportRepository.getPickupDropoffReport(
            arrivalStartDateTime,
            arrivalEndDateTime,
            departureStartDateTime,
            departureEndDateTime,
            sessionUser
        );
    }

}