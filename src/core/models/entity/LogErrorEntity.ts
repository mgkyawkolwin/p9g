import IEntity from "@/core/data/entity/IEntity";
import EntityBase from "../../../lib/models/entity/EntityBase";

export default class LogErrorEntity extends EntityBase{
    datetime:Date = null;
    detail:string = '';
    userId:string = '';
}