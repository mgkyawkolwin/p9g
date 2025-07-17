import Customer from "./Customer";


export default class Reservation{
    public id: string = '';
    public arrivalDateTime: string | undefined;
    public arrivalDateTimeUTC: string | undefined;
    public arrivalFlight: string = '';
    public checkInDate: string | undefined;
    public checkInDateUTC: string | undefined;
    public checkOutDate: string | undefined;
    public checkOutDateUTC: string | undefined;
    public customers: Customer[] = [];
    public departureDateTime: string | undefined;
    public departureDateTimeUTC: string | undefined;
    public departureFlight: string = '';
    public depositAmount: number = 0;
    public depositCurrency!: string;
    public depositDate: string | undefined;
    public depositDateUTC: string | undefined;
    public dropOffCarNo: string | undefined;
    public dropOffType!: string;
    public dropOffTypeId!: string;
    public dropOffTypeText!: string;
    public noOfDays: number = 0;
    public noOfGuests: number = 0;
    public pickUpCarNo: string | undefined;
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
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC?: Date;
    public updatedBy?: string;
    
}

