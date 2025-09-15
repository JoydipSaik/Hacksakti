import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ASHAReport from './ASHAReport';
import Dashboard from './Dashboard';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{fontFamily:'sans-serif', padding:16}}>
        <header style={{display:'flex', gap:12, marginBottom:12}}>
          <h2>SCHMEWS Prototype</h2>
          <nav>
            <Link to="/">Dashboard</Link> {' | '} <Link to="/report">ASHA Report</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard api={API} />} />
          <Route path="/report" element={<ASHAReport api={API} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
