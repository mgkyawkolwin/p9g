import IRepository from "./IRepository";
import { UserEntity } from "../orm/drizzle/mysql/schema";

export default interface IUserRepository extends IRepository<UserEntity>{

    findByEmailAndPassword(email : string, password : string) : Promise<UserEntity>;
    
    findByUserName(userName : string) : Promise<UserEntity>;

    findByUserNameAndPassword(userName : string, password : string) : Promise<UserEntity>;

}