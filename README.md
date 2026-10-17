[project_readme.md](https://github.com/user-attachments/files/33587345/project_readme.md)
# BioTech-React: Smart Bioreactor IoT Telemetry & Analytics Platform

An end-to-end full-stack IoT telemetry application designed for industrial bioreactor monitoring. This platform ingests real-time bioreactor metrics (Temperature, pH, Dissolved Oxygen, Agitation) over MQTT, bridges the pipeline to connected React web clients via Socket.io WebSockets, persists historical telemetry in PostgreSQL, and offers historical query visualization.

---

## Architecture Overview

```text
+-------------------+        MQTT         +---------------------------------------+
|   Mock Sensor     | -----------------> |              Node.js Server           |
| (mock-sensor.ts)  |                     |  - Express REST API (/api/v1/...)     |
+-------------------+                     |  - MQTT Ingestion Pipeline            |
                                          |  - Socket.io Real-time WebSocket Hub  |
                                          |  - PostgreSQL Pool & Schema Migrator  |
                                          +-------------------+-------------------+
                                                              |
                                     +------------------------+------------------------+
                                     | WebSocket / REST                                | Parameterized SQL
                                     v                                                 v
                     +-------------------------------+                 +-------------------------------+
                     |     React + Vite Frontend     |                 |     PostgreSQL Database       |
                     |  - Tailwind CSS Lab UI        |                 |  - Database: biotech_db       |
                     |  - Recharts Live Waveforms    |                 |  - Table: telemetry_records   |
                     |  - Historical DB View Toggle  |                 +-------------------------------+
                     +-------------------------------+
```

---

## Tech Stack & Dependencies

### Backend (`server/`)
- **Runtime & Language**: Node.js, TypeScript, `tsx`
- **Web Framework**: Express (`cors`, `express.json`)
- **Networking**: `mqtt`, `socket.io`, `http`
- **Database**: PostgreSQL (`pg` connection pool)
- **Environment**: `dotenv`

### Frontend (`client/`)
- **Framework & Build**: React 18 / 19, Vite, TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: Recharts (dynamic ResponsiveContainer time-series waveforms)
- **Networking**: `socket.io-client`

---

## Directory Structure

```text
biotech-fermentation/
├── server/
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── db.ts              # PostgreSQL connection pool & table migration
│       ├── index.ts           # Express REST API, MQTT subscriber & Socket.io bridge
│       └── mock-sensor.ts     # Virtual telemetry generator & MQTT publisher
└── client/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx            # Main layout, auth shell, and dashboard state management
        ├── TelemetryCharts.tsx# Recharts multi-waveform visualizer
        └── useBioreactorSocket.ts # Custom WebSocket hook for real-time telemetry
```

---

## Environment Variables (`server/.env`)

Ensure your `server/.env` file is configured with your database and broker settings:

```env
PORT=4000
DATABASE_URL=postgres://postgres:your_password@localhost:5432/biotech_db
MQTT_BROKER=mqtt://test.mosquitto.org:1883
MQTT_TOPIC=biotech/br01/telemetry
```

---

## How to Run the Application (Step-by-Step)

To run the entire system, open **3 separate terminal windows**.

### Terminal 1: Start the Backend Bridge & Database Server
```powershell
cd C:\etc\fswd-project\biotech-fermentation\server
npm run dev
```
**Expected Output:**
```text
[DB] Connected to PostgreSQL & telemetry table initialized.
[Express] Bridge & History server running on port 4000
[Bridge] Connected to MQTT broker: mqtt://test.mosquitto.org:1883
[Bridge] Subscribed to topic: biotech/br01/telemetry
```

---

### Terminal 2: Start the Mock Sensor Publisher
```powershell
cd C:\etc\fswd-project\biotech-fermentation\server
npm run sensor
```
**Expected Output:**
```text
[Sensor] Connected to MQTT broker: mqtt://test.mosquitto.org:1883
[Sensor] Published -> Temp: 37.04 °C | pH: 6.81 | DO: 72.3 % | Agitation: 451 RPM
```

---

### Terminal 3: Start the React Frontend
```powershell
cd C:\etc\fswd-project\biotech-fermentation\client
npm run dev
```
* Open your browser and navigate to: `http://localhost:5173`

---

## Features & Verification

1. **Lab Authentication & Overview**: Click **Open Live Dashboard** or log in with credentials to access the central monitoring console.
2. **Real-Time Stream Waveforms**: In default **Live Stream** mode, WebSocket packets stream incoming telemetry into real-time cards and 60-second rolling Recharts time-series waveforms.
3. **Persisted Historical View**: 
   - Click the **Load DB History** button.
   - The application invokes `GET /api/v1/fermenters/BR-01/history?limit=60`.
   - The waveform displays the records saved in PostgreSQL.
4. **Database Verification (pgAdmin 4)**:
   - Navigate to: `Servers` → `PostgreSQL` → `Databases` → `biotech_db` → `Schemas` → `public` → `Tables`.
   - Right-click `telemetry_records` → **View/Edit Data** → **All Rows** to view raw stored records.
