import { AnyCondition } from "./types";

export default interface IQueryTranformer{
    transform<TResult>(query: AnyCondition) : TResult;
    transformAsync<TResult>(query: AnyCondition) : Promise<TResult>;
}