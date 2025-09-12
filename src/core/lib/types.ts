


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
  searchArrivalDateTime? : string | undefined,
  searchCheckInDate? : string | undefined,
  searchCheckInDateFrom? : string | undefined,
  searchCheckInDateUntil? : string | undefined,
  searchCheckOutDate? : string | undefined,
  searchCreatedDateFrom? : string | undefined,
  searchCreatedDateUntil? : string | undefined,
  searchDepartureDateTime? : string | undefined,
  date? : string | undefined,
  searchDate? : string | undefined,
  searchEmail?: string | undefined,
  searchId? : string | undefined,
  searchName? : string | undefined,
  searchNationalId? : string | undefined,
  searchPassport? : string | undefined,
  searchPhone? : string | undefined,
  searchPrepaidPackage? : string | undefined,
  searchPromotionPackage? : string | undefined,
  searchRemark? : string | undefined,
  searchReservationStatus? : string | undefined,
  searchReservationType? : string | undefined,
  searchUserName? : string | undefined,
};

export const TYPES = {
  IAuthService : Symbol.for('IAuthService'),
  IBillRepository : Symbol.for('IBillRepository'),
  IConfigRepository : Symbol.for('IConfigRepository'),
  ICustomerRepository : Symbol.for('ICustomerRepository'),
  ICustomerService : Symbol.for('ICustomerService'),
  IDatabase : Symbol.for('IDatabase'),
  IDbType : Symbol.for('IDbType'),
  ILogRepository : Symbol.for('ILogRepository'),
  ILogService : Symbol.for('ILogService'),
  IMapper : Symbol.for('IMapper'),
  IQueryObjectTransformer : Symbol.for('IQueryObjectTransformer'),
  IPaymentRepository : Symbol.for('IPaymentRepository'),
  IReportRepository : Symbol.for('IReportRepository'),
  IReportService : Symbol.for('IReportService'),
  IRepository : Symbol.for('IRepository'),
  IReservationCustomerRepository: Symbol.for('IReservationCustomerRepository'),
  IReservationRepository: Symbol.for('IReservationRepository'),
  IReservationService: Symbol.for('IReservationService'),
  IRoomRateRepository : Symbol.for('IRoomRateRepository'),
  IRoomRepository : Symbol.for('IRoomRepository'),
  IRoomChargeRepository : Symbol.for('IRoomChargeRepository'),
  IRoomReservationRepository : Symbol.for('IRoomReservationRepository'),
  IRoomTypeRepository : Symbol.for('IRoomTypeRepository'),
  IUserRepository : Symbol.for('IUserRepository'),
  IUserService : Symbol.for('IUserService'),
}

