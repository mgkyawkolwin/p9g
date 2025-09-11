export default interface IQueryObjectTranformer{
    transform<TResult,T>(query: T) : Promise<TResult>;
}