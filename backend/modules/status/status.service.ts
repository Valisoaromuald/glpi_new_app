import { IStatus } from "shared-types";
import { rowsAs } from "../../common/utils/db";
import { db } from "../../config/database";

export const statusService = {
    getAll(): IStatus[] {
            return rowsAs<IStatus>(db.prepare(`
          SELECT id, label, label_mg
          FROM status 
        `).all());
        },
}