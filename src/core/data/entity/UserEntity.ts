import EntityBase from "./EntityBase";

export default class User extends EntityBase{
    public name: string = '';
    public userName: string = '';
    public email: string = '';
    public password: string = '';
    public role: string = '';
    public location: string = '';

}