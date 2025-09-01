import Bill from "./Bill";
import Customer from "./Customer";


export default class Reservation{
    public id: string = undefined;
    public arrivalDateTimeUTC: Date | undefined;
    public arrivalFlight: string = "";
    public bills: Bill[] = [];
    public checkInDateUTC: Date;
    public checkOutDateUTC: Date;
    public customers: Customer[] = [];
    public departureDateTimeUTC: Date | undefined;
    public departureFlight: string = "";
    public depositAmount: number = 0;
    public depositAmountInCurrency: number = 0;
    public depositCurrency: string = 'KWR';
    public depositPaymentMode: string = 'BANK';
    public depositDateUTC: Date | undefined;
    public dropOffCarNo: string = "";
    public dropOffDriver: string = "";
    public dropOfFee: number = 0;
    public dropOffFeeCurrency: string = 'KWR';
    public dropOffFeePaidOnUTC: Date | undefined;
    public dropOffType: string | null = null;
    public dropOffTypeId: string | null = null;
    public dropOffTypeText: string | null = null;
    public isSingleOccupancy: boolean = false;
    public noOfDays: number = 0;
    public noOfGuests: number = 2;
    public pickUpCarNo: string = "";
    public pickUpDriver: string = "";
    public pickUpFee: number = 0;
    public pickUpFeeCurrency: string = 'KWR';
    public pickUpFeePaidOnUTC: Date | undefined;
    public pickUpType: string | null = null;
    public pickUpTypeId: string | null = null;
    public pickUpTypeText: string | null = null;
    public prepaidPackage: string | null = null;
    public prepaidPackageId: string | null = null;
    public prepaidPackageText: string | null = null;
    public promotionPackage: string | null = null;
    public promotionPackageId: string | null = null;
    public promotionPackageText: string | null = null;
    public remark: string = "";
    public roomNo: string = "";
    public reservationStatus: string = 'NEW';
    public reservationStatusId: string | null = null;
    public reservationStatusText: string | null = null;
    public reservationType: string = 'GENERAL';
    public reservationTypeId: string | null = null;
    public reservationTypeText: string | null = null;
    public tourCompany: string | undefined = undefined;
    public totalAmount: number = 0;
    public paidAmount: number = 0;
    public discountAmount: number = 0;
    public netAmount: number = 0;
    public dueAmount: number = 0;
    public tax: number = 0;
    public taxAmount: number = 0;
    public location!: string;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC?: Date;
    public updatedBy?: string;
    
}

