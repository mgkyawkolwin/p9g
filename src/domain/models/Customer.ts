import IEntity from "@/data/repo/IEntity";

export default class Customer implements IEntity {
    public id!: string;
    public address?: string | undefined;
    public country?: string | undefined;
    public dob?: string | undefined;
    public email?: string | undefined;
    public name!: string | undefined;
    public nationalId?: string | undefined;
    public passport?: string | undefined;
    public phone?: string | undefined;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC?: Date;
    public updatedBy?: string;
}