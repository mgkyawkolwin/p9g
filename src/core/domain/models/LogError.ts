import IEntity from "@/core/data/repo/contracts/IEntity";

export default class LogError  implements IEntity{
    id:string;
    datetime:Date;
    detail:string;
    userId:string|undefined;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC!: Date;
    public updatedBy!: string;
}