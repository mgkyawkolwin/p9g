import DomainBase from "@/lib/models/domain/DomainBase";

export default class Customer extends DomainBase {
    public address: string = '';
    public country: string = '';
    public dob: string = '';
    public email: string = '';
    public englishName: string = '';
    public gender: string = 'Unknown';
    public name: string = '';
    public nationalId: string = '';
    public passport: string = '';
    public phone: string = '';
}