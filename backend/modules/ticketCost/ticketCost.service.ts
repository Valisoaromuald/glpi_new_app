import { ITicketCost, ITicketCostGrouped } from "shared-types"
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
        if (cost_type && category && item_id && cost!== null && cost!==undefined  && ticket_id) {
            const result = db.prepare(`
        INSERT INTO ticket_cost (cost_type, cost, category, item_id, ticket_id,creation_date)
        VALUES (?, ?, ?, ?, ?,?)
        `).run(cost_type, cost, category, item_id, ticket_id, creation_date);
            const ticketCostId = Number(result.lastInsertRowid);
            return { id: ticketCostId };
        }
        return { id: 0 }
    },
    costTypeExist(cost_type: string): boolean {
        const in_list = COST_TYPES.find(ct => ct.trim().toLowerCase() === cost_type.trim().toLowerCase())
        return in_list ? true : false
    },
    getUnitCost(totalCost: number, items_number: number): number {
        if (!items_number) return totalCost
        return totalCost / items_number
    },
    getAll(): ITicketCost[] {
        return rowsAs<ITicketCost>(db.prepare(`
              SELECT * FROM ticket_cost
            `).all());
    },
    getMostRecentCostsByTicket(ticketId: number): ITicketCost[] {
        const stmt = db.prepare(`
    SELECT id, cost_type, cost, category, creation_date, item_id, ticket_id
    FROM ticket_cost
    WHERE ticket_id = ?
            and cost_type='super_cost'
      AND creation_date = (
        SELECT MAX(creation_date) FROM ticket_cost WHERE ticket_id = ? and cost_type='super_cost'
      )
  `);
        return rowsAs<ITicketCost>(stmt.all(ticketId, ticketId));
    },
    getFirst(ticketId: number): ITicketCost[] {
        const stmt = db.prepare(`
    SELECT id, cost_type, cost, category, creation_date, item_id, ticket_id
    FROM ticket_cost
    WHERE ticket_id = ?
    and cost_type='super_cost'
      AND creation_date = (
        SELECT MIN(creation_date) FROM ticket_cost WHERE ticket_id = ? and cost_type='super_cost'
      )
  `);
        return rowsAs<ITicketCost>(stmt.all(ticketId, ticketId));
    },
    getAllByTicketId(ticketId: number): ITicketCost[] {
        const stmt = db.prepare(`
    SELECT id, cost_type, cost, category, creation_date, item_id, ticket_id
    FROM ticket_cost
    WHERE ticket_id = ?
    and cost_type='super_cost'
  `);
        let result= rowsAs<ITicketCost>(stmt.all(ticketId)) ??[];
        return result;
    },
    deleteTicketCost(id: number): boolean {
        const stmt = db.prepare(`DELETE FROM ticket_cost WHERE id = ?`);
        const result = stmt.run(id);
        return result.changes > 0;
    },
    deleteAllRecentTicketCosts(ticketId: number): number {
        const costs = ticketCostService.getMostRecentCostsByTicket(ticketId);
        let deletedCount = 0;
        for (const cost of costs) {
            const deleted = ticketCostService.deleteTicketCost(cost.id);
            if (deleted) deletedCount++;
        }

        return deletedCount;
    },

    /**
     * Agrège les coûts d'un ticket par item_id pour une catégorie donnée,
     * avec une colonne par cost_type (super_cost, glpi_cost, super_cost, close) et un total.
     */
    getTotalCostsForEachCategory(): ITicketCostGrouped[] {
        const stmt = db.prepare(`
        SELECT
            category,
            SUM(CASE WHEN cost_type = 'super_cost' THEN cost ELSE 0 END) AS super_cost,
            SUM(CASE WHEN cost_type = 'glpi_cost' THEN cost ELSE 0 END) AS glpi_cost,
            SUM(CASE WHEN cost_type = 'reopening' THEN cost ELSE 0 END) AS reopening,
            SUM(CASE WHEN cost_type = 'close' THEN cost ELSE 0 END) AS close,
            SUM(cost) as total
        FROM ticket_cost
        GROUP BY category
    `);
        return rowsAs<ITicketCostGrouped>(stmt.all());
    },
    /**
     * recuperere le cout 
     */
    getDetailsPerItemByCategory(category_name:string): ITicketCostGrouped[] {
        const stmt = db.prepare(`
        SELECT
            item_id,
            category,
            SUM(CASE WHEN cost_type = 'super_cost' THEN cost ELSE 0 END) AS super_cost,
            SUM(CASE WHEN cost_type = 'glpi_cost' THEN cost ELSE 0 END) AS glpi_cost,
            SUM(CASE WHEN cost_type = 'reopening' THEN cost ELSE 0 END) AS reopening,
            SUM(CASE WHEN cost_type = 'close' THEN cost ELSE 0 END) AS close,
            SUM(cost) as total
        FROM ticket_cost
        WHERE category= ?
        GROUP BY item_id
    `);
        return rowsAs<ITicketCostGrouped>(stmt.all(category_name));
    },

}