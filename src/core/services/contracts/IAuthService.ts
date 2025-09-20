import User from "../../models/domain/User";

export default interface IAuth {

    signMeIn(userName: string, password: string): Promise<User | null>;

}