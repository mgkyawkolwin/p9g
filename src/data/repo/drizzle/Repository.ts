//Ordered Imports
import { SQL, and,  count, asc, desc, eq, gt, gte, inArray, lt, lte, or, like, Table, Column, getTableColumns, getTableName } from "drizzle-orm";
import { AnyMySqlSelectQueryBuilder, MySqlColumn, MySqlSelectQueryBuilder, MySqlTable, MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import { MySqlQueryResultHKT } from "drizzle-orm/mysql-core";
import { MySqlTransaction } from "drizzle-orm/mysql-core";
import { db, type DBType, type TransactionType } from "@/data/orm/drizzle/mysql/db";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import {auth} from "@/app/auth";
import IRepository from "../contracts/IRepository";
import { PagerParams, SearchParam, TYPES } from "@/lib/types";
import { type IDatabase } from "@/data/db/IDatabase";
import IDrizzleTable from "@/data/repo/drizzle/IDrizzleTable";
import c from "@/lib/core/logger/ConsoleLogger";
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
        const condition = like(getTableColumns(this.table)[searchParam.searchColumn], `%${searchParam.searchValue}%`);
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
    const session = await auth();
    c.i("Repository > Create");
    c.d(data as any);
    data.createdBy = session.user.id;
    data.updatedBy = session.user.id;
    // data.updatedAtUTC = new Date();
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
    c.i("Returning result from Repository > create.");
    return record as TEntity;
  }


  async findAll(pagerParams : PagerParams): Promise<TEntity[]> {
    c.i('Repository > findAll');
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


  async findById(id: number): Promise<TEntity | null> {
    const [record] = await this.dbClient.db
      .select()
      .from(this.table)
      .where(eq(this.table.id as Column, id))
      .limit(1);
    return (record as TEntity) ?? null;
  }


  async findOne(where?: SQL | undefined): Promise<TEntity | null> {
    const [record] = await this.dbClient.db.select().from(this.table).where(where).limit(1);
    return (record as TEntity) ?? null;
  }


  async findMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[TEntity[], PagerParams]> {
    c.i('Repository > findMany');
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

    //Add search condition if parameters provided
    // if (searchParams && searchParams.length > 0) {
    //   c.i('Where applied.');
    //   searchParams.forEach((searchParam : SearchParam) => {
    //     const condition = like(getTableColumns(this.table)[searchParam.searchColumn], `%${searchParam.searchValue}%`);
    //     countQuery = countQuery.where(condition);
    //     dataQuery = dataQuery.where(condition);
    //   });
    // }
    countQuery = this.applyConditionAndPaging(countQuery, searchParams, pagerParams);
    dataQuery = this.applyConditionAndPaging(dataQuery, searchParams, pagerParams);

    const [countResult, dataResult] = await Promise.all([
      countQuery.execute(),
      dataQuery.execute()
    ]);

    //calculate number of pages
    const pages = Math.ceil(countResult[0].count / pagerParams.pageSize);
    c.d(countResult[0]);

    c.i('Return result from Repository > findManay')
    // Execute query
    return [dataResult as TEntity[], {...pagerParams, pages: pages}];
  }


  async update(
    id: string,
    data: Partial<Omit<TEntity, "id" | "createdAt" | "updatedAt">>
  ): Promise<TEntity> {
    c.i('Reository > Update');
    c.d(String(id));
    c.d(data);
    const session = await auth();
    data.updatedBy = session.user.id;
    const query = this.dbClient.db.update(this.table)
      .set(data as any)
      .where(eq(this.table.id as Column, id));
    c.d(query.toSQL());
    await query;
    return data as TEntity;
  }


  async delete(id: string | number): Promise<boolean> {
    await this.dbClient.db.delete(this.table).where(eq(this.table._.columns.id as MySqlColumn, id));
    const [record] = await this.dbClient.db
      .select()
      .from(this.table)
      .where(eq(this.table.id as Column, id))
      .limit(1);
    return record ? false : true;
  }


  async exists(where?: SQL | undefined): Promise<boolean> {
    const [record] = await this.dbClient.db.select().from(this.table).where(where).limit(1);
    return !!record;
  }

}
