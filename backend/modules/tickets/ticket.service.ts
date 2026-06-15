import { ObjTicket } from "shared-types";
import { AppError } from "../../common/errors/AppError";
import { db } from "../../config/database";
import { rowsAs } from "../../common/utils/db";

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
    getAll(): ObjTicket[] {
        return rowsAs<ObjTicket>(db.prepare(`
          SELECT * FROM ticket
        `).all());
    },
    updateStatus(ticketId: number, status: number): void {
        db.prepare(`UPDATE ticket set status_id=? where glpi_id=?`).run(status, ticketId);
    }
}