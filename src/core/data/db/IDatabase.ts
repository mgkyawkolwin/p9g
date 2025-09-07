
// export type IDBType = MySql2Database<typeof schema>;
// export type ITransactionType = Parameters<Parameters<IDBType['transaction']>[0]>[0];

export interface IDatabase<T> {
    get db(): T ;
}