import { glpiApi } from "@/api/GlpiApi";
import PromiseUtil from "@/utils/promiseUtil";

export default class LocationService {
    private readonly subEndPoint = 'Location'
    private readonly endPointPrefix = `/DropDowns/${this.subEndPoint}`
    async getAllIds(): Promise<number[]> {
        try {
            const endpoint = `query { ${this.subEndPoint} { id } }`;
            const response = await glpiApi.graphql<{ locations: { id: number | string }[] }>(endpoint);
            if (response.locations) {
                return response.locations.map(location => Number(location.id));
            }
            return [];
        } catch (error) {
            // Le "throw error" dans un bloc catch simple est redondant, 
            // mais si tu prévois d'ajouter des logs ici, tu peux le laisser.
            throw error;
        }
    }
    async deleteById(id: number | string): Promise<any> {
        try {

            const endpoint = `${this.endPointPrefix}/${id}?force=1`
            const response = await glpiApi.delete(endpoint)
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    async deleteAll(): Promise<void> {
        const pas: number = 5;
        try {
            const ids: number[] = await this.getAllIds();
            for (let i = 0; i < ids.length; i += pas) {
                const subIds: number[] = ids.slice(i, i + pas);
                const promises: Promise<any>[] = PromiseUtil.buildPromises<number, any>(subIds, id => this.deleteById(id));
                await Promise.all(promises)
            }
        } catch (error) {
            throw error;
        }
    }
    static createObject(name:string): Object {
        if(name){
            return {
                    name: name,
                    entities_id: 0,
                    is_recursive: 1,
                    comment: ""
            }
        }
        return{}
    }
}