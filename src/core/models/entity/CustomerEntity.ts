import EntityBase from "../../../lib/models/entity/EntityBase";

export default class Customer extends EntityBase {
    public address : string = '';
    public country: string = '';
    public dob: string = '';
    public email: string = '';
    public englishName: string = '';
    public gender: string = '';
    public isBlackListed: boolean = false;
    public isDeleted: boolean = false;
    public name: string = '';
    public nationalId: string = '';
    public passport: string = '';
    public phone: string = '';
    public remarks: string = '';
}