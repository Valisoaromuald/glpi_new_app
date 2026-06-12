const express = require('express');
const cors = require('cors');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const db = new DatabaseSync('./database.db');

app.use(cors());
app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT DEFAULT '',
    label_mg TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS request_type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT not null DEFAULT 'incident'
  );
    CREATE TABLE IF NOT EXISTS item_model(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT not null default ''
    );
    CREATE TABLE IF NOT EXISTS item_type(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT not null default ''
    );
    
  CREATE TABLE IF NOT EXISTS kanban_config (
    status_id INTEGER UNIQUE REFERENCES status(id) ON DELETE CASCADE,
    color TEXT DEFAULT '#ffffff'
  );
  INSERT OR IGNORE INTO status (id, label, label_mg) VALUES
    (1, 'New', 'Vaovao'),
    (2, 'In Progress', 'Efa manao'),
    (3, 'Closed', 'Vita');

    

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    description TEXT,
    statut_id INTEGER DEFAULT 1 REFERENCES status(id),
    priority_id  integer,
    request_type_id integer REFERENCES request_type(id),
    glpi_cost DECIMAL,
    super_cost DECIMAL
  );
    CREATE TABLE IF NOT EXISTS item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT DEFAULT '',
    item_model_id INTEGER REFERENCES item_model(id) on delete cascade,
    item_type_id INTEGER REFERENCES item_type(id) on delete cascade
  );
  CREATE TABLE IF NOT EXISTS ticket_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER REFERENCES item(id) on delete cascade,
    ticket_id INTEGER REFERENCES ticket(id) on delete cascade
  );

  INSERT OR IGNORE INTO kanban_config (status_id, color) VALUES
    (1, '#e3f2fd'),
    (2, '#fff3e0'),
    (3, '#e8f5e9');

`);

// --- Statuts (labels + couleurs + nb tickets) ---
app.get('/api/kanban-config', (req, res) => {
    const rows = db.prepare(`
    SELECT s.id, s.label, s.label_mg, k.color
    FROM status s
    JOIN kanban_config k ON k.status_id = s.id
    ORDER BY s.id
  `).all();
    res.json(rows);
});

// Met à jour couleur ET label_mg pour un statut donné
app.put('/api/kanban-config/:statusId', (req, res) => {
    const { color, label_mg } = req.body.input;
    const statusId = req.params.statusId;

    if (color !== undefined) {
        db.prepare('UPDATE kanban_config SET color = ? WHERE status_id = ?')
            .run(color, statusId);
    }
    if (label_mg !== undefined) {
        db.prepare('UPDATE status SET label_mg = ? WHERE id = ?')
            .run(label_mg, statusId);
    }
    res.json({ success: true });
});
// --- Tickets ---
app.get('/api/tickets', (req, res) => {
    const tickets = db.prepare(`
    SELECT t.*, s.label AS status_label, s.label_mg AS status_label_mg
    FROM tickets t
    JOIN status s ON s.id = t.statut_id
  `).all();
    res.json(tickets);
});

app.get('/api/tickets/:id', (req, res) => {
    const ticket = db.prepare(`
    SELECT t.*, s.label AS status_label, s.label_mg AS status_label_mg
    FROM tickets t
    JOIN status s ON s.id = t.statut_id
    WHERE t.id = ?
  `).get(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket introuvable' });
    res.json(ticket);
});

app.post('/api/tickets', (req, res) => {
    console.log(req.body)
    const { titre, description } = req.body.data;
    const result = db.prepare(`
    INSERT INTO tickets (titre, description, statut_id)
    VALUES (?, ?, 1)
  `).run(titre, description);
    res.json({ id: result.lastInsertRowid });
});

// Changer le statut d'un ticket (drag & drop)
app.patch('/api/tickets/:id/status', (req, res) => {
    const { statut_id } = req.body.input;
    db.prepare('UPDATE tickets SET statut_id = ? WHERE id = ?')
        .run(statut_id, req.params.id);
    res.json({ success: true });
});

// Récupérer la config (couleurs + labels)
app.get('/api/kanban-config', (req, res) => {
    const rows = db.prepare(`
    SELECT s.id, s.label, s.label_mg, k.color
    FROM status s
    JOIN kanban_config k ON k.status_id = s.id
    ORDER BY s.id
  `).all();
    res.json(rows);
});

app.put('/api/kanban-config/:statusId', (req, res) => {
    const { color, label_mg } = req.body.input;
    const statusId = req.params.statusId;

    if (color !== undefined) {
        db.prepare('UPDATE kanban_config SET color = ? WHERE status_id = ?')
            .run(color, statusId);
    }
    if (label_mg !== undefined) {
        db.prepare('UPDATE status SET label_mg = ? WHERE id = ?')
            .run(label_mg, statusId);
    }
    res.json({ success: true });
});

app.listen(3000, () => console.log('✅ Backend running on http://localhost:3000'));