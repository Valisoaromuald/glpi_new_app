import { glpiApi } from "@/api/GlpiApi";
import type { Manufacturer } from "@/types/dropdowns/manufacturer";

export default class ManufacturerService {
    static createObject(nameValue: string): Object {
        if (nameValue) {
            return {
                input: {
                    name: nameValue,
                    comment: ""
                }
            }
        }
        return {}
    }
    async getAll(): Promise<Partial<Manufacturer>[]> {
        try {
            const endpoint = `/Manufacturer?expand_dropdowns=1`;
            const response = await glpiApi.getV1<Partial<Manufacturer>[]>(endpoint);
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