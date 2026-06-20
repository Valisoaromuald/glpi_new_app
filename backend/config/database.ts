import { DatabaseSync } from 'node:sqlite';

export const db = new DatabaseSync('./database/glpi.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS status(
   id INTEGER,
   label TEXT NOT NULL,
   label_mg TEXT,
   PRIMARY KEY(id)
);

CREATE TABLE  IF NOT EXISTS ticket(
   id INTEGER,
   glpi_id INTEGER,
   status_id INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(status_id) REFERENCES status(id)
);


CREATE TABLE IF NOT EXISTS ticket_cost(
   id INTEGER,
   cost_type TEXT,
   cost NUMERIC(20,4)  ,
   category TEXT,
   creation_date TEXT NOT NULL,
   item_id INTEGER NOT NULL,
   ticket_id INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(ticket_id) REFERENCES ticket(id)
);

CREATE TABLE IF NOT EXISTS kanban_config(
   id TEXT,
   color TEXT NOT NULL,
   status_id INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(status_id) REFERENCES status(id)
);

CREATE TABLE IF NOT EXISTS ticket_status(
   id TEXT,
   insert_date TEXT NOT NULL,
   ticket_id INTEGER NOT NULL,
   status_id INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(ticket_id) REFERENCES ticket(id),
   FOREIGN KEY(status_id) REFERENCES status(id)
);

INSERT OR IGNORE INTO status (id, label, label_mg) VALUES
  (1, 'New', 'Vaovao'),
  (2, 'In progress (assigned)', 'Efa manao'),
  (3, 'Closed', 'Vita');

INSERT OR IGNORE INTO kanban_config (id, color, status_id) VALUES
  ('1', '#3B82F6', 1),
  ('2', '#F59E0B', 2),
  ('3', '#10B981', 3);
`);

function shutdown() {
  db.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);