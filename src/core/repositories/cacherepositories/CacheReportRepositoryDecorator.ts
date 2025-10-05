import { inject, injectable } from "inversify";
import "reflect-metadata";
import { TYPES } from "@/core/types";
import type IReportRepository from "../contracts/IReportRepository";
import DailySummaryGuestsRoomsReportRow from "@/core/models/dto/reports/DailySummaryGuestsRoomsReportrow";
import { getCacheKey } from "@/lib/utils";
import c from "@/lib/loggers/console/ConsoleLogger";
import DailySummaryIncomeReportRow from "@/core/models/dto/reports/DailySummaryIncomeReportRow";
import DailySummaryPersonReportRow from "@/core/models/dto/reports/DailySummaryPersonReportRow";
import type ICacheAdapter from "@/lib/cache/ICacheAdapter";
import SessionUser from "@/core/models/dto/SessionUser";
import DailyReservationDetailReportRow from "@/core/models/dto/reports/DailyReservationDetailReportRow";


@injectable()
export default class CacheReportRepositoryDecorator implements IReportRepository {

    constructor(
        @inject(TYPES.IReportRepository) protected readonly repository: IReportRepository,
        protected readonly baseCacheKey: string,
        @inject(TYPES.ICacheAdapter) protected readonly cache: ICacheAdapter
    ) {
        
    }


    async getDailyReservationDetailReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailyReservationDetailReportRow[]> {
        c.fs("Repository > getDailyReservationDetailReport");

        const cacheTag = `guestsroom-${startDate}-${endDate}-${sessionUser.location}`;

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if (cacheObject) {
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.getDailyReservationDetailReport(startDate, endDate, sessionUser);

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


    async getDailySummaryIncomeReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryIncomeReportRow[]> {
        c.fs("Repository > getDailySummaryIncomeReport");

        const cacheTag = `guestsroom-${startDate}-${endDate}-${sessionUser.location}`;

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if (cacheObject) {
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.getDailySummaryIncomeReport(startDate, endDate, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;
    }


    async getDailySummaryPersonReport(startDate: string, endDate: string, sessionUser: SessionUser): Promise<DailySummaryPersonReportRow[]> {
        c.fs("Repository > getDailySummaryPersonReport");

        const cacheTag = `guestsroom-${startDate}-${endDate}-${sessionUser.location}`;

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if (cacheObject) {
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.getDailySummaryPersonReport(startDate, endDate, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;

    }
}