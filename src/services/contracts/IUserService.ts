import { User } from "@/data/orm/drizzle/mysql/schema"
import { PagerParams, SearchParam } from "@/lib/types";


export default interface IUserService {

    userDelete(id : number) : Promise<boolean>;

    userFindAll(pagerParams : PagerParams): Promise<User[]>;

    userFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[User[],PagerParams]>;

    userFindByUserNameAndPassword(userName:string, password:string) : Promise<User | null>;

    userFindByEmailAndPassword(email:string, password:string) : Promise<User | null>;

    userFindById(id : number) : Promise<User | null>;

    userCreate(user : User) : Promise<User>;

    userUpdate(id:number, user : User) : Promise<User>;
    
}