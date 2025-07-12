import { ColumnDef } from "@tanstack/react-table";


export type APIResponse = {
  status : number, 
  message : string,
  data : any
};

export type FormState = {
  error : boolean,
  message : string,
  data? : any,
  formData? : FormData | null,
  pager?: PagerParams,
  reload?: boolean
};

export type PagerParams = {
  orderBy: string, 
  orderDirection: string, 
  pageIndex: number, 
  pageSize: number,
  pages: number,
  records: number
}

export type SearchParam = {
  searchColumn : string,
  searchValue : string
}

export const TYPES = {
  IAuthService : Symbol.for('IAuthService'),
  ICustomerRepository : Symbol.for('ICustomerRepository'),
  ICustomerService : Symbol.for('ICustomerService'),
  IDatabase : Symbol.for('IDatabase'),
  IDbType : Symbol.for('IDbType'),
  IRepository : Symbol.for('IRepository'),
  IReservationRepository: Symbol.for('IReservationRepository'),
  IReservationService: Symbol.for('IReservationService'),
  IUserRepository : Symbol.for('IUserRepository'),
  IUserService : Symbol.for('IUserService'),
}

