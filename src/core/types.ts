


export type APIResponse = {
  status : number, 
  message : string,
  data? : any
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
  searchExistingReservations?: string | undefined,
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
  IAuthorizer : Symbol.for('IAuthorizer'),
  IAuthService : Symbol.for('IAuthService'),
  IBillRepository : Symbol.for('IBillRepository'),
  ICacheAdapter : Symbol.for('ICacheAdapter'),
  IConfigRepository : Symbol.for('IConfigRepository'),
  ICustomerRepository : Symbol.for('ICustomerRepository'),
  ICustomerService : Symbol.for('ICustomerService'),
  IDatabase : Symbol.for('IDatabase'),
  IDbType : Symbol.for('IDbType'),
  ILogRepository : Symbol.for('ILogRepository'),
  ILogService : Symbol.for('ILogService'),
  IMapper : Symbol.for('IMapper'),
  IQueryTransformer : Symbol.for('IQueryObjectTransformer'),
  IPaymentRepository : Symbol.for('IPaymentRepository'),
  IPookieConfigRepository : Symbol.for('IPookieConfigRepository'),
  IPookieDeviceRepository : Symbol.for('IPookieDeviceRepository'),
  IPookieRepository : Symbol.for('IPookieRepository'),
  IPookieService : Symbol.for('IPookieService'),
  IPrepaidRepository : Symbol.for('IPrepaidRepository'),
  IPromotionRepository : Symbol.for('IPromotionRepository'),
  IReportRepository : Symbol.for('IReportRepository'),
  IReportService : Symbol.for('IReportService'),
  IRepository : Symbol.for('IRepository'),
  IReservationCustomerRepository: Symbol.for('IReservationCustomerRepository'),
  IReservationRepository: Symbol.for('IReservationRepository'),
  IReservationService: Symbol.for('IReservationService'),
  IRoomRateRepository : Symbol.for('IRoomRateRepository'),
  IRoomRepository : Symbol.for('IRoomRepository'),
  IRoomService: Symbol.for('IRoomService'),
  IRoomChargeRepository : Symbol.for('IRoomChargeRepository'),
  IRoomReservationRepository : Symbol.for('IRoomReservationRepository'),
  IRoomTypeRepository : Symbol.for('IRoomTypeRepository'),
  IUserRepository : Symbol.for('IUserRepository'),
  IUserService : Symbol.for('IUserService'),
}

