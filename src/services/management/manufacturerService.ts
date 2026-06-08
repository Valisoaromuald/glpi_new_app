import { glpiApi } from "@/api/GlpiApi";
import PromiseUtil from "@/utils/promiseUtil";

export default class ManufacturerService {
    static createObject(nameValue: string): Object {
        return {
            input: {
                name: nameValue,
                comment: ""
            }
        }
    }
}