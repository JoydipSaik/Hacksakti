import React, { useState } from 'react';
import axios from 'axios';

export default function ASHAReport({ api }) {
  const [villageId, setVillageId] = useState(1);
  const [reporterId, setReporterId] = useState('asha-1');
  const [diarrhoea, setDiarrhoea] = useState(0);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        reporter_id: reporterId,
        village_id: Number(villageId),
        cases_count: Number(diarrhoea),
        symptoms_json: { diarrhoea: Number(diarrhoea) },
        notes
      };
      const r = await axios.post(`${api}/api/reports`, payload);
      if (r.data.success) {
        setMessage('Submitted ✓');
        setDiarrhoea(0);
        setNotes('');
      } else {
        setMessage('Error submitting');
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error');
    }
  };

  return (
    <div style={{maxWidth:600}}>
      <h3>ASHA / Field report</h3>
      <form onSubmit={submit}>
        <label>Village ID:
          <input value={villageId} onChange={e=>setVillageId(e.target.value)} />
        </label>
        <br/>
        <label>Reporter ID:
          <input value={reporterId} onChange={e=>setReporterId(e.target.value)} />
        </label>
        <br/>
        <label>Diarrhoea cases (24h):
          <input type="number" value={diarrhoea} onChange={e=>setDiarrhoea(e.target.value)} min="0" />
        </label>
        <br/>
        <label>Notes:
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} />
        </label>
        <br/>
        <button type="submit">Send report</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
