import { glpiApi } from "@/api/GlpiApi";
import type { State } from "@/types/dropdowns/state";

export default class StateService {
    static createObject(stateValue: string): Partial<State> {
        if (stateValue) {
            return {
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
        return {}
    }
    async getAll(): Promise<Partial<State>[]> {
        try {
            const endpoint = `/State?expand_dropdowns=1`;
            const response = await glpiApi.getV1<Partial<State>[]>(endpoint);
            if (response.data) {
                return response.data;
            }
            return [];
        } catch (error) {
            // Le "throw error" dans un bloc catch simple est redondant, 
            // mais si tu prévois d'ajouter des logs ici, tu peux le laisser.
            throw error;
        }
    }

}