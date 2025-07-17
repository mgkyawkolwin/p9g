import Reservation from "@/domain/models/Reservation";


export type APIResponse = {
  status : number, 
  message : string,
  data? : undefined | null | any//| Reservation | Reservation[] | {reservation: Reservation} | {reservations: Reservation[]}
};

export type FormState = {
  error : boolean,
  message : string,
  data? : any, //Reservation | Reservation[] | {reservations: Reservation[]},
  formData? : FormData | null,
  pager?: PagerParams,
  reload?: boolean
};

export type PagerParams = {
  orderBy?: string, 
  orderDirection?: string, 
  pageIndex?: number, 
  pageSize?: number,
  pages?: number,
  records?: number
}

export type SearchParam = {
  searchColumn : string,
  searchValue : string
}

export type SearchFormFields = {
  searchCheckInDateUTC? : string | undefined,
  searchCheckInDateUTCFrom? : string | undefined,
  searchCheckInDateUTCTo? : string | undefined,
  searchCheckOutDateUTC? : string | undefined,
  searchCreatedFrom? : string | undefined,
  searchCreatedUntil? : string | undefined,
  date? : string | undefined,
  searchDate? : string | undefined,
  searchEmail?: string | undefined,
  searchId? : string | undefined,
  searchName? : string | undefined,
  searchNationalId? : string | undefined,
  searchPassport? : string | undefined,
  searchPhone? : string | undefined,
  searchReservationStatus? : string | undefined,
  searchReservationType? : string | undefined,
  searchUserName? : string | undefined,
};

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

