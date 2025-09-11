import User from "../../models/User";

export default interface IAuth {

    signMeIn(userName: string, password: string): Promise<User | null>;

}