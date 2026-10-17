import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface TelemetryPoint {
  vesselId: string;
  timestamp: string;
  temperature: number;
  ph: number;
  dissolvedOxygen: number;
  agitation: number;
  status: string;
}

const SOCKET_SERVER_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export function useBioreactorSocket() {
  const [currentData, setCurrentData] = useState<TelemetryPoint | null>(null);
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io(SOCKET_SERVER_URL);

    socket.on("connect", () => {
      console.log("[WebSocket] Connected to BioTech backend bridge");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected from backend bridge");
      setIsConnected(false);
    });

    socket.on("telemetry:update", (point: TelemetryPoint) => {
      setCurrentData(point);

      // Maintain a rolling window of the last 60 data points (CO-3 canonical requirement)
      setHistory((prev) => {
        const next = [...prev, point];
        if (next.length > 60) {
          return next.slice(next.length - 60);
        }
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { currentData, history, isConnected };
}