import ICacheAdapter from "../ICacheAdapter";
import { LRUCache } from "next/dist/server/lib/lru-cache";

export default class LruCacheAdapter implements ICacheAdapter{

    protected readonly cache : LRUCache<unknown>;
    protected keyMap : Array<{baseKey:string, key:string}>;

    constructor(maxSize: number){
        this.cache = new LRUCache(maxSize);
        this.keyMap = [];
    }

    async add(key: string, baseKey: string, object: any) : Promise<void>{
        console.log(`CACHE: Adding to cache key:${key} baseKey:${baseKey}`);
        this.cache.set(key, object);
        this.keyMap.push({baseKey, key});
        this.keyMap.forEach(key => {
            console.log(`baseKey:${key.baseKey} key:${key.key}`);
        });
    }

    async clear() : Promise<void> {
        console.log(`CACHE: Clearing all caches`);
        this.cache.clear();
        this.cache.reset();
        this.keyMap = [];
    }

    async delete(key: string) : Promise<void>{
        console.log(`CACHE: Remove from cache key: ${key}`);
        this.cache.remove(key);
        this.keyMap = this.keyMap.filter(k => k.key !== key);
    }

    async deleteBase(baseKey: string) : Promise<void>{
        console.log(`CACHE: Deleting Base baseKey: ${baseKey}`);
        this.keyMap.forEach(key => {
            console.log(`baseKey:${key.baseKey} key:${key.key}`);
            if(baseKey === key.baseKey){
                console.log(`CACHE: Remove from cache key: ${key.key}`);
                this.cache.remove(key.key);
            }
        });

        console.log(`CACHE: Remove from cache baseKey: ${baseKey}`);
        this.cache.remove(baseKey);
        this.keyMap = this.keyMap.filter(k => k.baseKey !== baseKey);
    }

    async get(key:string) : Promise<any>{
        console.log(`CACHE: Retrieving from cache key: ${key}`);
        this.keyMap.forEach(key => {
            console.log(`baseKey:${key.baseKey} key:${key.key}`);
        });
        return this.cache.get(key);
    }

}