import { TransactionType } from "@/core/db/mysql/MySqlDatabase";
import Reservation from "@/core/models/domain/Reservation";
import Room from "@/core/models/domain/Room";
import RoomReservation from "@/core/models/domain/RoomReservation";
import RoomAndPax from "@/core/models/dto/RoomAndPax";
import RoomReservationDto from "@/core/models/dto/RoomReservationDto";
import SessionUser from "@/core/models/dto/SessionUser";
import { PagerParams, SearchFormFields, TYPES } from "@/core/types";
import type ICacheAdapter from "@/lib/cache/ICacheAdapter";
import c from "@/lib/loggers/console/ConsoleLogger";
import { CacheRepositoryDecorator } from "@/lib/repositories/CacheRepositoryDecorator";
import { getCacheKey } from "@/lib/utils";
import { inject, injectable } from "inversify";
import type IReservationRepository from "../contracts/IReservationRepository";


@injectable()
export default class CacheReservationRepositoryDecorator extends CacheRepositoryDecorator<Reservation> implements IReservationRepository {

    constructor(
        @inject(TYPES.IReservationRepository) protected readonly repository: IReservationRepository,
        protected readonly baseCacheKey: string,
        @inject(TYPES.ICacheAdapter) protected readonly cache: ICacheAdapter
    ) {
        super(repository, baseCacheKey, cache);
    }


    async getRoomsAndPax(drawDate: Date, sessionUser: SessionUser): Promise<RoomAndPax[]> {
        c.fs('CacheReservationRepositoryDecorator > getRoomsAndPax');
        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, drawDate.toISOString()));
        if(cacheObject){
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.getRoomsAndPax(drawDate, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, drawDate.toISOString()), getCacheKey(this.baseCacheKey), object);

        return object;
    }


    async reservationGetById(id: string): Promise<Reservation | undefined> {
        c.fs('CacheReservationRepositoryDecorator > reservationGetById');
        c.d(`Cache Tag: ${id}`);
        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, id));
        if(cacheObject){
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.reservationGetById(id);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, id), getCacheKey(this.baseCacheKey), object);

        return object;
    }


    async reservationGetList(searchFormFields: SearchFormFields, pagerParams: PagerParams, list: string, sessionUser: SessionUser): Promise<[Reservation[], number]> {
        c.fs('CacheReservationRepositoryDecorator > reservationGetList');

        const cacheTag = `${JSON.stringify(searchFormFields)}-${JSON.stringify(pagerParams)}-${list}-${sessionUser.location}`;
        c.d(`Cache Tag: ${cacheTag}`);

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if(cacheObject){
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.reservationGetList(searchFormFields, pagerParams, list, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;
        
    }


    async roomAndReservationGetList(searchFormFields: SearchFormFields, sessionUser: SessionUser): Promise<RoomReservationDto[]> {
        c.fs('CacheReservationRepositoryDecorator > roomAndReservationGetList');
        
        const cacheTag = `${JSON.stringify(searchFormFields)}-${sessionUser.location}`;
        c.d(`Cache Tag: ${cacheTag}`);

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if(cacheObject){
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.roomAndReservationGetList(searchFormFields, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;
    }


    async roomReservationGetListById(reservationId: string, includeChildren: boolean = false, sessionUser: SessionUser): Promise<[RoomReservation[], number]> {
        c.fs('CacheReservationRepositoryDecorator > roomReservationGetListById');
        
        const cacheTag = `${reservationId}-${includeChildren}-${sessionUser.location}`;
        c.d(`Cache Tag: ${cacheTag}`);

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if(cacheObject){
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.roomReservationGetListById(reservationId, includeChildren, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;
    }


    async roomReservationUpdateList(reservationId: string, roomReservations: RoomReservation[], sessionUser: SessionUser, transaction?: TransactionType): Promise<void> {
        c.fs('CacheReservationRepositoryDecorator > roomReservationUpdateList');
        
        await this.repository.roomReservationUpdateList(reservationId, roomReservations, sessionUser, transaction);

        await this.cache.deleteBase(getCacheKey(this.baseCacheKey));

        c.fe('CacheReservationRepositoryDecorator > roomReservationUpdateList');
    }


    async roomScheduleGetList(searchFormFields: SearchFormFields, sessionUser: SessionUser): Promise<[Room[], number]> {
        c.fs('CacheReservationRepositoryDecorator > roomScheduleGetList');
        
        const cacheTag = `${JSON.stringify(searchFormFields)}-${sessionUser.location}`;
        c.d(`Cache Tag: ${cacheTag}`);

        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if(cacheObject){
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const object = await this.repository.roomScheduleGetList(searchFormFields, sessionUser);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), object);

        return object;

    }

}