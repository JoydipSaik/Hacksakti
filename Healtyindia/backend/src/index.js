const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const reportsRoute = require('./routes/reports');
const sensorsRoute = require('./routes/sensors');
const alertsRoute = require('./routes/alerts');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// initialize DB schema at startup (simple)
const migrateSql = fs.readFileSync(__dirname + '/migrate.sql', 'utf8');
db.pool.query(migrateSql).then(()=>console.log('db migrated')).catch(err=>console.error('migrate err', err));

app.use('/api/reports', reportsRoute);
app.use('/api/sensors', sensorsRoute);
app.use('/api/alerts', alertsRoute);

// simple sensor simulator helper route (useful for demo)
app.post('/api/simulate-sensor', async (req, res) => {
  const { sensor_id='sim1', village_id=1, turbidity, pH, temperature, chlorine } = req.body;
  try {
    const r = await db.query(
      'INSERT INTO sensor_readings(sensor_id, village_id, turbidity, pH, temperature, chlorine) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [sensor_id, village_id, turbidity, pH, temperature, chlorine]
    );
    // trigger check
    const { checkSensorForAlert } = require('./routes/alerts');
    await checkSensorForAlert(r.rows[0]);
    res.json({ success: true, reading: r.rows[0] });
  } catch (err) {
    console.error(err); res.status(500).json({ success: false, err: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log('Backend listening on', PORT));
