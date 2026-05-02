import { inject, injectable } from "inversify";
import "reflect-metadata";
import { TYPES } from "@/core/types";
import type IReportRepository from "../contracts/IReportRepository";
import DailySummaryGuestsRoomsReportRow from "@/core/models/dto/reports/DailySummaryGuestsRoomsReportrow";
import { getCacheKey } from "@/lib/utils";
import c from "@/lib/loggers/console/ConsoleLogger";
import DailySummaryIncomeReportRow from "@/core/models/dto/reports/DailySummaryIncomeReportRow";
import DailySummaryPersonReportRow from "@/core/models/dto/reports/DailySummaryPersonReportRow";
import DailySummaryZoneGuestsReportRow from "@/core/models/dto/reports/DailySummaryZoneGuestsReportRow";
import DailySummaryRoomOccupancyReportRow from "@/core/models/dto/reports/DailySummaryRoomOccupancyReportRow";
import MonthlySummaryReservationStatusReportRow from "@/core/models/dto/reports/MonthlySummaryReservationStatusReportRow";
import type ICacheAdapter from "@/lib/cache/ICacheAdapter";
import SessionUser from "@/core/models/dto/SessionUser";
import DailyReservationDetailReportRow from "@/core/models/dto/reports/DailyReservationDetailReportRow";
import { PickupDropoffReportResponse } from '@/core/models/dto/reports/PickupDropoffReportResponse';
import DailySummaryReservationStatusReportRow from "@/core/models/dto/reports/DailySummaryReservationStatusReportRow";


@injectable()
export default class CacheReportRepositoryDecorator implements IReportRepository {

    constructor(
        @inject(TYPES.IReportRepository) protected readonly repository: IReportRepository,
        protected readonly baseCacheKey: string,
        @inject(TYPES.ICacheAdapter) protected readonly cache: ICacheAdapter
    ) {
        
    }


    async getDailyReservationDetailReport(checkInFrom: string, checkInUntil: string, createdFrom: string, createdUntil: string, updatedFrom: string, updatedUntil: string, reservationType: string, reservationStatus: string, bookingSource: string, sessionUser: SessionUser): Promise<DailyReservationDetailReportRow[]> {
        c.fs("Repository > getDailyReservationDetailReport");

        const cacheTag = `guestsroom-${checkInFrom}-${checkInUntil}-${sessionUser.location}`;

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if (cacheObject) {
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.getDailyReservationDetailReport(checkInFrom, checkInUntil, createdFrom, createdUntil, updatedFrom, updatedUntil, reservationType, reservationStatus, bookingSource, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;
    }


    async getDailySummaryGuestsRoomsReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryGuestsRoomsReportRow[]> {
        c.fs("Repository > getDailySummaryGuestsRoomsReport");
        const cacheTag = `guestsroom-${startDate}-${endDate}-${sessionUser.location}`;

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if (cacheObject) {
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.getDailySummaryGuestsRoomsReport(startDate, endDate, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;
    }


    async getDailySummaryIncomeReport(startDate: string, endDate: string, reservationStatus: string, sessionUser: SessionUser): Promise<DailySummaryIncomeReportRow[]> {
        c.fs("Repository > getDailySummaryIncomeReport");

        const cacheTag = `guestsroom-${startDate}-${endDate}-${reservationStatus}-${sessionUser.location}`;

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if (cacheObject) {
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.getDailySummaryIncomeReport(startDate, endDate, reservationStatus, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;
    }


    async getDailySummaryPersonReport(startDate: string, endDate: string, reservationStatus: string, sessionUser: SessionUser): Promise<DailySummaryPersonReportRow[]> {
        c.fs("Repository > getDailySummaryPersonReport");

        const cacheTag = `guestsroom-${startDate}-${endDate}-${sessionUser.location}`;

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if (cacheObject) {
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.getDailySummaryPersonReport(startDate, endDate, reservationStatus, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;

    }

    async getDailySummaryReservationStatusReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryReservationStatusReportRow[]> {
        c.fs("Repository > getDailySummaryReservationStatusReport");
        const cacheTag = `guestsroom-${startDate}-${endDate}-${sessionUser.location}`;

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if (cacheObject) {
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.getDailySummaryReservationStatusReport(startDate, endDate, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;
    }

    async getDailySummaryRoomOccupancyReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryRoomOccupancyReportRow[]> {
        c.fs("Repository > getDailySummaryRoomOccupancyReport");
        const cacheTag = `roomoccupancy-${startDate}-${endDate}-${sessionUser.location}`;

        const startTime = performance.now();
        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if (cacheObject) {
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.getDailySummaryRoomOccupancyReport(startDate, endDate, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;
    }

    async getMonthlySummaryReservationStatusReport(year: string, sessionUser: SessionUser): Promise<MonthlySummaryReservationStatusReportRow[]> {
        c.fs("Repository > getMonthlySummaryReservationStatusReport");
        const cacheTag = `monthlyreservationstatus-${year}-${sessionUser.location}`;

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if (cacheObject) {
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.getMonthlySummaryReservationStatusReport(year, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;
    }

    async getDailySummaryZoneGuestsReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryZoneGuestsReportRow[]> {
        c.fs("Repository > getDailySummaryZoneGuestsReport");
        const cacheTag = `guestsroom-${startDate}-${endDate}-${sessionUser.location}`;

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if (cacheObject) {
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.getDailySummaryZoneGuestsReport(startDate, endDate, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;
    }

    async getPickupDropoffReport(arrivalDepartureDate: string, sessionUser: SessionUser): Promise<PickupDropoffReportResponse> {
        c.fs('Repository > getPickupDropoffReport');

        const cacheTag = `pickupdropoff-${arrivalDepartureDate}-${sessionUser.location}`;
        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if (cacheObject) {
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.getPickupDropoffReport(arrivalDepartureDate, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;
    }
}