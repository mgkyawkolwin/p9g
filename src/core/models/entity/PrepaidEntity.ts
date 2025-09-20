import EntityBase from "../../../lib/models/entity/EntityBase";

export default class PrepaidEntity extends EntityBase{
    value: string = '';
    text: string = '';
    days: number = 0;
}