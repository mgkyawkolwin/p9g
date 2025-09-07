import { UserEntity } from "@/core/data/orm/drizzle/mysql/schema";

export default interface ILogService {

    logError(error:any) : Promise<void>;
    
}