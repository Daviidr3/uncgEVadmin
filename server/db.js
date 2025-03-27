const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file location
const dbPath = path.join(__dirname, 'database.sqlite');

// Connect to SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create tables
db.serialize(() => {
    // Chargers table
    db.run(`
        CREATE TABLE IF NOT EXISTS chargers (
            charger_id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT NOT NULL,
            status TEXT CHECK(status IN ('available', 'in_use', 'out_of_service')),
            last_serviced_date TEXT
        )
    `);

    // Maintenance reports table with new columns: assigned_to, resolution_note
    db.run(`
        CREATE TABLE IF NOT EXISTS maintenance_reports (
            report_id INTEGER PRIMARY KEY AUTOINCREMENT,
            charger_id INTEGER NOT NULL,
            reported_by TEXT NOT NULL,
            issue_description TEXT NOT NULL,
            status TEXT CHECK(status IN ('pending', 'in_progress', 'resolved')) DEFAULT 'pending',
            assigned_to TEXT,
            resolution_note TEXT,
            reported_at TEXT DEFAULT CURRENT_TIMESTAMP,
            resolved_at TEXT,
            FOREIGN KEY (charger_id) REFERENCES chargers(charger_id) ON DELETE CASCADE
        )
    `);
});

module.exports = db;
