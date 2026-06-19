import { glpiApi } from "@/api/GlpiApi";
import type { ITicketItem } from "shared-types";

export default class TicketItemService {
    static async getAllByTicketId(ticketId: number): Promise<ITicketItem[]> {
        const response = await glpiApi.getV1<any[]>(`/Ticket/${ticketId}/Item_Ticket`);
        return response.data.map(item => ({
            itemtype: item.itemtype,
            items_id: Number(item.items_id)
        }));
    }
}
