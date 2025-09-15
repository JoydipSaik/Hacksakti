-- minimal schema
CREATE TABLE IF NOT EXISTS villages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS water_sources (
  id SERIAL PRIMARY KEY,
  village_id INT REFERENCES villages(id),
  name TEXT,
  type TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id SERIAL PRIMARY KEY,
  sensor_id TEXT,
  village_id INT,
  timestamp TIMESTAMP DEFAULT now(),
  turbidity DOUBLE PRECISION,
  pH DOUBLE PRECISION,
  temperature DOUBLE PRECISION,
  chlorine DOUBLE PRECISION,
  battery DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_id TEXT,
  village_id INT,
  timestamp TIMESTAMP DEFAULT now(),
  symptoms_json JSONB,
  cases_count INT DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  region_id INT,
  timestamp TIMESTAMP DEFAULT now(),
  alert_type TEXT,
  risk_score DOUBLE PRECISION,
  triggered_by TEXT,
  metadata JSONB
);
