import { glpiApi } from "@/api/GlpiApi";
import PromiseUtil from "@/utils/promiseUtil";
import { RESOURCES_TO_RESET } from "@/utils/resetUtil";

export default class DataResetService {
    getRealEndPoint(endpoint: string): string {
        const splittedEndpoint = endpoint.split('/');
        const realEndPoint = splittedEndpoint[splittedEndpoint.length - 1];
        return realEndPoint ?? '';
    }
    async getAllIds(endpoint: string): Promise<number[]> {
        try {
            const ids: number[] = [];
            const response = await glpiApi.get(endpoint);
            if (response) {
                const items = await response.data;
                if(items){
                    items.forEach((item: { id: number }) => ids.push(item.id));;
                }
            }
            return ids;
        } catch (error) {
            // Le "throw error" dans un bloc catch simple est redondant, 
            // mais si tu prévois d'ajouter des logs ici, tu peux le laisser.
            throw error;
        }

    }
    async deleteById(endpoint: string, id: number | string): Promise<any> {
        try {

            const realEndPoint = `${endpoint}/${id}?force=1`
            const response = await glpiApi.delete(realEndPoint)
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    async resetDatabase(
        onProgress?: (resource: string, done: number, total: number) => void
    ): Promise<void> {
        const pas: number = 20;
        for (const resource of RESOURCES_TO_RESET) {
            const allIds = await this.getAllIds(resource.endpoint);
            if(allIds.length !==0){
                const protectedIds = resource.protectedIds ?? [];
                const toDelete = allIds.filter(id => !protectedIds.includes(id));
                for (let i = 0; i < toDelete.length; i += pas) {
                    const subIds: number[] = toDelete.slice(i, i + pas);
                    const promises: Promise<any>[] = PromiseUtil.buildPromises<number, any>(subIds, id => this.deleteById(resource.endpoint, id));
                    await Promise.all(promises)
                    onProgress?.(resource.name, i + 1, toDelete.length);
                }
            }
            else{
                onProgress?.(resource.name, 0, 0);
            }
        }
    }
}