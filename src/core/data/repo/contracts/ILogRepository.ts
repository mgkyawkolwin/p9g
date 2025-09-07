import IRepository from "./IRepository";
import LogError from "@/core/domain/models/LogError";

export default interface ILogRepository extends IRepository<LogError>{

    logError(logError:LogError): Promise<void>;
    
}