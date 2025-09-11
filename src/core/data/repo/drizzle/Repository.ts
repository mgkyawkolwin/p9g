//Ordered Imports
import { SQL, and,  count, asc, desc, eq, gt, gte, inArray, lt, lte, or, like, Table, Column, getTableColumns, getTableName } from "drizzle-orm";
import { AnyMySqlSelectQueryBuilder, MySqlColumn, MySqlSelectQueryBuilder, MySqlTable, MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import IRepository from "../contracts/IRepository";
import { type IDatabaseClient } from "@/core/data/db/IDatabase";
import IDrizzleTable from "@/core/data/repo/drizzle/IDrizzleTable";
import c from "@/core/loggers/console/ConsoleLogger";
import IEntity from "../contracts/IEntity";
import { CustomError } from "@/core/lib/errors";
import ITransaction from "../../db/ITransaction";
import type IMapper from "@/core/lib/mappers/IMapper";
import { TYPES } from "@/core/lib/types";


@injectable()
export class Repository<TDomain extends IEntity, TEntity extends IEntity, TTable extends  IDrizzleTable, TDomainClass extends new () => TDomain, TEntityClass extends new () => TEntity> implements IRepository<TDomain> {
  //protected readonly table: TTable;

  constructor(
    protected readonly dbClient: IDatabaseClient<any>,
    protected readonly table: TTable,
    protected readonly mapper: IMapper,
    protected readonly domainClass : TDomainClass,
    protected readonly entityClass : TEntityClass
  ) {
    
  }


  // applyCondition<T extends MySqlSelectQueryBuilder>(query: T, searchParams: SearchParam[]) : T{
  //   if (searchParams && searchParams.length > 0) {
  //     searchParams.forEach((searchParam : SearchParam) => {
  //       let condition 
  //       if(searchParam.searchColumn === 'name'){
  //         condition = or(
  //           like(getTableColumns(this.table)[searchParam.searchColumn], `%${searchParam.searchValue}%`),
  //           like(getTableColumns(this.table)['englishName'], `%${searchParam.searchValue}%`)
  //         )
  //       }else{
  //         condition = like(getTableColumns(this.table)[searchParam.searchColumn], `%${searchParam.searchValue}%`)
  //       }

  //       like(getTableColumns(this.table)[searchParam.searchColumn], `%${searchParam.searchValue}%`);
  //       return query.where(condition);
  //     });
  //   }
  //   return query;
  // }


  // applyConditionAndPaging<T extends MySqlSelectQueryBuilder>(query: T, searchParams: SearchParam[], pagerParams: PagerParams) : T{
  //   query = this.applyCondition(query, searchParams);
  //   query = this.applyPaging(query, pagerParams);
  //   return query;
  // }


  // applyPaging<T extends MySqlSelectQueryBuilder>(query: T, pagerParams: PagerParams) : T{
  //   if(pagerParams.orderDirection === 'desc')
  //     query = query.orderBy(desc(getTableColumns(this.table)[pagerParams.orderBy]));
  //   else
  //     query = query.orderBy(asc(getTableColumns(this.table)[pagerParams.orderBy]));

  //   query.limit(pagerParams.pageSize);
  //   query.offset((pagerParams.pageIndex - 1) * pagerParams.pageSize);

  //   return query;
  // }


  async create<TTransaction extends ITransaction>(domain: TDomain, transaction?:TTransaction): Promise<TDomain> {
    c.fs("Repository > create");
    c.d(domain as any);
    c.i("Inserting new entity.");
    const entity = await this.mapper.map(domain, this.entityClass);
    const query =  this.dbClient.db.insert(this.table).values(entity).$returningId();
    let result;
    if(transaction)
      [result] = await transaction.execute(query);
    else
      [result] = await query;
    domain.id = result.id;
    c.fe("Repository > create");
    return domain;
  }


  async findAll(): Promise<TDomain[]> {
    c.fs('Repository > findAll');

    // Build base query
    let query = this.dbClient.db
      .select()
      .from(this.table);

    // Execute query
    const entities = await query;
    const domains : TDomain[] = entities.map((e:TEntity) => this.mapper.map(e, this.domainClass));
    return domains;
  }


  async findById<TIdType>(id: TIdType): Promise<TDomain | null> {
    c.fs('Repository > findById');
    const [entity] = await this.dbClient.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    if(!entity) return null;
    
    c.fe('Repository > findById');
    return this.mapper.map(entity, this.domainClass);
  }


  async findOne<TCondition>(where: TCondition): Promise<TDomain | null> {
    c.fs('Repository > findOne');
    if(!where) throw new CustomError('Condtion is required.');
    const [entity] = await this.dbClient.db.select().from(this.table).where(where).limit(1);
    c.fe('Repository > findOne');
    if(!entity) return null;
    return await this.mapper.map(entity, this.domainClass) as TDomain;
  }


  async findMany<TCondition,TOrderBy>(condition?: TCondition, sort?:TOrderBy, offset?:number, limit?:number): Promise<[TDomain[],number]> {
    c.fs('Repository > findMany');
    let dataQuery = this.dbClient.db.select().from(this.table);
    let countQuery = this.dbClient.db.select({count: count(this.table.id)}).from(this.table);
    if(condition) {
      dataQuery = dataQuery.where(condition);
      countQuery = countQuery.where(condition);
    }
    
    if(sort) dataQuery = dataQuery.orderBy(sort);
    if(offset) dataQuery = dataQuery.offset(offset);
    if(limit) dataQuery = dataQuery.limit(limit);
    c.d(dataQuery.toSQL());

    const [countResult, dataResult] = await Promise.all([
      countQuery.execute(),
      dataQuery.execute()
    ]);
c.d(dataResult);
    c.fe('Repository > findMany');
    return [dataResult as TDomain[], countResult[0]?.count];
  }


  // async findMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[TEntity[], PagerParams]> {
  //   c.fs('Repository > findMany');
  //   c.d(JSON.stringify(searchParams));
  //   c.d(JSON.stringify(pagerParams));

  //   // Calculate offset
  //   const offset = (pagerParams.pageIndex - 1) * pagerParams.pageSize;

  //   // Build result query
  //   let countQuery = this.dbClient.db
  //     .select({count: count(this.table.id)})
  //     .from(this.table)

  //     // Build result query
  //   let dataQuery = this.dbClient.db
  //   .select()
  //   .from(this.table)
  //   .orderBy(pagerParams.orderDirection === 'desc' 
  //     ? desc(getTableColumns(this.table)[pagerParams.orderBy]) 
  //     : asc(getTableColumns(this.table)[pagerParams.orderBy]))
  //   .limit(pagerParams.pageSize)
  //   .offset(offset);
    
  //   countQuery = this.applyCondition(countQuery, searchParams);
  //   dataQuery = this.applyConditionAndPaging(dataQuery, searchParams, pagerParams);

  //   const [countResult, dataResult] = await Promise.all([
  //     countQuery.execute(),
  //     dataQuery.execute()
  //   ]);

  //   //calculate number of pages
  //   const pages = Math.ceil(countResult[0].count / pagerParams.pageSize);
  //   c.d(countResult[0]);

  //   c.fe('Repository > findMany');
  //   return [dataResult as TEntity[], {...pagerParams, pages: pages}];
  // }


  async update<TIdType, TTransaction extends ITransaction>(id:TIdType, entity: TDomain, transaction?: TTransaction): Promise<void> {
    c.fs('Reository > update');
    c.d(entity);
    const query = this.dbClient.db.update(this.table)
      .set(entity as any)
      .where(eq(this.table.id, id));
    c.d(query.toSQL());

    if(transaction)
      await transaction.execute(query);
    else
      await query.execute();

    c.fe('Reository > update');
    // return data as TEntity;
  }


  async delete<TIdType, TTransaction extends ITransaction>(id: TIdType, transaction?: TTransaction): Promise<void> {
    c.fs('Reository > delete');
    const query = this.dbClient.db.delete(this.table).where(eq(this.table.id, id));

    if(transaction)
      await transaction.execute(query);
    else
      await query.execute();
    c.fe('Reository > delete');
  }


  async exists<TCondition>(condition: TCondition): Promise<boolean> {
    c.fs('Reository > exits');
    if(!condition) throw new CustomError('Condition is required.');
    const [entity] = await this.dbClient.db.select().from(this.table).where(condition).limit(1);
    c.fe('Reository > exits');
    return !!entity;
  }

}
