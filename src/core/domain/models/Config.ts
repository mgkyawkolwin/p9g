import IEntity from "@/core/data/repo/contracts/IEntity";

export default class Config implements IEntity {
    public id : string | undefined;
    public group: string | undefined;
    public value: string | undefined;
    public text: string | undefined;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC?: Date;
    public updatedBy?: string;
}