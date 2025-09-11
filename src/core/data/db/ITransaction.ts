export default interface ITransaction {
    execute<TQuery,TResult>(query:TQuery) : Promise<TResult>;
    // execute<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}