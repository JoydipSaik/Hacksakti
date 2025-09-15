const express = require('express');
const router = express.Router();
const db = require('../db');
const { checkReportForAlert } = require('./alerts');

// POST /api/reports
router.post('/', async (req, res) => {
  try {
    const { reporter_id, village_id, timestamp, symptoms_json, cases_count, notes } = req.body;
    const q = `INSERT INTO reports(reporter_id,village_id,timestamp,symptoms_json,cases_count,notes)
              VALUES($1,$2,$3,$4,$5,$6) RETURNING *`;
    const values = [reporter_id || 'unknown', village_id || null, timestamp || new Date(), symptoms_json || {}, cases_count || 0, notes || ''];
    const r = await db.query(q, values);
    // Check rules to generate alert
    await checkReportForAlert(r.rows[0]);
    res.json({ success: true, report: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM reports ORDER BY timestamp DESC LIMIT 200');
    res.json({ success: true, reports: r.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
