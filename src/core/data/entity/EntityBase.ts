import IEntity from "./IEntity";

export default abstract class EntityBase implements IEntity{
   public id : string = '';
   public createdAtUTC: Date = new Date();
   public createdBy: string = '';
   public updatedAtUTC: Date = undefined;
   public updatedBy: string = '';
}