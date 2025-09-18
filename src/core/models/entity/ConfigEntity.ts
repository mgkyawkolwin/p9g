import EntityBase from "../../../lib/models/entity/EntityBase";

export default class ConfigEntity extends EntityBase {
    public group: string = '';
    public value: string = '';
    public text: string = '';
}