import ModelBase from "./ModelBase";

export default class LogError extends ModelBase{
    datetime:Date = null;
    detail:string = '';
    userId:string = '';
}