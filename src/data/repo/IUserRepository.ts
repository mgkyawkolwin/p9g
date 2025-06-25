import IRepository from "./IRepository";
import { User } from "../orm/drizzle/mysql/schema";

export default interface IUserRepository extends IRepository<User>{

    findByEmailAndPassword(email : string, password : string) : Promise<User>;
    
    findByUserNameAndPassword(userName : string, password : string) : Promise<User>;

}