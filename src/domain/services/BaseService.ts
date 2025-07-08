//Ordered Imports
import { SQL, and, count, asc, desc, eq, gt, gte, inArray, lt, lte, or, like, Table, Column, getTableColumns, getTableName } from "drizzle-orm";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import { PagerParams, SearchParam, TYPES } from "@/lib/types";
import IBaseService from "./contracts/IBaseService";
import type IRepository from "@/data/repo/IRepository";
import c from "@/lib/core/logger/ConsoleLogger";


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
