import { PagerParams, SearchParam } from "@/lib/types";
import { SQL } from "drizzle-orm";
import { AnyMySqlSelectQueryBuilder, MySqlSelectQueryBuilder } from "drizzle-orm/mysql-core";

export default interface IRepository<TEntity> {

  applyCondition<T extends MySqlSelectQueryBuilder>(query: T, searchParams: SearchParam[]) : T;
  
  applyConditionAndPaging<T extends MySqlSelectQueryBuilder>(query: T, searchParams: SearchParam[], pagerParams: PagerParams) : T;

  applyPaging<T extends MySqlSelectQueryBuilder>(query: T, pagerParams: PagerParams) : T;

  create(data: Omit<TEntity, "id" | "createdAt" | "updatedAt">): Promise<TEntity>;

  findAll(pagerParams : PagerParams): Promise<TEntity[]>;

  findById(id: string): Promise<TEntity | null>;

  findOne(where?: SQL | undefined): Promise<TEntity | null>;

  findMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[TEntity[], PagerParams]>;

  update(
    id: string,
    data: Partial<Omit<TEntity, "id" | "createdAt" | "updatedAt">>
  ): Promise<TEntity>;

  delete(id: string): Promise<boolean>;
  
  exists(where?: SQL | undefined): Promise<boolean>;

}
