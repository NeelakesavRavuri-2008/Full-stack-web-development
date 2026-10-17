import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import mqtt from "mqtt";
import * as dotenv from "dotenv";
import { pool, initDb } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// REST Health Check & Vessel Metadata (CO-4)
app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/api/v1/fermenters", (_req: Request, res: Response) => {
  res.json([
    {
      id: "BR-01",
      name: "Bioreactor BR-01",
      batch: "B-024",
      culture: "E. coli",
      status: "Online",
    },
  ]);
});

// CO-6: Parameterized Historical Telemetry Endpoint
app.get("/api/v1/fermenters/:id/history", async (req: Request, res: Response) => {
  const vesselId = req.params.id;
  const limit = parseInt((req.query.limit as string) || "60", 10);

  try {
    const result = await pool.query(
      `SELECT vessel_id AS "vesselId", 
              timestamp, 
              CAST(temperature AS FLOAT) AS temperature, 
              CAST(ph AS FLOAT) AS ph, 
              CAST(dissolved_oxygen AS FLOAT) AS "dissolvedOxygen", 
              agitation, 
              status
       FROM telemetry_records 
       WHERE vessel_id = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [vesselId, limit]
    );

    // Reverse to chronological order for charts
    res.json(result.rows.reverse());
  } catch (err) {
    console.error("[DB] Failed to fetch history:", err);
    res.status(500).json({ error: "Failed to retrieve historical telemetry" });
  }
});

// MQTT to WebSocket & Database Pipeline (CO-5 & CO-6)
const MQTT_BROKER = process.env.MQTT_BROKER || "mqtt://test.mosquitto.org:1883";
const TOPIC = process.env.MQTT_TOPIC || "biotech/br01/telemetry";
const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on("connect", () => {
  console.log(`[Bridge] Connected to MQTT broker: ${MQTT_BROKER}`);
  mqttClient.subscribe(TOPIC, (err) => {
    if (!err) {
      console.log(`[Bridge] Subscribed to topic: ${TOPIC}`);
    }
  });
});

mqttClient.on("message", async (_topic: string, message: Buffer) => {
  try {
    const data = JSON.parse(message.toString());

    // 1. Broadcast live telemetry packet over WebSockets
    io.emit("telemetry:update", data);

    // 2. Persist to PostgreSQL database using parameterized query (CO-6)
    await pool.query(
      `INSERT INTO telemetry_records 
        (vessel_id, timestamp, temperature, ph, dissolved_oxygen, agitation, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        data.vesselId,
        data.timestamp,
        data.temperature,
        data.ph,
        data.dissolvedOxygen,
        data.agitation,
        data.status,
      ]
    );
  } catch (error) {
    console.error("[Pipeline] Error processing message:", error);
  }
});

io.on("connection", (socket: Socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, async () => {
  await initDb();
  console.log(`[Express] Bridge & History server running on port ${PORT}`);
});