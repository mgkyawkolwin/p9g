//Ordered Imports
import { SQL, and, count, asc, desc, eq, gt, gte, inArray, lt, lte, or, like, Table, Column, getTableColumns, getTableName, sql } from "drizzle-orm";
import { AnyMySqlSelectQueryBuilder, MySqlColumn, MySqlJoin, MySqlJoinType, MySqlSelect, MySqlSelectQueryBuilder, MySqlTable, MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import { type IDatabaseClient } from "@/lib/db/IDatabase";
import IDrizzleTable from "@/core/repositories/drizzle/IDrizzleTable";
import c from "@/lib/loggers/console/ConsoleLogger";
import IEntity from "@/lib/models/entity/IEntity";
import { CustomError } from "@/lib/errors";
import ITransaction from "../../db/ITransaction";
import type IMapper from "@/lib/mappers/IMapper";
import { TYPES } from "@/core/types";
import IDomainModel from "@/lib/models/domain/IDomainModel";
import type IQueryTranformer from "@/lib/transformers/IQueryTransformer";
import { AnyCondition } from "@/lib/transformers/types";
import { buildAnyCondition } from "@/core/helpers";
import { Repository } from "./Repository";
import { unstable_cache } from 'next/cache';
import { revalidateTag} from 'next/cache';


@injectable()
export class CacheRepository<TDomain extends IDomainModel, TEntity extends IEntity, TTable extends IDrizzleTable> extends Repository<TDomain, TEntity, TTable> {

    protected readonly tableName: string;

    constructor(
        protected readonly dbClient: IDatabaseClient<any>,
        protected readonly table: TTable,
        protected readonly defaultColumns: any,
        protected readonly defaultJoin: (q: MySqlSelect) => MySqlSelect,
        protected readonly mapper: IMapper,
        protected readonly domainClass: new () => TDomain,
        protected readonly entityClass: new () => TEntity,
        protected readonly transformer: IQueryTranformer
    ) {
        super(dbClient, table, defaultColumns, defaultJoin, mapper, domainClass, entityClass, transformer);
        const symbols = Object.getOwnPropertySymbols(this.table);
        const nameSymbol = symbols.find(sym => sym.toString() === 'Symbol(drizzle:Name)');
        this.tableName = this.table[nameSymbol];
    }

    private getCacheKey(tag?: string): string[] {
        console.log('getcachekey');
        
        return tag
            ? [`${this.tableName}:${tag}`, `${this.tableName}`]
            : [`${this.tableName}`];
    }


    private getCacheTags(tag?: string): string[] {
        console.log(`getCacheTags - ${tag}`);
        return tag
            ? [`${this.tableName}:${tag}`, `${this.tableName}`]
            : [`${this.tableName}`];
    }

    async create<TTransaction extends ITransaction>(domain: TDomain, transaction?: TTransaction): Promise<TDomain> {
        c.fs("CacheRepository > create");
        
        domain = await super.create(domain, transaction);

        await Promise.all([
            revalidateTag(`${this.tableName}`)
        ]);
        c.fe("CacheRepository > create");
        return domain;
    }


    async createMany<TTransaction extends ITransaction>(domains: TDomain[], transaction?: TTransaction): Promise<void> {
        c.fs("CacheRepository > createMany");
        
        super.createMany(domains, transaction);

        await Promise.all([
            revalidateTag(`${this.tableName}`)
        ]);

        c.fe("CacheRepository > createMany");
    }


    async executeQuery<TTransaction extends ITransaction>(query: string, transaction?: TTransaction): Promise<TDomain[]> {
        c.fs('CacheRepository > executeQuery');
        const startTime = performance.now();

        const cachedData = await unstable_cache(
            async () => {
                const domains = await super.executeQuery(query);
                console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
                return domains;
            },
            this.getCacheKey(query),
            {
                tags: this.getCacheTags(query),
                revalidate: 3600
            }
        )();

        console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);

        return cachedData;
    }


    async findAll(): Promise<TDomain[]> {
        c.fs('CacheRepository > findAll');
        const startTime = performance.now();

        const cachedData = await unstable_cache(
            async () => {
                const domains = await super.findAll();
                console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
                return domains;
            },
            this.getCacheKey(),
            {
                tags: this.getCacheTags(),
                revalidate: 3600
            }
        )();

        console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);

        return cachedData;
    }


    async findById<TIdType>(id: TIdType): Promise<TDomain | null> {
        c.fs('CacheRepository > findById');
        const startTime = performance.now();
        
        const cachedData = await unstable_cache(
            async () => {
                const domain = await super.findById(id);
                console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
                return domain;
            },
            this.getCacheKey(String(id)),
            {
                tags: this.getCacheTags(String(id)),
                revalidate: 3600
            }
        )();

        console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);

        return cachedData;
    }


    async findOne<TQuery>(query: TQuery): Promise<TDomain | null> {
        c.fs('CacheRepository > findOne');
        const startTime = performance.now();

        const cachedData = await unstable_cache(
            async () => {
                const domain = await super.findOne(query);
                console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
                return domain;
            },
            this.getCacheKey(JSON.stringify(query)),
            {
                tags: this.getCacheTags(JSON.stringify(query)),
                revalidate: 3600
            }
        )();

        console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);

        return cachedData;
    }


    async findMany<TQuery, TOrder>(query?: TQuery, sort?: TOrder, offset?: number, limit?: number): Promise<[TDomain[], number]> {
        c.fs('CacheRepository > findMany');
        const startTime = performance.now();

        const cachedData = await unstable_cache(
            async () => {
                const domain = await super.findMany(query, sort, offset, limit);
                console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
                return domain;
            },
            this.getCacheKey(JSON.stringify(query)+JSON.stringify(sort)+offset+limit),
            {
                tags: this.getCacheTags(JSON.stringify(query)+JSON.stringify(sort)+offset+limit),
                revalidate: 3600
            }
        )();

        console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);

        return cachedData;
    }


    async update<TIdType, TTransaction extends ITransaction>(id: TIdType, entity: TDomain, transaction?: TTransaction): Promise<void> {
        c.fs('CacheRepository > update');
        c.d(entity);
        super.update(id, entity, transaction);

        await Promise.all([
            revalidateTag(`${this.tableName}`),
            revalidateTag(`${this.tableName}:${id}`)
        ]);

        c.fe('CacheRepository > update');
    }


    async delete<TIdType, TTransaction extends ITransaction>(id: TIdType, transaction?: TTransaction): Promise<void> {
        c.fs('CacheRepository > delete');
        c.d(`Id: ${id}`);
        super.delete(id, transaction);

        await Promise.all([
            revalidateTag(`${this.tableName}`),
            revalidateTag(`${this.tableName}:${id}`)
        ]);

        c.fe('CacheRepository > delete');
    }


    async deleteWhere<TQuery, TTransaction extends ITransaction>(query: TQuery, transaction?: TTransaction): Promise<void> {
        c.fs('CacheRepository > deleteMany');

        await super.deleteWhere(query, transaction);

        await Promise.all([
            revalidateTag(`${this.tableName}`)
        ]);

        c.fe('CacheRepository > deleteMany');
    }


    async exists<TQuery>(query: TQuery): Promise<boolean> {
        c.fs('CacheRepository > exits');
        const startTime = performance.now();

        const cachedData = await unstable_cache(
            async () => {
                const domain = await super.exists(query);
                console.log(`CACHE MISS: ${(performance.now() - startTime).toFixed(2)}ms`);
                return domain;
            },
            this.getCacheKey(JSON.stringify(query)),
            {
                tags: this.getCacheTags(JSON.stringify(query)),
                revalidate: 3600
            }
        )();

        console.log(`CACHE HIT: ${(performance.now() - startTime).toFixed(2)}ms`);

        return cachedData;
    }

}
