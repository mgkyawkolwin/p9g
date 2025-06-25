//Ordered Imports
import { SQL, and,  count, asc, desc, eq, gt, gte, inArray, lt, lte, or, like, Table, Column, getTableColumns } from "drizzle-orm";
import { MySqlColumn, MySqlTable, MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import { MySqlQueryResultHKT } from "drizzle-orm/mysql-core";
import { MySqlTransaction } from "drizzle-orm/mysql-core";
import { db, type DBType, type TransactionType } from "@/data/orm/drizzle/mysql/db";
import { inject, injectable } from "inversify";
import "reflect-metadata";

//Local Imports
import IRepository from "../IRepository";
import { PagerParams, SearchParam, TYPES } from "@/lib/types";
import { type IDatabase } from "@/data/db/IDatabase";
import IDrizzleTable from "@/data/repo/drizzle/IDrizzleTable";
import consoleLogger from "@/lib/core/logger/ConsoleLogger";
import { pages } from "next/dist/build/templates/app-page";
import { user } from "@/data/orm/drizzle/mysql/schema";
import { pagerWithDefaults } from "@/lib/utils";


@injectable()
export abstract class Repository<TEntity, TTable extends  IDrizzleTable> implements IRepository<TEntity> {
  protected readonly dbClient: IDatabase<any>;
  protected readonly table: TTable;

  constructor(
    dbClient: IDatabase<any>,
    table: TTable
  ) {
    this.dbClient = dbClient;
    this.table = table;;
  }

  async create(data: Omit<TEntity, "id" | "createdAt" | "updatedAt">): Promise<TEntity> {
    const result = await this.dbClient.db.insert(this.table).values(data as any);
    // For MySQL, we need to fetch the inserted record separately
    const [record] = await this.dbClient.db.select()
      .from(this.table)
      .where(eq(this.table.id as Column, result[0].insertId))
      .limit(1);
    return record as TEntity;
  }


  async findAll(pagerParams : PagerParams): Promise<TEntity[]> {
    consoleLogger.logInfo('Repository > findAll');
    consoleLogger.logDebug(JSON.stringify(pagerParams));
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
    consoleLogger.logInfo('Repository > findMany');
    consoleLogger.logDebug(JSON.stringify(searchParams));
    consoleLogger.logDebug(JSON.stringify(pagerParams));

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
    if (searchParams.length > 0) {
      consoleLogger.logInfo('Where applied.');
      searchParams.forEach((searchParam : SearchParam) => {
        const condition = like(getTableColumns(this.table)[searchParam.searchColumn], `%${searchParam.searchValue}`);
        countQuery = countQuery.where(condition);
        dataQuery = dataQuery.where(condition);
      });
    }

    const [countResult, dataResult] = await Promise.all([
      countQuery.execute(),
      dataQuery.execute()
    ]);

    //calculate number of pages
    const pages = Math.ceil(countResult[0].count / pagerParams.pageSize);
    consoleLogger.logDebug(countResult[0]);

    // Execute query
    return [dataResult as TEntity[], {...pagerParams, pages: pages}];
  }


  async update(
    id: string | number,
    data: Partial<Omit<TEntity, "id" | "createdAt" | "updatedAt">>
  ): Promise<TEntity> {
    await this.dbClient.db.update(this.table)
      .set(data as any)
      .where(eq(this.table.id as Column, id));
    // For MySQL, we need to fetch the updated record separately
    const [record] = await this.dbClient.db.select()
      .from(this.table)
      .where(eq(this.table.id as Column, id))
      .limit(1);
    return record as TEntity;
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
