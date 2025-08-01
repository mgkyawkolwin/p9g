
export default class RoomType {
    public id!: string;
    public roomType!: string;
    public roomTypeText!: string;
    public maxOccupancy!: number;
    public isDoubleBed!: boolean;
    public location!: string;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC?: Date;
    public updatedBy?: string;
}