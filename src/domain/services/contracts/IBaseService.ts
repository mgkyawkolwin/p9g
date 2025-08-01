import { PagerParams, SearchParam } from "@/lib/types";
import { SQL } from "drizzle-orm";
import { AnyMySqlSelectQueryBuilder, MySqlSelectQueryBuilder } from "drizzle-orm/mysql-core";

export default interface IBaseService<TEntity> {

<<<<<<<< HEAD:src/domain/services/contracts/IBaseService.ts
  create(entity: Omit<TEntity, "id" | "createdAt" | "updatedAt">): Promise<TEntity>;
========
  applyCondition<T extends MySqlSelectQueryBuilder>(query: T, searchParams: SearchParam[]) : T;
  
  applyConditionAndPaging<T extends MySqlSelectQueryBuilder>(query: T, searchParams: SearchParam[], pagerParams: PagerParams) : T;

  applyPaging<T extends MySqlSelectQueryBuilder>(query: T, pagerParams: PagerParams) : T;

  create(data: Omit<TEntity, "id" | "createdAt" | "updatedAt">): Promise<TEntity>;
>>>>>>>> develop:src/data/repo/IRepository.ts

  findAll(pagerParams : PagerParams): Promise<TEntity[]>;

  findById(id: number): Promise<TEntity | null>;

  findOne(where?: SQL | undefined): Promise<TEntity | null>;

  findMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[TEntity[], PagerParams]>;

  update(
    id: string | number,
    data: Partial<Omit<TEntity, "id" | "createdAt" | "updatedAt">>
  ): Promise<TEntity>;

  delete(id: string | number): Promise<boolean>;
  
  exists(where?: SQL | undefined): Promise<boolean>;

}
