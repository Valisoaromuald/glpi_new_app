
import { AppError } from "../../common/errors/AppError.js";
import { db } from "../../config/database.js";
import type { ObjTicket } from "./ticket.types.js";

export const ticketService = {
    create(data: ObjTicket ): { id: number } {
        if (!data.name || !data.content) {
            throw new AppError(400, 'name et content sont requis');
        }
        const result = db.prepare(`
      INSERT INTO ticket (creation_date, name, impact, priority, content)
      VALUES (datetime('now'), ?, ?, ?, ?)
    `).run(data.name, data.impact, data.priority, data.content);

        const ticketId = Number(result.lastInsertRowid);

        db.prepare(`
      INSERT INTO ticket_status (insert_date, ticket_id, status_id)
      VALUES (datetime('now'), ?, 1)
    `).run(ticketId);
        return { id: ticketId };
    },
}