import { inject, injectable } from "inversify";
import "reflect-metadata";
import type IRepository from "./IRepository";
import type ICacheAdapter from "../cache/ICacheAdapter";
import ITransaction from "../db/ITransaction";
import c from "../loggers/console/ConsoleLogger";
import { getCacheKey } from "../utils";


@injectable()
export class CacheRepositoryDecorator<TDomain> implements IRepository<TDomain> {

    constructor(
        protected readonly repository: IRepository<TDomain>,
        protected readonly baseCacheKey: string,
        protected readonly cache: ICacheAdapter
    ) {
        
    }


    async create<TTransaction extends ITransaction>(domain: TDomain, transaction?: TTransaction): Promise<TDomain> {
        c.fs("CacheRepositoryDecorator > create");
        
        domain = await this.repository.create(domain, transaction);

        await this.cache.deleteBase(getCacheKey(this.baseCacheKey));

        c.fe("CacheRepositoryDecorator > create");
        return domain;
    }


    async createMany<TTransaction extends ITransaction>(domains: TDomain[], transaction?: TTransaction): Promise<void> {
        c.fs("CacheRepositoryDecorator > createMany");
        
        this.repository.createMany(domains, transaction);

        await this.cache.deleteBase(getCacheKey(this.baseCacheKey));

        c.fe("CacheRepositoryDecorator > createMany");
    }


    async executeQuery<TTransaction extends ITransaction>(query: string, transaction?: TTransaction): Promise<TDomain[]> {
        c.fs('CacheRepositoryDecorator > executeQuery');
        const startTime = performance.now();

        const cacheTag = query;

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if(cacheObject){
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const domains = await this.repository.executeQuery(query, transaction);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);

        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), domains);

        return domains;
    }


    async findAll(): Promise<TDomain[]> {
        c.fs('CacheRepositoryDecorator > findAll');
        const startTime = performance.now();

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey));
        if(cacheObject){
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const domains = await this.repository.findAll();

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey), getCacheKey(this.baseCacheKey), domains);

        return domains;
    }


    async findById<TIdType>(id: TIdType): Promise<TDomain | null> {
        c.fs('CacheRepositoryDecorator > findById');
        const startTime = performance.now();
        const cacheTag = String(id);

        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if(cacheObject){
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const domain = await this.repository.findById(id);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), domain);

        return domain;
    }


    async findOne<TQuery>(query: TQuery): Promise<TDomain | null> {
        c.fs('CacheRepositoryDecorator > findOne');
        const startTime = performance.now();

        const cacheTag = JSON.stringify(query);
        
        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if(cacheObject){
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const domain = await this.repository.findOne(query);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), domain);

        return domain;
    }


    async findMany<TQuery, TOrder>(query?: TQuery, sort?: TOrder, offset?: number, limit?: number): Promise<[TDomain[], number]> {
        c.fs('CacheRepositoryDecorator > findMany');
        const startTime = performance.now();
        const cacheTag = `${JSON.stringify(query)}-${JSON.stringify(sort)}-${offset}-${limit}`;
        
        const cacheObject = await this.cache.get(getCacheKey(this.baseCacheKey, cacheTag));
        if(cacheObject){ 
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject; 
        }

        const domains = await this.repository.findMany(query, sort, offset, limit);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), domains);

        return domains;
    }


    async update<TIdType, TTransaction extends ITransaction>(id: TIdType, entity: TDomain, transaction?: TTransaction): Promise<void> {
        c.fs('CacheRepositoryDecorator > update');

        await this.repository.update(id, entity, transaction);

        await this.cache.deleteBase(getCacheKey(this.baseCacheKey));

    }


    async updateWhere<TQuery, TTransaction extends ITransaction>(where: TQuery, entity: TDomain, transaction?: TTransaction): Promise<void> {
        c.fs('CacheRepositoryDecorator > updateWhere');

        await this.repository.updateWhere(where, entity, transaction);

        await this.cache.deleteBase(getCacheKey(this.baseCacheKey));

    }


    async delete<TIdType, TTransaction extends ITransaction>(id: TIdType, transaction?: TTransaction): Promise<void> {
        c.fs('CacheRepositoryDecorator > delete');

        await this.repository.delete(id, transaction);

        await this.cache.deleteBase(getCacheKey(this.baseCacheKey));

        c.fe('CacheRepositoryDecorator > delete');
    }


    async deleteWhere<TQuery, TTransaction extends ITransaction>(query: TQuery, transaction?: TTransaction): Promise<void> {
        c.fs('CacheRepositoryDecorator > deleteMany');

        await this.repository.deleteWhere(query, transaction);

        await this.cache.deleteBase(getCacheKey(this.baseCacheKey));

        c.fe('CacheRepositoryDecorator > deleteMany');
    }


    async exists<TQuery>(query: TQuery): Promise<boolean> {
        c.fs('CacheRepositoryDecorator > exits');
        const cacheTag = JSON.stringify(query);
        const startTime = performance.now();
        
        const cacheObject = await this.cache.get(cacheTag);
        if(cacheObject){ 
            console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);
            return cacheObject;
        }

        const result = await this.repository.exists(query);

        console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
        await this.cache.add(getCacheKey(this.baseCacheKey, cacheTag), getCacheKey(this.baseCacheKey), result);

        return result;
    }

}
