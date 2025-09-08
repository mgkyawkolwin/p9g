import { UserEntity } from "@/core/data/orm/drizzle/mysql/schema"
import { PagerParams, SearchParam } from "@/core/lib/types";
import User from "../../models/User";


export default interface IUserService {

    userCreate(user : User, sessionUser: SessionUser) : Promise<User>;
    userDelete(id : number, sessionUser: SessionUser) : Promise<boolean>;
    userFindAll(pagerParams : PagerParams, sessionUser: SessionUser): Promise<User[]>;
    userFindByUserName(userName:string, sessionUser: SessionUser) : Promise<User | null>;
    userFindByUserNameAndPassword(userName:string, password:string, sessionUser: SessionUser) : Promise<User | null>;
    userFindByEmailAndPassword(email:string, password:string, sessionUser: SessionUser) : Promise<User | null>;
    userFindById(id : number, sessionUser: SessionUser) : Promise<User | null>;
    userFindMany(searchParams:SearchParam[], pagerParams : PagerParams, sessionUser: SessionUser): Promise<[User[],PagerParams]>;
    userUpdate(id:number, user : User, sessionUser: SessionUser) : Promise<User>;
    
}