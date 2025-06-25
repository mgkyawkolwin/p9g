import { User } from "@/data/orm/drizzle/mysql/schema";

export default interface IAuth {

    signMeIn(userName : string, password : string) : Promise<User | null>;
    
}