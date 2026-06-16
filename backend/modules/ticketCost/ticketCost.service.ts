import { ITicketCost } from "shared-types"
import { db } from "../../config/database";
import { COST_TYPES } from "../../utils/constants.utils";
import { rowsAs } from "../../common/utils/db";

export const ticketCostService = {
    createInsertObject(cost_type: string, ticket_id: number, cost: number, item_id: number, category: string): Partial<ITicketCost> {
        let ticketCost: Partial<ITicketCost> = {
            cost_type: cost_type,
            ticket_id: ticket_id,
            cost: cost,
            item_id: item_id,
            category: category
        }
        return ticketCost
    },
    create(data: Partial<ITicketCost>, creation_date: string): { id: number } {
        const cost_type = data.cost_type
        const category = data.category
        const item_id = data.item_id
        const cost = data.cost
        const ticket_id = data.ticket_id
        if (cost_type && category && item_id && cost && ticket_id) {
            const result = db.prepare(`
        INSERT INTO ticket_cost (cost_type, cost, category, item_id, ticket_id,creation_date)
        VALUES (?, ?, ?, ?, ?,?)
        `).run(cost_type, cost, category, item_id,ticket_id,creation_date);
            const ticketCostId = Number(result.lastInsertRowid);
            return { id: ticketCostId };
        }
        return { id: 0 }
    }, 
    costTypeExist(cost_type:string) : boolean{
        const in_list = COST_TYPES.find(ct=>ct.trim().toLowerCase() === cost_type.trim().toLowerCase())
        return in_list ? true : false
    },
    getUnitCost(totalCost:number,items_number:number): number{
        if(items_number) return totalCost
        return totalCost / items_number
    },
    getAll(): ITicketCost[] {
            return rowsAs<ITicketCost>(db.prepare(`
              SELECT * FROM ticket_cost
            `).all());
        },
}