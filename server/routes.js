const express = require('express');
const client = require('./db'); // Import PostgreSQL client
const router = express.Router();

// Get all chargers
router.get('/chargers', async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM chargers");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get active chargers count
router.get('/chargers/active-count', async (req, res) => {
    try {
        const result = await client.query("SELECT COUNT(*) AS active_chargers FROM chargers WHERE status = 'available'");
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new charger (CREATE)
router.post('/chargers', async (req, res) => {
    const { location, status, last_serviced_date } = req.body;
    try {
        const result = await client.query(
            "INSERT INTO chargers (location, status, last_serviced_date) VALUES ($1, $2, $3) RETURNING *",
            [location, status, last_serviced_date]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a charger (UPDATE)
router.put('/chargers/:id', async (req, res) => {
    const { location, status, last_serviced_date } = req.body;
    const { id } = req.params;
    try {
        const result = await client.query(
            "UPDATE chargers SET location = $1, status = $2, last_serviced_date = $3 WHERE charger_id = $4 RETURNING *",
            [location, status, last_serviced_date, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Charger not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a charger (DELETE)
router.delete('/chargers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query("DELETE FROM chargers WHERE charger_id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Charger not found" });
        }
        res.json({ message: "Charger deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* 
Maintenance reporting.
*/

// Get all maintenance reports
router.get('/maintenance', async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM maintenance_reports");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get unresolved maintenance reports (for dashboard)
router.get('/maintenance/unresolved', async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM maintenance_reports WHERE status != 'resolved'");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new maintenance report (CREATE)
router.post('/maintenance', async (req, res) => {
    const { charger_id, reported_by, issue_description } = req.body;
    try {
        const result = await client.query(
            "INSERT INTO maintenance_reports (charger_id, reported_by, issue_description) VALUES ($1, $2, $3) RETURNING *",
            [charger_id, reported_by, issue_description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark a maintenance issue as resolved (UPDATE)
router.put('/maintenance/:id/resolve', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query(
            "UPDATE maintenance_reports SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE report_id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.json({ message: "Issue resolved successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a maintenance report (DELETE)
router.delete('/maintenance/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query("DELETE FROM maintenance_reports WHERE report_id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.json({ message: "Report deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Assign a maintenance report to a technician (UPDATE)
router.put('/maintenance/:id/assign', async (req, res) => {
    const { id } = req.params;
    const { assigned_to } = req.body;
    try {
        const result = await client.query(
            "UPDATE maintenance_reports SET status = 'in_progress', assigned_to = $1 WHERE report_id = $2 RETURNING *",
            [assigned_to, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.json({ message: "Ticket assigned successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get open tickets count
router.get('/maintenance/open-tickets-count', async (req, res) => {
    try {
        const result = await client.query("SELECT COUNT(*) AS ticket_count FROM maintenance_reports WHERE status = 'in_progress'");
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get unresolved issues count
router.get('/maintenance/unresolved-count', async (req, res) => {
    try {
        const result = await client.query("SELECT COUNT(*) AS issue_count FROM maintenance_reports WHERE status = 'pending'");
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
