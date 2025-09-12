import { PagerParams, SearchParam } from "@/core/lib/types";
import { SQL } from "drizzle-orm";
import { AnyMySqlSelectQueryBuilder, MySqlSelectQueryBuilder } from "drizzle-orm/mysql-core";
import ITransaction from "../../db/ITransaction";

export default interface IRepository<TDomain> {

  // applyCondition<T extends MySqlSelectQueryBuilder>(query: T, searchParams: SearchParam[]) : T;
  // applyConditionAndPaging<T extends MySqlSelectQueryBuilder>(query: T, searchParams: SearchParam[], pagerParams: PagerParams) : T;
  // applyPaging<T extends MySqlSelectQueryBuilder>(query: T, pagerParams: PagerParams) : T;
  create<TTransaction extends ITransaction>(entity: TDomain, transaction?:TTransaction): Promise<TDomain>;
  createMany<TTransaction extends ITransaction>(entity: TDomain[], transaction?:TTransaction): Promise<void>;
  delete<TIdType,TTransaction extends ITransaction>(id: TIdType, transaction?:TTransaction): Promise<void>;
  deleteMany<TCondition,TTransaction extends ITransaction>(condition: TCondition, transaction?:TTransaction): Promise<void>;
  exists<TCondition>(condition: TCondition): Promise<boolean>;
  findAll(): Promise<TDomain[]>;
  findById<TIdType>(id: TIdType): Promise<TDomain | null>;
  findOne<TCondition>(condition: TCondition): Promise<TDomain | null>;
  findMany<TCondition,TOrderBy>(condition?: TCondition, order?:TOrderBy, offset?:number, limit?:number): Promise<[TDomain[],number]> 
  // findMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[TEntity[], PagerParams]>;
  update<TIdType, TTransaction extends ITransaction>(id: TIdType, entity: TDomain, transaction?:TTransaction): Promise<void>;
  

}
