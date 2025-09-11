import IEntity from "@/core/data/repo/contracts/IEntity";

export default class Customer implements IEntity {
    public id : string = '';
    public address : string = '';
    public country: string = '';
    public dob: string = '';
    public email: string = '';
    public englishName: string = '';
    public name: string = '';
    public nationalId: string = '';
    public passport: string = '';
    public phone: string = '';
    public createdAtUTC: Date = undefined;
    public createdBy: string = '';
    public updatedAtUTC: Date = undefined;
    public updatedBy: string = '';
}