import { glpiApi } from "@/api/GlpiApi"
import type { DocumentItem } from "@/types/document/documentItem"

export default class DocumentItemService {
    static async getAll(): Promise<Partial<DocumentItem>[]> {
        const data = (await glpiApi.getV1<Partial<DocumentItem>[]>(
            `Document_Item?expand_dropdowns=true`
        )).data
        return data
    }
    
}