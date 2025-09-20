import EntityBase from "../../../lib/models/entity/EntityBase";


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
    public discountAmount: number = 0;
    public dropOffCarNo: string = "";
    public dropOffDriver: string = "";
    public dropOfFee: number = 0;
    public dropOffFeeCurrency: string = '';
    public dropOffFeePaidOnUTC: Date = null;
    public dropOffTypeId: string = '';
    public dueAmount: number = 0;
    public isSingleOccupancy: boolean = false;
    public netAmount: number = 0;
    public noOfDays: number = 0;
    public noOfGuests: number = 2;
    public location: string = '';
    public paidAmount: number = 0;
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
    public tax: number = 0;
    public taxAmount: number = 0;
    public tourCompany: string  = '';
    public totalAmount: number = 0;
}

