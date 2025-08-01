import { UserEntity } from "@/data/orm/drizzle/mysql/schema"
import { PagerParams, SearchParam } from "@/lib/types";


export default interface IUserService {

    userDelete(id : number) : Promise<boolean>;

    userFindAll(pagerParams : PagerParams): Promise<UserEntity[]>;

    userFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[UserEntity[],PagerParams]>;

    userFindByUserName(userName:string) : Promise<UserEntity | null>;

    userFindByUserNameAndPassword(userName:string, password:string) : Promise<UserEntity | null>;

    userFindByEmailAndPassword(email:string, password:string) : Promise<UserEntity | null>;

    userFindById(id : number) : Promise<UserEntity | null>;

    userCreate(user : UserEntity) : Promise<UserEntity>;

    userUpdate(id:number, user : UserEntity) : Promise<UserEntity>;
    
}