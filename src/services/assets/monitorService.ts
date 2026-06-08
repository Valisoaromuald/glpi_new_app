import { glpiApi } from "@/api/GlpiApi";
import PromiseUtil from "@/utils/promiseUtil";

export default class MonitorService {
    private readonly subEndPoint = 'NetworkEquipment'
    private readonly endPointPrefix = `/Assets/${this.subEndPoint}`
    async getAllIds(): Promise<number[]> {
        try {
            const endpoint = `query { ${this.subEndPoint} { id } }`;
            const response = await glpiApi.graphql<{ Monitor: { id: number | string }[] }>(endpoint);
            if (response.Monitor) {
                return response.Monitor.map(monitor => Number(monitor.id));
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
    static createObject(name: string, entities_id: number=0, otherserial: string,states_id:number, locations_id: number,manufacturers_id:number, monitormodels_id:number,monitortypes_id:number,users_id:number): Object {
        return {
            input: {
                name: name,
                entities_id: entities_id,
                otherserial: otherserial,
                states_id: states_id,
                locations_id: locations_id,
                manufacturers_id: manufacturers_id,
                monitormodels_id: monitormodels_id,
                monitortypes_id:monitortypes_id,
                users_id: users_id,
                comment: ""
            }
        }
    }
}