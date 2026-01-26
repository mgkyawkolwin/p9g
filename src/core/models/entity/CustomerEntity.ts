import EntityBase from "../../../lib/models/entity/EntityBase";

export default class Customer extends EntityBase {
    public address : string = '';
    public remarks: string = '';
    public country: string = '';
    public dob: string = '';
    public email: string = '';
    public englishName: string = '';
    public gender: string = '';
    public name: string = '';
    public nationalId: string = '';
    public passport: string = '';
    public phone: string = '';
}