import EntityBase from "../../../lib/models/entity/EntityBase";

export default class User extends EntityBase{
    public name: string = '';
    public userName: string = '';
    public email: string = '';
    public password: string = '';
    public role: string = '';
    public location: string = '';

}