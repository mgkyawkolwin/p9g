import DomainBase from "@/lib/models/domain/DomainBase";

export default class RoomRate extends DomainBase{
    public roomType: string = '';
    public roomTypeId: string = '';
    public roomRate: number = 0;
    public singleRate: number = 0;
    public seasonSurcharge: number = 0;
    public roomSurcharge: number = 0;
    public extraBedRate: number = 0;
    public location: string = '';
    public month: number = 0;
}