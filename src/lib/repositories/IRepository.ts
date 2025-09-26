import ITransaction from "@/lib/db/ITransaction";

export default interface IRepository<TDomain> {

  create<TTransaction extends ITransaction>(entity: TDomain, transaction?:TTransaction): Promise<TDomain>;
  createMany<TTransaction extends ITransaction>(entity: TDomain[], transaction?:TTransaction): Promise<void>;
  delete<TIdType,TTransaction extends ITransaction>(id: TIdType, transaction?:TTransaction): Promise<void>;
  deleteWhere<TQuery,TTransaction extends ITransaction>(condition: TQuery, transaction?:TTransaction): Promise<void>;
  executeQuery<TTransaction extends ITransaction>(query: string, transaction?: TTransaction): Promise<TDomain[]>;
  exists<TQuery>(condition: TQuery): Promise<boolean>;
  findAll(): Promise<TDomain[]>;
  findById<TIdType>(id: TIdType): Promise<TDomain | null>;
  findOne<TQuery>(condition: TQuery): Promise<TDomain | null>;
  findMany<TQuery, TOrder>(condition?: TQuery, order?:TOrder, offset?:number, limit?:number): Promise<[TDomain[],number]> 
  update<TIdType, TTransaction extends ITransaction>(id: TIdType, entity: TDomain, transaction?:TTransaction): Promise<void>;

}
