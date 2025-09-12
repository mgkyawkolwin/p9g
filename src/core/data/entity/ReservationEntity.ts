import EntityBase from "./EntityBase";


export default class ReservationEntity extends EntityBase{
    public arrivalDateTime: Date = null;
    public arrivalFlight: string = "";
    public checkInDate: Date = null;
    public checkOutDate: Date = null;
    public departureDateTime: Date = null;
    public departureFlight: string = "";
    public depositAmount: number = 0;
    public depositAmountInCurrency: number = 0;
    public depositCurrency: string = '';
    public depositPaymentMode: string = '';
    public depositDateUTC: Date = null;
    public dropOffCarNo: string = "";
    public dropOffDriver: string = "";
    public dropOfFee: number = 0;
    public dropOffFeeCurrency: string = '';
    public dropOffFeePaidOnUTC: Date = null;
    public dropOffTypeId: string = '';
    public isSingleOccupancy: boolean = false;
    public noOfDays: number = 0;
    public noOfGuests: number = 2;
    public pickUpCarNo: string = "";
    public pickUpDriver: string = "";
    public pickUpFee: number = 0;
    public pickUpFeeCurrency: string = '';
    public pickUpFeePaidOnUTC: Date = null;
    public pickUpTypeId: string  = '';
    public prepaidPackageId: string  = '';
    public promotionPackageId: string  = '';
    public remark: string = "";
    public roomNo: string = "";
    public reservationStatusId: string  = '';
    public reservationTypeId: string  = '';
    public tourCompany: string  = '';
    public totalAmount: number = 0;
    public paidAmount: number = 0;
    public discountAmount: number = 0;
    public netAmount: number = 0;
    public dueAmount: number = 0;
    public tax: number = 0;
    public taxAmount: number = 0;
    public location: string = '';
}

