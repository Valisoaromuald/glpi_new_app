import { ITicketCost, ITicketItem, ObjTicket } from "shared-types";
import { AppError } from "../../common/errors/AppError";
import { db } from "../../config/database";
import { rowsAs } from "../../common/utils/db";
import { ticketCostService } from "../ticketCost/ticketCost.service";

export const ticketService = {
    create(data: ObjTicket): { id: number } {
        let glpi_id = data.glpi_id
        if (!glpi_id) {
            throw new AppError(400, 'le glpi_id est obligatoire');
        }
        const result = db.prepare(`
      INSERT INTO ticket (glpi_id,status_id)
      VALUES (?,1)
    `).run(glpi_id);
        const ticketId = Number(result.lastInsertRowid);
        db.prepare(`
      INSERT INTO ticket_status (insert_date, ticket_id, status_id)
      VALUES (datetime('now'), ?, 1)
    `).run(ticketId);
        return { id: ticketId };
    },

    getById(id: number): ObjTicket {
        const ticket = db.prepare('SELECT * FROM ticket where id=?').get(id) as ObjTicket | undefined;
        if (!ticket) {
            throw new AppError(404, 'Ticket introuvable');
        }
        return ticket;
    },
    getByGlpiId(id: number): ObjTicket {
        const ticket = db.prepare('SELECT * FROM ticket where glpi_id=?').get(id) as ObjTicket | undefined;
        if (!ticket) {
            throw new AppError(404, 'Tcket introuvable');
        }
        return ticket;
    },
    getAll(): ObjTicket[] {
        return rowsAs<ObjTicket>(db.prepare(`
          SELECT * FROM ticket
        `).all());
    },
    updateStatus(ticketId: number, status: number): void {
        db.prepare(`UPDATE ticket set status_id=? where glpi_id=?`).run(status, ticketId);
    },
    insertCostBySelfId(ticket_id: number, items: ITicketItem[], cost: number, cost_type: string) {
        if (!ticket_id) {
            throw new Error("le numero de ticket n'est pas defini")
        }
        if (cost < 0) {
            throw new Error("le cout du ticket doit etre positif ou nul")
        }
        if (!ticketCostService.costTypeExist(cost_type)) {
            throw new Error("le type de cout n'est pas dans la liste")
        }

        let unit_cost = ticketCostService.getUnitCost(cost, items.length)
        const creation_date = new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19);
        for (let item of items) {
            let insertObj: Partial<ITicketCost> = ticketCostService.createInsertObject(cost_type, ticket_id, unit_cost, item.items_id, item.itemtype)
            const result = ticketCostService.create(insertObj,creation_date)
        }
    }
}