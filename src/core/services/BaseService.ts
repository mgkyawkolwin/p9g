//Ordered Imports
import { SQL } from "drizzle-orm";
import { injectable } from "inversify";
import "reflect-metadata";
import { PagerParams, SearchParam } from "@/lib/types";
import IBaseService from "./contracts/IBaseService";
import type IRepository from "@/core/data/repo/contracts/IRepository";


@injectable()
export abstract class BaseService<TEntity> implements IBaseService<TEntity> {
    protected readonly repository;

    constructor(
        repository: IRepository<TEntity>
    ) {
        this.repository = repository;
    }


    create(entity: TEntity): Promise<TEntity> {
        throw new Error("Method not implemented.");
    }


    findAll(pagerParams: PagerParams): Promise<TEntity[]> {
        throw new Error("Method not implemented.");
    }


    findById(id: number): Promise<TEntity | null> {
        throw new Error("Method not implemented.");
    }


    findOne(where?: SQL | undefined): Promise<TEntity | null> {
        throw new Error("Method not implemented.");
    }


    findMany(searchParams: SearchParam[], pagerParams: PagerParams): Promise<[TEntity[], PagerParams]> {
        throw new Error("Method not implemented.");
    }


    update(id: string | number, data: Partial<Omit<TEntity, "id" | "createdAt" | "updatedAt">>): Promise<TEntity> {
        throw new Error("Method not implemented.");
    }


    delete(id: string | number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }


    exists(where?: SQL | undefined): Promise<boolean> {
        throw new Error("Method not implemented.");
    }


}
