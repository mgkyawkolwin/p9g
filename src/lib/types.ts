

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
  pager?: PagerParams
};

export type PagerParams = {
  orderBy: string, 
  orderDirection: string, 
  pageIndex: number, 
  pageSize: number,
  pages: number
}

export type SearchParam = {
  searchColumn : string,
  searchValue : string
}

export const TYPES = {
  IDatabase : Symbol.for('IDatabase'),
  IDbType : Symbol.for('IDbType'),
  IRepository : Symbol.for('IRepository'),
  IRepositoryFactory : Symbol.for('IRepositoryFactory'),
  IUserRepository : Symbol.for('IUserRepository'),
  IUserServce : Symbol.for('IUserService'),
}