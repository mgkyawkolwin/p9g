export const AppUrl = {
    signin : '/auth/signin',
    main : '/console/reservations'
} as const;

export const CurrencyList = ['KWR', 'MMK', 'THB', 'USD'] as const;

export const CONSTANTS = {
    DEFAULT_CURRENCY: 'KWR'
} as const;

export const HttpStatusCode = {
    Ok : 200,
    Created : 201,
    NoContent : 204,
    BadRequest : 400,
    Unauthorized : 401,
    Forbidden : 403,
    NotFound : 404,
    ServerError : 500,
} as const;


export const SearchParams = {
    date: "date"
}


export const SelectList = {
    CURRENCY: new Map<string,string>(CurrencyList.map(cl => [cl, cl])),

    MONTH: new Map<string, string>([
        ["0","JAN"],
        ["1","FEB"],
        ["2","MAR"],
        ["3","APR"],
        ["4","MAY"],
        ["5","JUN"],
        ["6","JUL"],
        ["7","AUG"],
        ["8","SEP"],
        ["9","OCT"],
        ["10","NOV"],
        ["11","DEC"]
    ]),

    PREPAID_PACKAGES: new Map<string,string>([
        ["NINETY_DAYS", "90 Days"]
    ]),

    PROMOTION_PACKAGES: new Map<string, string>([
        ["TWELVE_GUESTS", "12 Guests"],
        ["THIRTY_DAYS", "30 Days"]
    ]),

    RESERVATION_STATUS: new Map<string, string>([
        ["NEW", "NEW"],
        ["CIN", "CIN"],
        ["OUT", "OUT"],
        ["CCL", "CCL"]
    ]),

    RESERVATION_TYPE: new Map<string, string>([
        ["NORMAL", "Normal"],
        ["MEMBER", "Member"],
        ["TOUR", "Tour"]
    ]),

    TRANSPORTATION: new Map<string, string>([
        ["NOT_REQUIRED", "Not Required"],
        ["SHARED", "Shared"],
        ["PRIVATE", "Private"]
    ])
} as const;

export const SelectListForm = {
    CURRENCY: new Map<string,string>([
        ["DEFAULT", "Choose"], 
        ...SelectList.CURRENCY.entries()
    ]),

    PREPAID_PACKAGES: new Map<string,string>([
        ["DEFAULT", "Choose"], 
        ...SelectList.PREPAID_PACKAGES.entries()
    ]),

    PROMOTION_PACKAGES: new Map<string, string>([
        ["DEFAULT", "Choose"], 
        ...SelectList.PROMOTION_PACKAGES.entries()
    ]),

    RESERVATION_STATUS: new Map<string, string>([
        ["DEFAULT", "Choose"], 
        ...SelectList.RESERVATION_STATUS.entries()
    ]),

    RESERVATION_TYPE: new Map<string, string>([
        ["DEFAULT", "Choose"], 
        ...SelectList.RESERVATION_TYPE.entries()
    ]),

    TRANSPORTATION: new Map<string, string>([
        ["DEFAULT", "Choose"], 
        ...SelectList.TRANSPORTATION.entries()
    ])
} as const;

export const SelectListSearch = {
    CURRENCY: new Map<string,string>([
        ["DEFAULT", "Show All"], 
        ...SelectList.CURRENCY.entries()
    ]),

    PREPAID_PACKAGES: new Map<string,string>([
        ["DEFAULT", "Show All"], 
        ...SelectList.PREPAID_PACKAGES.entries()
    ]),

    PROMOTION_PACKAGES: new Map<string, string>([
        ["DEFAULT", "Show All"], 
        ...SelectList.PROMOTION_PACKAGES.entries()
    ]),

    RESERVATION_STATUS: new Map<string, string>([
        ["DEFAULT", "Show All"], 
        ...SelectList.RESERVATION_STATUS.entries()
    ]),

    RESERVATION_TYPE: new Map<string, string>([
        ["DEFAULT", "Show All"], 
        ...SelectList.RESERVATION_TYPE.entries()
    ]),

    TRANSPORTATION: new Map<string, string>([
        ["DEFAULT", "Show All"], 
        ...SelectList.TRANSPORTATION.entries()
    ])
} as const;

