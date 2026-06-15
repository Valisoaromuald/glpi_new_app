
import { KanbanConfigRow, UpdateKanbanConfigInput } from 'shared-types';
import { AppError } from '../../common/errors/AppError';
import { rowsAs } from '../../common/utils/db';
import { db } from '../../config/database';


export const kanbanService = {
    getAll(): KanbanConfigRow[] {
        return rowsAs<KanbanConfigRow>(db.prepare(`
      SELECT s.id, s.label, s.label_mg, k.color, k.status_id AS status_id
      FROM status s
      JOIN kanban_config k ON k.status_id  = s.id
      ORDER BY s.id
    `).all());
    },
    update(statusId: string, data: UpdateKanbanConfigInput): void {
        const { color, label_mg } = data;
        if (color === undefined && label_mg === undefined) {
            throw new AppError(400, 'color ou label_mg est requis');
        }

        if (color !== undefined) {
            const result = db.prepare(
                'UPDATE kanban_config SET color = ? WHERE status_id = ?'
            ).run(color, statusId);

            if (result.changes === 0) {
                throw new AppError(404, 'Configuration kanban introuvable pour ce statut');
            }
        }
    },
};