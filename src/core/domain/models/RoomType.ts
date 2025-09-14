import DomainBase from "./DomainBase";

export default class RoomType extends DomainBase{
    public roomType: string = '';
    public roomTypeText: string = '';
    public maxOccupancy: number = 0;
    public isDoubleBed: boolean = false;
    public location: string = '';
}