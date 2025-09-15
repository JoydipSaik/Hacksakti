const express = require('express');
const router = express.Router();
const db = require('../db');
const { checkSensorForAlert } = require('./alerts');

// POST /api/sensors (sensor sends telemetry)
router.post('/', async (req, res) => {
  try {
    const { sensor_id, village_id, turbidity, pH, temperature, chlorine, battery } = req.body;
    const q = `INSERT INTO sensor_readings(sensor_id, village_id, turbidity, pH, temperature, chlorine, battery)
               VALUES($1,$2,$3,$4,$5,$6) RETURNING *`;
    const values = [sensor_id || 'sim1', village_id || null, turbidity || null, pH || null, temperature || null, chlorine || null];
    const r = await db.query(q, values);
    await checkSensorForAlert(r.rows[0]);
    res.json({ success: true, reading: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 500');
    res.json({ success: true, readings: r.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
