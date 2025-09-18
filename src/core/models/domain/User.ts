import DomainBase from "./DomainBase";

export default class User extends DomainBase{
    public name: string = '';
    public userName: string = '';
    public email: string = '';
    public password: string = '';
    public role: string = '';
    public location: string = '';

}