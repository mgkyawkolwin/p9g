import DomainBase from "./DomainBase";

export default class LogError extends DomainBase{
    datetime:Date = null;
    detail:string = '';
    userId:string = '';
}