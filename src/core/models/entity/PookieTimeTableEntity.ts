import EntityBase from "../../../lib/models/entity/EntityBase";

export default class PookieTimeTableEntity extends EntityBase{
    public date: Date = new Date();
    public hole: string = '';
    public isBusy: boolean = false;
    public location: string = '';
    public rooms: string = '';
    public time: Date = null;
}