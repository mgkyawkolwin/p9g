import Customer from "./Customer";


export default class Reservation{
    public id: string = '';
    // public arrivalDateTime: string | undefined;
    public arrivalDateTimeUTC: Date | undefined;
    public arrivalFlight: string = '';
    // public checkInDate: string | undefined;
    public checkInDateUTC: Date;
    // public checkOutDate: string | undefined;
    public checkOutDateUTC: Date;
    public customers: Customer[] = [];
    // public departureDateTime: string | undefined;
    public departureDateTimeUTC: Date | undefined;
    public departureFlight: string = '';
    public depositAmount: number = 0;
    public depositCurrency!: string;
    // public depositDate: string | undefined;
    public depositDateUTC: Date | undefined;
    public dropOffCarNo: string | undefined;
    public dropOfFee: number;
    public dropOffFeeCurrency: string;
    public dropOffFeePaidOnUTC: Date | undefined;
    public dropOffType!: string;
    public dropOffTypeId!: string;
    public dropOffTypeText!: string;
    public noOfDays: number = 0;
    public noOfGuests: number = 0;
    public pickUpCarNo: string | undefined;
    public pickUpFee: number = 0;
    public pickUpFeeCurrency: string;
    public pickUpFeePaidOnUTC: Date | undefined;
    public pickUpType: string = '';
    public pickUpTypeId!: string;
    public pickUpTypeText!: string;
    public prepaidPackage!: string;
    public prepaidPackageId!: string;
    public promotionPackage!: string;
    public promotionPackageId!: string;
    public promotionPackageText!: string;
    public remark: string = '';
    public roomNo: string = '';
    public reservationStatus: string = 'NEW';
    public reservationStatusId!: string;
    public reservationStatusText!: string;
    public reservationType: string = 'GENERAL';
    public reservationTypeId!: string;
    public reservationTypeText!: string; 
    public totalAmount: number = 0;
    public paidAmount: number = 0;
    public discountAmount: number = 0;
    public balanceAmount: number = 0;
    public tax: number = 0;
    public taxAmount: number = 0;
    public location!: string;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC?: Date;
    public updatedBy?: string;
    
}

