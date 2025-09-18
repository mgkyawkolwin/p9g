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
import { revalidateTag } from 'next/cache';


@injectable()
export class CacheRepository<TDomain extends IDomainModel, TEntity extends IEntity, TTable extends IDrizzleTable> extends Repository<TDomain, TEntity, TTable> {

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
    }

    private getCacheKey(id?: number): string[] {
        console.log('getcachekey');
        return id
            ? [`${this.table.id}-${id}`]
            : [`${this.table.id}-all`];
    }


    private getCacheTags(id?: number): string[] {
        console.log('getcachetags');
        return id
            ? [`${this.table.id}:${id}`, `${this.table.id}`]
            : [`${this.table.id}`];
    }

    async create<TTransaction extends ITransaction>(domain: TDomain, transaction?: TTransaction): Promise<TDomain> {
        c.fs("Repository > create");
        c.d(domain as any);

        if (!domain) throw new CustomError('Repository cannot create empty object.');

        c.i("Mapping to entity.");
        const entity = await this.mapper.mapAsync(domain, this.entityClass);
        c.d(entity);
        if (!entity) throw new CustomError('Entity mapping failed in repository');

        c.i('Inserting entity.');
        const query = this.dbClient.db.insert(this.table).values(entity).$returningId();
        let result;
        if (transaction)
            [result] = await transaction.execute(query);
        else
            [result] = await query;
        c.d(result)
        await Promise.all([
            revalidateTag(`${this.table.id}:${result.id}`),
            revalidateTag(`${this.table.id}`)
        ]);
        c.fe("Repository > create");
        return domain;
    }


    async createMany<TTransaction extends ITransaction>(domains: TDomain[], transaction?: TTransaction): Promise<void> {
        c.fs("Repository > createMany");
        c.d(domains);

        if (!domains || domains?.length == 0) throw new CustomError('Repository cannot create empty objects.');

        const entities: TEntity[] = [];
        for (const domain of domains) {
            entities.push(await this.mapper.mapAsync(domain, this.entityClass));
        }
        c.d(entities);
        if (!entities || entities?.length === 0) throw new CustomError('Entities mapping failed in repository');

        const query = this.dbClient.db.insert(this.table).values(entities);
        if (transaction)
            await transaction.execute(query);
        else
            await query;
        await Promise.all([
            revalidateTag(`${this.table.id}`)
        ]);
        c.fe("Repository > createMany");
    }


    async executeQuery<TTransaction extends ITransaction>(query: string, transaction?: TTransaction): Promise<TDomain[]> {
        c.fs('Repository > executeQuery');
        c.d(`query: ${query}`);
        const q = sql`${query}`;
        let entities;

        if (transaction)
            entities = await transaction.execute(q);
        else
            entities = await this.dbClient.db.execute(q);

        c.fe('Repository > executeQuery');
        const domains: TDomain[] = entities.map((entity: TEntity) => this.mapper.map(entity, this.domainClass));
        return domains;
    }


    async findAll(): Promise<TDomain[]> {
        c.fs('Repository > findAll');

        // Build base query
        let query = this.dbClient.db
            .select()
            .from(this.table);

        // Execute query
        const entities = await query;
        const domains: TDomain[] = [];
        for (const entity of entities) {
            domains.push(await this.mapper.mapAsync(entity, this.domainClass));
        }
        c.fe('Repository > findAll');
        return domains;
    }


    async findById<TIdType>(id: TIdType): Promise<TDomain | null> {
        c.fs('Repository > findById');
        c.d(`id: ${id}`);
        let cachestatus = 'CACHE HIT';
        const cachedData = await unstable_cache(
            async () => {
                cachestatus = 'CACHE MISS';
                return await super.findById(id);
            },
            this.getCacheKey(),
            {
                tags: this.getCacheTags(),
                revalidate: 10
            }
        )();

        return cachedData;
    }


    async findOne<TQuery>(query: TQuery): Promise<TDomain | null> {
        c.fs('Repository > findOne');
        if (!query) throw new CustomError('Condition is required to find one in repository.');

        const whereQuery = await this.transformer.transformAsync<SQL>(query as AnyCondition);
        if (!whereQuery) throw new CustomError('Query transformation failed in repository');

        let q = this.dbClient.db.select(this.defaultColumns).from(this.table)

        q = this.defaultJoin(q);

        q = q.where(whereQuery).limit(1);

        const [entity] = await q;

        if (!entity) return null;
        c.d(entity);
        const domain = await this.mapper.mapAsync(entity, this.domainClass) as TDomain;
        c.d(domain);
        c.fe('Repository > findOne');
        return domain;
    }


    async findMany<TQuery, TOrder>(query?: TQuery, sort?: TOrder, offset?: number, limit?: number): Promise<[TDomain[], number]> {
        c.fs('Repository > findMany');
        let dataQuery = this.dbClient.db.select(this.defaultColumns).from(this.table);
        let countQuery = this.dbClient.db.select({ count: count(this.table.id) }).from(this.table);

        dataQuery = this.defaultJoin(dataQuery);

        if (query) {
            const whereQuery = await this.transformer.transformAsync<SQL>(query as AnyCondition);
            console.log(whereQuery);
            if (whereQuery) {
                dataQuery = dataQuery.where(whereQuery);
                countQuery = countQuery.where(whereQuery);
            }
        }

        if (sort) {
            const orderBy = await this.transformer.transformAsync<SQL>(sort as AnyCondition);
            dataQuery = dataQuery.orderBy(orderBy);
        }

        if (offset) dataQuery = dataQuery.offset(offset);
        if (limit) dataQuery = dataQuery.limit(limit);
        c.d(dataQuery.toSQL());

        const [countResult, entities] = await Promise.all([
            countQuery.execute(),
            dataQuery.execute()
        ]);
        c.d(entities);
        const domains: TDomain[] = [];
        for (const entity of entities) {
            domains.push(await this.mapper.mapAsync(entity, this.domainClass));
        }
        c.fe('Repository > findMany');
        return [domains, countResult[0]?.count];
    }


    async update<TIdType, TTransaction extends ITransaction>(id: TIdType, entity: TDomain, transaction?: TTransaction): Promise<void> {
        c.fs('Reository > update');
        c.d(entity);
        super.update(id, entity, transaction);

        await Promise.all([
            revalidateTag(`${this.table.id}:${id}`),
            revalidateTag(`${this.table.id}`)
        ]);

        c.fe('Reository > update');
    }


    async delete<TIdType, TTransaction extends ITransaction>(id: TIdType, transaction?: TTransaction): Promise<void> {
        c.fs('Reository > delete');
        c.d(`Id: ${id}`);
        super.delete(id, transaction);

        await Promise.all([
            revalidateTag(`${this.table.id}:${id}`),
            revalidateTag(`${this.table.id}`)
        ]);

        c.fe('Reository > delete');
    }


    async deleteWhere<TQuery, TTransaction extends ITransaction>(query: TQuery, transaction?: TTransaction): Promise<void> {
        c.fs('Reository > deleteMany');

        const whereQuery = await this.transformer.transformAsync<SQL>(query as AnyCondition);
        const q = this.dbClient.db.delete(this.table).where(whereQuery);

        if (transaction)
            await transaction.execute(q);
        else
            await q.execute();
        c.fe('Reository > deleteMany');
    }


    async exists<TQuery>(query: TQuery): Promise<boolean> {
        c.fs('Reository > exits');
        if (!query) throw new CustomError('Condition is required.');
        const whereQuery = await this.transformer.transformAsync<SQL>(query as AnyCondition);
        const [entity] = await this.dbClient.db.select().from(this.table).where(whereQuery).limit(1);
        c.fe('Reository > exits');
        return !!entity;
    }

}
