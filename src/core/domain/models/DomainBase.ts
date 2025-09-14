import IDomainModel from "./IDomainModel";
import {v4 as uuidv4} from 'uuid';

export default abstract class DomainBase implements IDomainModel{
   public id : string = uuidv4();
   public modelState: "unchanged"|"inserted"|"updated"|"deleted" = "unchanged"; 
   public createdAtUTC: Date = new Date();
   public createdBy: string = '';
   public updatedAtUTC: Date = undefined;
   public updatedBy: string = '';
}