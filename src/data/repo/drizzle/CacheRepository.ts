import { SQL, and, asc, desc, eq, gt, gte, inArray, lt, lte, or } from "drizzle-orm";
import { MySqlColumn, MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import "reflect-metadata";
import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';

import IRepository from "../IRepository";
import { Repository } from "./Repository";

//TO DO: to use dependency injection to be able to inject differet types of db repo
// TO DO: to use configuration to switch repo and db

export class CacheRepository<TEntity, TTable extends MySqlTableWithColumns<any>> 
  extends Repository<TEntity, TTable> implements IRepository<TEntity> {

  private getCacheKey(id?: number): string[] {console.log('getcachekey');
    return id 
      ? [`${this.table.name}-${id}`] 
      : [`${this.table.name}-all`];
  }

  private getCacheTags(id?: number): string[] {console.log('getcachetags');
    return id 
      ? [`${this.table.name}:${id}`, `${this.table.name}`] 
      : [`${this.table.name}`];
  }

  async findAll(): Promise<TEntity[]> {
    try{
        let cachestatus = 'CACHE HIT';console.log('haha');
    const cachedData = await unstable_cache(
      async () => {
        cachestatus = 'CACHE MISS';console.log('hoho');
        return super.findAll();
    },
      this.getCacheKey(),
      { 
        tags: this.getCacheTags(),
        revalidate: 10
      }
    )();
    console.log(cachestatus);
    
    return cachedData;
    }catch(error){
        throw error;
    }
    return [];
  }

  async create(data: Omit<TEntity, "id" | "createdAt" | "updatedAt">): Promise<TEntity> {
    const result = await this.dbClient.db.insert(this.table).values(data as any);
    // For MySQL, we need to fetch the inserted record separately
    const [record] = await this.dbClient.db.select()
      .from(this.table)
      .where(eq(this.table.id as MySqlColumn, result[0].insertId))
      .limit(1);
      await Promise.all([
        revalidateTag(`${this.table.name}:${result.id}`),
        revalidateTag(`${this.table.name}`)
      ]);
    return record as TEntity;
}

    async findById(id: number): Promise<TEntity | null> {
        const [record] = await this.dbClient.db
            .select()
            .from(this.table)
            .where(eq(this.table.id as MySqlColumn, id))
            .limit(1);
        return (record as TEntity) ?? null;
    }

    async findOne(where?: SQL | undefined): Promise<TEntity | null> {
    const [record] = await this.dbClient.db.select().from(this.table).where(where).limit(1);
    return (record as TEntity) ?? null;
    }

    async findMany(where?: SQL | undefined): Promise<TEntity[]> {
    const records = await this.dbClient.db.select().from(this.table).where(where);
    return records as TEntity[];
    }

    async update(
        id: string | number,
        data: Partial<Omit<TEntity, "id" | "createdAt" | "updatedAt">>
    ): Promise<TEntity> {
        await this.dbClient.db.update(this.table)
        .set(data as any)
        .where(eq(this.table.id as MySqlColumn, id));
        // For MySQL, we need to fetch the updated record separately
        const [record] = await this.dbClient.db.select()
        .from(this.table)
        .where(eq(this.table.id as MySqlColumn, id))
        .limit(1);
        await Promise.all([
            revalidateTag(`${this.table.name}:${id}`),
            revalidateTag(`${this.table.name}`)
          ]);
        return record as TEntity;
    }

    async delete(id: string | number): Promise<boolean> {
    await this.dbClient.db.delete(this.table).where(eq(this.table.id as MySqlColumn, id));
    const [record] = await this.dbClient.db
        .select()
        .from(this.table)
        .where(eq(this.table.id as MySqlColumn, id))
        .limit(1);
        await Promise.all([
            revalidateTag(`${this.table.name}:${id}`),
            revalidateTag(`${this.table.name}`)
          ]);
    return record ? false : true;
    }

    async exists(where?: SQL | undefined): Promise<boolean> {
    const [record] = await this.dbClient.db.select().from(this.table).where(where).limit(1);
    return !!record;
    }
}