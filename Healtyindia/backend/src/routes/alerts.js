const express = require('express');
const router = express.Router();
const db = require('../db');
const uuid = require('uuid');

// Utility: simple rules + insert to alerts table
async function createAlert({ region_id, alert_type, risk_score=0, triggered_by='system', metadata={} }) {
  const q = `INSERT INTO alerts(region_id, alert_type, risk_score, triggered_by, metadata)
             VALUES($1,$2,$3,$4,$5) RETURNING *`;
  const values = [region_id || null, alert_type, risk_score, triggered_by, metadata];
  const r = await db.query(q, values);
  console.log('ALERT CREATED:', r.rows[0]);
  return r.rows[0];
}

// Sensor-based rule: turbidity > 50 OR chlorine < 0.2
async function checkSensorForAlert(reading) {
  const turb = reading.turbidity;
  const chl = reading.chlorine;
  if ((turb !== null && turb > 50) || (chl !== null && chl < 0.2)) {
    await createAlert({
      region_id: reading.village_id,
      alert_type: 'environmental',
      risk_score: (turb || 0)/50 + (0.2 - (chl || 0)),
      triggered_by: 'sensor',
      metadata: reading
    });
  }
}

// Report-based rule: >=5 diarrhoea cases in 48h OR cases_count >=5
async function checkReportForAlert(reportRow) {
  const symptoms = reportRow.symptoms_json || {};
  const cases = reportRow.cases_count || 0;
  // if explicit cases >=5
  if (cases >= 5) {
    await createAlert({
      region_id: reportRow.village_id,
      alert_type: 'syndromic',
      risk_score: cases,
      triggered_by: 'report',
      metadata: reportRow
    });
    return;
  }
  // quick windowed check: count reports with diarrhoea in last 48 hrs
  const q = `SELECT SUM((reports->>'cases_count')::int) as total_cases
             FROM (SELECT cases_count::text as reports FROM reports WHERE village_id=$1 AND timestamp > now() - interval '48 hours') t`;
  try {
    const r = await db.query('SELECT SUM(cases_count) as total FROM reports WHERE village_id=$1 AND timestamp > now() - interval \'48 hours\'', [reportRow.village_id]);
    const total = Number((r.rows[0] && r.rows[0].total) || 0);
    if (total >= 5) {
      await createAlert({
        region_id: reportRow.village_id,
        alert_type: 'syndromic',
        risk_score: total,
        triggered_by: 'report-window',
        metadata: { total }
      });
    }
  } catch (err) {
    console.error('window check err', err);
  }
}

router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 200');
    res.json({ success: true, alerts: r.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
module.exports.checkSensorForAlert = checkSensorForAlert;
module.exports.checkReportForAlert = checkReportForAlert;
