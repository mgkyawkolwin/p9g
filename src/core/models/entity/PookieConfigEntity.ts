import EntityBase from "../../../lib/models/entity/EntityBase";

export default class PookieConfigEntity extends EntityBase {
    public contactUrl: string = '';
    public key: string = '';
    public seeResultUntil: number = 0;
    public version: string = '';
}