import EntityBase from "../../../lib/models/entity/EntityBase";

export default class PookieDeviceEntity extends EntityBase {
    public deviceId: string = '';
    public isBlocked: boolean = false;
    public lastRequestAtUTC: Date = null;
}