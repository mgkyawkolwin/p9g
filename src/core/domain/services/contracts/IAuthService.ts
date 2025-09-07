import { UserEntity } from "@/core/data/orm/drizzle/mysql/schema";

export default interface IAuth {

    signMeIn(userName : string, password : string) : Promise<UserEntity | null>;
    
}