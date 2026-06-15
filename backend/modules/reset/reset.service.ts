import { db } from '../../config/database';
import { ResetResult } from './reset.types';

export const resetService = {
  resetDatabase(): ResetResult {
    db.exec(`
      PRAGMA foreign_keys = OFF;

      DROP TABLE IF EXISTS ticket_status;
      DROP TABLE IF EXISTS kanban_config;
      DROP TABLE IF EXISTS ticket_cost;
      DROP TABLE IF EXISTS ticket;
      DROP TABLE IF EXISTS status;

      PRAGMA foreign_keys = ON;

      CREATE TABLE status(
         id INTEGER,
         label TEXT NOT NULL,
         label_mg TEXT,
         PRIMARY KEY(id)
      );

      CREATE TABLE ticket(
         id INTEGER,
         glpi_id INTEGER,
         status_id INTEGER NOT NULL,
         PRIMARY KEY(id),
         FOREIGN KEY(status_id) REFERENCES status(id)
      );

      CREATE TABLE ticket_cost(
         id INTEGER,
         cost_type TEXT,
         cost NUMERIC(20,4),
         category TEXT,
         ticket_id INTEGER NOT NULL,
         PRIMARY KEY(id),
         FOREIGN KEY(ticket_id) REFERENCES ticket(id)
      );

      CREATE TABLE kanban_config(
         id TEXT,
         color TEXT NOT NULL,
         status_id INTEGER NOT NULL,
         PRIMARY KEY(id),
         FOREIGN KEY(status_id) REFERENCES status(id)
      );

      CREATE TABLE ticket_status(
         id TEXT,
         insert_date TEXT NOT NULL,
         ticket_id INTEGER NOT NULL,
         status_id INTEGER NOT NULL,
         PRIMARY KEY(id),
         FOREIGN KEY(ticket_id) REFERENCES ticket(id),
         FOREIGN KEY(status_id) REFERENCES status(id)
      );

      INSERT INTO status (id, label, label_mg) VALUES
        (1, 'New', 'Vaovao'),
        (2, 'In progress (assigned)', 'Efa manao'),
        (3, 'Closed', 'Vita');

      INSERT INTO kanban_config (id, color, status_id) VALUES
        ('1', '#3B82F6', 1),
        ('2', '#F59E0B', 2),
        ('3', '#10B981', 3);
    `);

    return {
      success: true,
      message: 'Base de données sqlite réinitialisée avec succès',
    };
  },
};