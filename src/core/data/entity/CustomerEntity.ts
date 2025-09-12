import IEntity from "@/core/data/entity/IEntity";
import EntityBase from "./EntityBase";

export default class Customer extends EntityBase {
    public address : string = '';
    public country: string = '';
    public dob: string = '';
    public email: string = '';
    public englishName: string = '';
    public name: string = '';
    public nationalId: string = '';
    public passport: string = '';
    public phone: string = '';
}