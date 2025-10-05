export default interface ICacheAdapter {
    add(key: string, baseKey: string, object: any): Promise<void>;
    clear(): Promise<void>;
    delete(key: string): Promise<void>;
    deleteBase(key: string): Promise<void>;
    get(key: string): Promise<any>;
}