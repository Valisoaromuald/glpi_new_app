export default class ManufacturerService {
    static createObject(nameValue: string): Object {
        if(nameValue){
            return {
                input: {
                    name: nameValue,
                    comment: ""
                }
            }
        }
        return{}
    }
}