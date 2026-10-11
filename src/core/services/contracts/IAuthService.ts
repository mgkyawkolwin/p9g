import User from "../../models/domain/User";

export default interface IAuth {

    generateHash(password: string): Promise<string>;
    signMeIn(userName: string, password: string): Promise<User | null>;

}