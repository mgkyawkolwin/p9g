//Ordered Imports
import { SQL, and, count, asc, desc, eq, gt, gte, inArray, lt, lte, or, like, Table, Column, getTableColumns, getTableName } from "drizzle-orm";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import { PagerParams, SearchParam, TYPES } from "@/lib/types";
import IBaseService from "./contracts/IBaseService";
import type IRepository from "@/data/repo/IRepository";
import c from "@/lib/core/logger/ConsoleLogger";


@injectable()
export abstract class BaseService<TDomainModel, TEntity> implements IBaseService<TDomainModel, TEntity> {
    protected readonly repository;

    constructor(
        repository: IRepository<TEntity>
    ) {
        this.repository = repository;
    }


    create(entity: TDomainModel): Promise<TDomainModel> {
        c.i("BaseService > Create");
        const newEntity = this.repository.create(entity as unknown as TEntity);
        const newDomainModel = newEntity as unknown as TDomainModel;
        return newDomainModel;
    }


    findAll(pagerParams: PagerParams): Promise<TDomainModel[]> {
        throw new Error("Method not implemented.");
    }


    findById(id: number): Promise<TDomainModel | null> {
        throw new Error("Method not implemented.");
    }


    findOne(where?: SQL | undefined): Promise<TDomainModel | null> {
        throw new Error("Method not implemented.");
    }


    findMany(searchParams: SearchParam[], pagerParams: PagerParams): Promise<[TDomainModel[], PagerParams]> {
        throw new Error("Method not implemented.");
    }


    update(id: string | number, data: Partial<Omit<TDomainModel, "id" | "createdAt" | "updatedAt">>): Promise<TDomainModel> {
        throw new Error("Method not implemented.");
    }


    delete(id: string | number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }


    exists(where?: SQL | undefined): Promise<boolean> {
        throw new Error("Method not implemented.");
    }


}
