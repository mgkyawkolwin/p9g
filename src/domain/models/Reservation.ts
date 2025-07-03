

export default class Reservation{
    public id!: string;
    public arrivalDateTime!: Date;
    public arrivalFlight!: string;
    public checkInDate!: Date;
    public checkOutDate!: Date;
    public departureDateTime!: Date;
    public departureFlight!: string;
    public deposit!: number;
    public dropOffType!: string;
    public dropOffTypeId!: string;
    public noOfDays!: number;
    public noOfGuests!: number;
    public pickUpType!: string;
    public pickUpTypeId!: string;
    public prepaidPackage!: string;
    public prepaidPackageId!: string;
    public promotionPackage!: string;
    public promotionPackageId!: string;
    public remark!: string;
    public roomNo!: string;
    public reservationStatus!: string;
    public reservationStatusId!: string;
    public reservationType!: string;
    public reservationTypeId!: string;
    public createdAt!: Date;
    public createdBy!: string;
    public updatedAt!: Date;
    public updatedBy!: string;

    constructor(){
        this.createdAt = new Date("2024-01-01");
        this.updatedAt = new Date("2024-01-02");
    }
}

