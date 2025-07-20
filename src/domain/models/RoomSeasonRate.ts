
export default class RoomSeasonRate {
    public id!: string;
    public roomType!: string;
    public roomTypeId!: string;
    public roomRate!: number;
    public singleRate!: number;
    public location!: string;
    public startDateUTC!: Date;
    public endDateUTC!: Date;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC?: Date;
    public updatedBy?: string;
}