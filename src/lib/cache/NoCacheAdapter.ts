import ICacheAdapter from "./ICacheAdapter";

export default class NoCacheAdapter implements ICacheAdapter{

    async add(key: string, baseKey: string, object: any) : Promise<void>{

    }

    async clear() : Promise<void> {
        
    }

    async delete(key: string) : Promise<void>{

    }

    async deleteBase(key: string) : Promise<void>{

    }

    async get(key:string) : Promise<any>{
        return null;
    }
}