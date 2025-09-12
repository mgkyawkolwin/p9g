export default interface IQueryObjectTranformer{
    orderBy<TResult>(orderBy: Record<string, any>): TResult;
    transform<TResult>(query: Record<string, any>) : Promise<TResult>;
}