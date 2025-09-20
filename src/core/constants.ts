export const AppUrl = {
    signin : '/auth/signin',
    main : '/console/reservations'
} as const;

export const ConfigGroup = {
    RESERVATION_STATUS: "RESERVATION_STATUS",
    RESERVATION_TYPE: "RESERVATION_TYPE",
    RIDE_TYPE: "RIDE_TYPE"
}

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

    BILL_PAYMENT_TYPE: new Map<string, string>([
        ["DROPOFF","DROPOFF"],
        ["PICKUP","PICKUP"],
        ["OTHER","OTHER"]
    ]),

    CURRENCY: new Map<string,string>(CurrencyList.map(cl => [cl, cl])),

    GENDER: new Map<string, string>([
        ["Unknown","Unknown"],
        ["Male","Male"],
        ["Female","Female"]
    ]),

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

    PAYMENT_MODE: new Map<string, string>([
        ["CASH","Cash"],
        ["BANK","Bank"],
        ["ONLINE","Online"],
        ["OTHER","Other"]
    ]),

    ROOM_PAYMENT_TYPE: new Map<string, string>([
        ["NORMAL","NORMAL"],
        ["DEPOSIT","DEPOSIT"]
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
        ["GENERAL", "General"],
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
    BILL_PAYMENT_TYPE: new Map<string,string>([
        ...SelectList.BILL_PAYMENT_TYPE.entries()
    ]),

    CURRENCY: new Map<string,string>([
        ["DEFAULT", "Choose"], 
        ...SelectList.CURRENCY.entries()
    ]),

    GENDER: new Map<string,string>([
        ...SelectList.GENDER.entries()
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
        ...SelectList.RESERVATION_STATUS.entries()
    ]),

    RESERVATION_TYPE: new Map<string, string>([
        ...SelectList.RESERVATION_TYPE.entries()
    ]),

    ROOM_PAYMENT_TYPE: new Map<string,string>([
        ...SelectList.ROOM_PAYMENT_TYPE.entries()
    ]),

    TRANSPORTATION: new Map<string, string>([
        ["DEFAULT", "Choose"], 
        ...SelectList.TRANSPORTATION.entries()
    ])
} as const;

export const SelectListSearch = {

    BILL_PAYMENT_TYPE: new Map<string,string>([
        ["DEFAULT", "Show All"], 
        ...SelectList.BILL_PAYMENT_TYPE.entries()
    ]),

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

    ROOM_PAYMENT_TYPE: new Map<string,string>([
        ["DEFAULT", "Choose"], 
        ...SelectList.ROOM_PAYMENT_TYPE.entries()
    ]),

    TRANSPORTATION: new Map<string, string>([
        ["DEFAULT", "Show All"], 
        ...SelectList.TRANSPORTATION.entries()
    ])
} as const;

export const Theme = {
    Style: {
        text: "text-[#999999] dark:text-[#dddddd]",
        bg: "#000",
        dialogBg: "bg-[#dddddd] dark:bg-[#333333]",
        groupBg: "bg-[#dddddd] dark:bg-[#333333]",
        groupText: "text-[#666666] dark:text-[#dddddd]",
        tableBg: "bg-[#e6e6e6] dark:bg-black",
        tableHeadBg: "bg-[#cccccc] dark:bg-[#444444] ",
        tableHeadText: "text-[#666666] dark:text-[#cccccc]",
        tableHeadBorder: "border border-[#aaaaaa] dark:border-[#666666]",
        tableCellBg: "bg-[#e6e6e6] dark:bg-black",
        tableCellText: "text-[#555555] dark:text-[#aaaaaa]",
        tableCellBorder: "border-[#d9d9d9] border-b-[#c6c6c6] dark:border-[#333333] dark:border-b-[#444444]",
        tableFooterBg: "",
        tableFooterText: ""
    },
    Color: {
        red: "#CC0000",
        green: "#008800",
        blue: "#000088"
    }
}