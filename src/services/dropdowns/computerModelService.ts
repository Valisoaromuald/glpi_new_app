import { glpiApi } from "@/api/GlpiApi";
import PromiseUtil from "@/utils/promiseUtil";

export default class ComputerModelService {
    private readonly subEndPoint = 'State'
    private readonly endPointPrefix = `/DropDowns/${this.subEndPoint}`

    static createObject(name: string,manufacturerId:number=1): Object {
        return {
            input: {
                name: name,
                manufacturers_id: manufacturerId,
                comment: ""
            }
        }
    }
}