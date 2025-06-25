import { PagerParams, SearchParam } from "@/lib/types";
import { SQL } from "drizzle-orm";

export default interface IRepository<TEntity> {

  create(data: Omit<TEntity, "id" | "createdAt" | "updatedAt">): Promise<TEntity>;

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
