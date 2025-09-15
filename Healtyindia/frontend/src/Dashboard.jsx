import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard({ api }) {
  const [alerts, setAlerts] = useState([]);
  const [readings, setReadings] = useState([]);
  const [reports, setReports] = useState([]);

  async function fetchAll(){
    try {
      const [a,r,s] = await Promise.all([
        axios.get(`${api}/api/alerts`),
        axios.get(`${api}/api/reports`),
        axios.get(`${api}/api/sensors`)
      ]);
      setAlerts(a.data.alerts || []);
      setReports(r.data.reports || []);
      setReadings(s.data.readings || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(()=>{ fetchAll(); const t = setInterval(fetchAll, 8000); return ()=>clearInterval(t); }, []);

  return (
    <div>
      <h3>Dashboard</h3>
      <section>
        <h4>Active Alerts (most recent)</h4>
        <ul>
          {alerts.length===0 && <li>No alerts</li>}
          {alerts.map(a => (
            <li key={a.id}><b>{a.alert_type}</b> | village {a.region_id} | {new Date(a.timestamp).toLocaleString()} | score: {Number(a.risk_score).toFixed(2)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4>Recent Sensor Readings</h4>
        <table border="1" cellPadding="6">
          <thead><tr><th>time</th><th>village</th><th>turb</th><th>chlorine</th></tr></thead>
          <tbody>
            {readings.slice(0,10).map(r=>(
              <tr key={r.id}>
                <td>{new Date(r.timestamp).toLocaleString()}</td>
                <td>{r.village_id}</td>
                <td>{r.turbidity}</td>
                <td>{r.chlorine}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h4>Recent Reports</h4>
        <ul>
          {reports.slice(0,10).map(r=>(
            <li key={r.id}>village {r.village_id} — cases: {r.cases_count} — {new Date(r.timestamp).toLocaleString()}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4>Quick simulate (sensor)</h4>
        <Simulate api={api} onDone={fetchAll} />
      </section>
    </div>
  );
}

function Simulate({ api, onDone }) {
  const [village, setVillage] = useState(1);
  const [turbidity, setTurbidity] = useState(10);
  const [chlorine, setChlorine] = useState(0.5);
  const [msg, setMsg] = useState('');
  const send = async ()=> {
    try {
      const r = await fetch(`${api}/api/simulate-sensor`, {
        method: 'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ village_id: Number(village), turbidity: Number(turbidity), chlorine: Number(chlorine) })
      });
      const j = await r.json();
      setMsg(j.success ? 'Simulated' : 'Error');
      onDone();
    } catch (err) { setMsg('Network err'); }
  };
  return (
    <div>
      <label>Village: <input value={village} onChange={e=>setVillage(e.target.value)} /></label>
      <label> Turbidity: <input value={turbidity} onChange={e=>setTurbidity(e.target.value)} /></label>
      <label> Chlorine: <input value={chlorine} onChange={e=>setChlorine(e.target.value)} /></label>
      <button onClick={send}>Send</button>
      <div>{msg}</div>
    </div>
  );
}
