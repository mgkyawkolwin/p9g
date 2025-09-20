import DomainBase from "@/lib/models/domain/DomainBase";

export default class LogError extends DomainBase{
    datetime:Date = null;
    detail:string = '';
    userId:string = '';
}