const express = require('express');
const db = require('./db');
const router = express.Router();


router.get('/chargers', (req, res) => {
    db.all("SELECT * FROM chargers", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Get active chargers count
router.get('/chargers/active-count', (req, res) => {
    db.get("SELECT COUNT(*) AS active_chargers FROM chargers WHERE status = 'available'", [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(row);
        }
    });
});

// Add a new charger (CREATE)
router.post('/chargers', (req, res) => {
    const { location, status, last_serviced_date } = req.body;

    db.run(
        "INSERT INTO chargers (location, status, last_serviced_date) VALUES (?, ?, ?)",
        [location, status, last_serviced_date],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ charger_id: this.lastID, location, status, last_serviced_date });
            }
        }
    );
});

// Update a charger (UPDATE)
router.put('/chargers/:id', (req, res) => {
    const { location, status, last_serviced_date } = req.body;
    const { id } = req.params;

    db.run(
        "UPDATE chargers SET location = ?, status = ?, last_serviced_date = ? WHERE charger_id = ?",
        [location, status, last_serviced_date, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ message: "Charger not found" });
            } else {
                res.json({ message: "Charger updated successfully", changes: this.changes });
            }
        }
    );
});

// Delete a charger (DELETE)
router.delete('/chargers/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM chargers WHERE charger_id = ?", id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ message: "Charger not found" });
        } else {
            res.json({ message: "Charger deleted successfully", changes: this.changes });
        }
    });
});

/* ==============================
   🔧 MAINTENANCE REPORTS ROUTES (CRUD)
   ============================== */

// Get all maintenance reports
router.get('/maintenance', (req, res) => {
    db.all("SELECT * FROM maintenance_reports", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Get only unresolved maintenance reports (for dashboard)
router.get('/maintenance/unresolved', (req, res) => {
    db.all("SELECT * FROM maintenance_reports WHERE status != 'resolved'", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Add a new maintenance report (CREATE)
router.post('/maintenance', (req, res) => {
    const { charger_id, reported_by, issue_description } = req.body;

    db.run(
        "INSERT INTO maintenance_reports (charger_id, reported_by, issue_description) VALUES (?, ?, ?)",
        [charger_id, reported_by, issue_description],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ report_id: this.lastID, charger_id, reported_by, issue_description, status: 'pending' });
            }
        }
    );
});

// Mark a maintenance issue as resolved (UPDATE)
router.put('/maintenance/:id/resolve', (req, res) => {
    const { id } = req.params;

    db.run(
        "UPDATE maintenance_reports SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE report_id = ?",
        [id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: "Issue resolved successfully" });
            }
        }
    );
});

// Delete a maintenance report (DELETE)
router.delete('/maintenance/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM maintenance_reports WHERE report_id = ?", id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Report deleted successfully" });
        }
    });
});

router.put('/maintenance/:id/assign', (req, res) => {
    const { id } = req.params;
    const { assigned_to } = req.body;

    db.run(
        `UPDATE maintenance_reports 
         SET status = 'in_progress', assigned_to = ? 
         WHERE report_id = ?`,
        [assigned_to, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: "Ticket assigned successfully" });
            }
        }
    );
});
router.get('/maintenance/open-tickets-count', (req, res) => {
    db.get("SELECT COUNT(*) AS ticket_count FROM maintenance_reports WHERE status = 'in_progress'", [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});
router.get('/maintenance/unresolved-count', (req, res) => {
    db.get("SELECT COUNT(*) AS issue_count FROM maintenance_reports WHERE status = 'pending'", [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});



module.exports = router;
