
export default class User{
    public id: string | undefined;
    public name: string | undefined;
    public userName: string | undefined;
    public email: string | undefined;
    public password: string | undefined;
    public role: string | undefined;
    public location: string | undefined;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC?: Date;
    public updatedBy?: string;

}