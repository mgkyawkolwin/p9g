import EntityBase from "../../../lib/models/entity/EntityBase";

export default class RoomTypeEntity extends EntityBase{
    public roomType: string = '';
    public roomTypeText: string = '';
    public maxOccupancy: number = 0;
    public isDoubleBed: boolean = false;
    public location: string = '';
}