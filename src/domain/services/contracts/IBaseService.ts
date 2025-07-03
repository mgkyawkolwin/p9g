import { PagerParams, SearchParam } from "@/lib/types";
import { SQL } from "drizzle-orm";

export default interface IBaseService<TDomainModel, TEntity> {

  create(entity: Omit<TDomainModel, "id" | "createdAt" | "updatedAt">): Promise<TDomainModel>;

  findAll(pagerParams : PagerParams): Promise<TDomainModel[]>;

  findById(id: number): Promise<TDomainModel | null>;

  findOne(where?: SQL | undefined): Promise<TDomainModel | null>;

  findMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[TDomainModel[], PagerParams]>;

  update(
    id: string | number,
    data: Partial<Omit<TDomainModel, "id" | "createdAt" | "updatedAt">>
  ): Promise<TDomainModel>;

  delete(id: string | number): Promise<boolean>;
  
  exists(where?: SQL | undefined): Promise<boolean>;

}
