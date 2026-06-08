import { glpiApi } from "@/api/GlpiApi";
import PromiseUtil from "@/utils/promiseUtil";

export default class stateService {
    private readonly subEndPoint = 'State'
    private readonly endPointPrefix = `/DropDowns/${this.subEndPoint}`

    static createObject(stateValue: string): Object {
        return {
            input: {
                name: stateValue,
                entities_id: 0,
                is_recursive: 1,
                is_visible_computer: 1,
                is_visible_monitor: 1,
                is_visible_networkequipment: 1,
                is_visible_peripheral: 1,
                is_visible_printer: 1,
                is_visible_phone: 1,
                comment: ""
            }
        }
    }
}