import Config from "@/core/domain/models/Config";
import IRepository from "./IRepository";

export default interface IConfigRepository extends IRepository<Config>{

    findByGroupAndCode(group : string, value : string) : Promise<Config>;

}