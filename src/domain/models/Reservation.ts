import Customer from "./Customer";


export default class Reservation{
    public id!: string;
    public arrivalDateTimeUTC!: Date;
    public arrivalFlight!: string;
    public checkInDateUTC!: Date;
    public checkOutDateUTC!: Date;
    public customers?: Customer[];
    public departureDateTimeUTC!: Date;
    public departureFlight!: string;
    public depositAmount!: number;
    public dropOffType!: string;
    public dropOffTypeId!: string;
    public dropOffTypeText!: string;
    public noOfDays!: number;
    public noOfGuests!: number;
    public pickUpType!: string;
    public pickUpTypeId!: string;
    public pickUpTypeText!: string;
    public prepaidPackage!: string;
    public prepaidPackageId!: string;
    public promotionPackage!: string;
    public promotionPackageId!: string;
    public promotionPackageText!: string;
    public remark!: string;
    public roomNo!: string;
    public reservationStatus!: string;
    public reservationStatusId!: string;
    public reservationStatusText!: string;
    public reservationType!: string;
    public reservationTypeId!: string;
    public reservationTypeText!: string;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC!: Date;
    public updatedBy!: string;


    constructor(){
        this.createdAtUTC = new Date("2024-01-01");
        this.updatedAtUTC = new Date("2024-01-02");
        this.reservationStatus = 'NEW';
    }

    sayHello(){
        return "HELLO WORLD";
    }
}

