//Ordered Imports
import { SQL, and,  count, asc, desc, eq, gt, gte, inArray, lt, lte, or, like, Table, Column, getTableColumns, getTableName } from "drizzle-orm";
import { AnyMySqlSelectQueryBuilder, MySqlColumn, MySqlSelectQueryBuilder, MySqlTable, MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import { MySqlQueryResultHKT } from "drizzle-orm/mysql-core";
import { MySqlTransaction } from "drizzle-orm/mysql-core";
import { db, type DBType, type TransactionType } from "@/core/data/orm/drizzle/mysql/db";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import {auth} from "@/app/auth";
import IRepository from "../contracts/IRepository";
import { PagerParams, SearchParam, TYPES } from "@/core/lib/types";
import { type IDatabase } from "@/core/data/db/IDatabase";
import IDrizzleTable from "@/core/data/repo/drizzle/IDrizzleTable";
import c from "@/core/logger/console/ConsoleLogger";
import IEntity from "../contracts/IEntity";


@injectable()
export abstract class Repository<TEntity extends IEntity, TTable extends  IDrizzleTable> implements IRepository<TEntity> {
  protected readonly dbClient: IDatabase<any>;
  protected readonly table: TTable;

  constructor(
    dbClient: IDatabase<any>,
    table: TTable
  ) {
    this.dbClient = dbClient;
    this.table = table;
  }


  applyCondition<T extends MySqlSelectQueryBuilder>(query: T, searchParams: SearchParam[]) : T{
    if (searchParams && searchParams.length > 0) {
      searchParams.forEach((searchParam : SearchParam) => {
        let condition 
        if(searchParam.searchColumn === 'name'){
          condition = or(
            like(getTableColumns(this.table)[searchParam.searchColumn], `%${searchParam.searchValue}%`),
            like(getTableColumns(this.table)['englishName'], `%${searchParam.searchValue}%`)
          )
        }else{
          condition = like(getTableColumns(this.table)[searchParam.searchColumn], `%${searchParam.searchValue}%`)
        }

        like(getTableColumns(this.table)[searchParam.searchColumn], `%${searchParam.searchValue}%`);
        return query.where(condition);
      });
    }
    return query;
  }


  applyConditionAndPaging<T extends MySqlSelectQueryBuilder>(query: T, searchParams: SearchParam[], pagerParams: PagerParams) : T{
    query = this.applyCondition(query, searchParams);
    query = this.applyPaging(query, pagerParams);
    return query;
  }


  applyPaging<T extends MySqlSelectQueryBuilder>(query: T, pagerParams: PagerParams) : T{
    if(pagerParams.orderDirection === 'desc')
      query = query.orderBy(desc(getTableColumns(this.table)[pagerParams.orderBy]));
    else
      query = query.orderBy(asc(getTableColumns(this.table)[pagerParams.orderBy]));

    query.limit(pagerParams.pageSize);
    query.offset((pagerParams.pageIndex - 1) * pagerParams.pageSize);

    return query;
  }


  async create(data: TEntity): Promise<TEntity> {
    c.fs("Repository > create");
    const session = await auth();
    c.d(data as any);
    c.i("Inserting new entity.");
    const [insertedResult] = await this.dbClient.db.insert(this.table).values(data as TEntity).$returningId();
    c.i("Entity inserted.");
    c.d(insertedResult);
    c.i("Retrieving newly inserted entity.");
    const [record] = await this.dbClient.db.select()
      .from(this.table)
      .where(eq(this.table.id as Column, insertedResult.id))
      .limit(1);
    c.d(record);
    c.fe("Repository > create");
    return record as TEntity;
  }


  async findAll(pagerParams : PagerParams): Promise<TEntity[]> {
    c.fs('Repository > findAll');
    c.d(JSON.stringify(pagerParams));
    // Calculate offset
    const offset = (pagerParams.pageIndex - 1) * pagerParams.pageSize;

    // Build base query
    let query = this.dbClient.db
      .select()
      .from(this.table)
      .orderBy(pagerParams.orderBy, pagerParams.orderDirection)
      .limit(pagerParams.pageSize)
      .offset(offset);

    // Execute query
    const records = await query;
    return records as TEntity[];
  }


  async findById(id: string): Promise<TEntity | null> {
    const [record] = await this.dbClient.db
      .select()
      .from(this.table)
      .where(eq(this.table.id as Column, id))
      .limit(1);
    
    c.fe('Repository > findAll');
    return (record as TEntity) ?? null;
  }


  async findOne(where?: SQL | undefined): Promise<TEntity | null> {
    c.fs('Repository > findOne');
    const [record] = await this.dbClient.db.select().from(this.table).where(where).limit(1);
    c.fe('Repository > findOne');
    return (record as TEntity) ?? null;
  }


  async findManyByCondition(rootCondition?: SQL, sort?:SQL, limit?:number): Promise<TEntity[]> {
    c.fs('Repository > findManyByCondition');
    let query = this.dbClient.db.select().from(this.table);
    if(rootCondition)
      query = query.where(rootCondition);
    if(sort)
      query = query.orderBy(sort);
    if(limit)
      query = query.limit(limit);

    const records = await query;

    c.fe('Repository > findManyByCondition');
    return records as TEntity[];
  }


  async findMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[TEntity[], PagerParams]> {
    c.fs('Repository > findMany');
    c.d(JSON.stringify(searchParams));
    c.d(JSON.stringify(pagerParams));

    // Calculate offset
    const offset = (pagerParams.pageIndex - 1) * pagerParams.pageSize;

    // Build result query
    let countQuery = this.dbClient.db
      .select({count: count(this.table.id)})
      .from(this.table)

      // Build result query
    let dataQuery = this.dbClient.db
    .select()
    .from(this.table)
    .orderBy(pagerParams.orderDirection === 'desc' 
      ? desc(getTableColumns(this.table)[pagerParams.orderBy]) 
      : asc(getTableColumns(this.table)[pagerParams.orderBy]))
    .limit(pagerParams.pageSize)
    .offset(offset);
    
    countQuery = this.applyCondition(countQuery, searchParams);
    dataQuery = this.applyConditionAndPaging(dataQuery, searchParams, pagerParams);

    const [countResult, dataResult] = await Promise.all([
      countQuery.execute(),
      dataQuery.execute()
    ]);

    //calculate number of pages
    const pages = Math.ceil(countResult[0].count / pagerParams.pageSize);
    c.d(countResult[0]);

    c.fe('Repository > findMany');
    return [dataResult as TEntity[], {...pagerParams, pages: pages}];
  }


  async update(id: string, data: Partial<Omit<TEntity, "id" | "createdAt" | "updatedAt">>
  ): Promise<TEntity> {
    c.fs('Reository > update');
    c.d(String(id));
    c.d(data);
    const query = this.dbClient.db.update(this.table)
      .set(data as any)
      .where(eq(this.table.id as Column, id));
    c.d(query.toSQL());
    await query.execute();

    c.fe('Reository > update');
    return data as TEntity;
  }


  async delete(id: string): Promise<boolean> {
    c.fs('Reository > delete');
    await this.dbClient.db.delete(this.table).where(eq(this.table._.columns.id as MySqlColumn, id));
    const [record] = await this.dbClient.db
      .select()
      .from(this.table)
      .where(eq(this.table.id as Column, id))
      .limit(1);

    c.fe('Reository > delete');
    return record ? false : true;
  }


  async exists(where?: SQL | undefined): Promise<boolean> {
    c.fs('Reository > exits');
    const [record] = await this.dbClient.db.select().from(this.table).where(where).limit(1);
    c.fe('Reository > exits');
    return !!record;
  }

}
