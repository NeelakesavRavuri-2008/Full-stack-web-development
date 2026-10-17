import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { TelemetryPoint } from "./useBioreactorSocket";

interface ChartsProps {
  data: TelemetryPoint[];
}

export function TelemetryCharts({ data }: ChartsProps) {
  // Format timestamps for chart axis display
  const chartData = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], {
      minute: "2-digit",
      second: "2-digit",
    }),
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Temperature Chart */}
      <div className="rounded-2xl border border-green-800 bg-gray-900 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <h4 className="font-semibold text-white">Temperature (°C)</h4>
          <span className="text-xs text-green-400">Target: 37.0°C</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
              <YAxis domain={[36, 38]} stroke="#6b7280" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", borderColor: "#166534" }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* pH Level Chart */}
      <div className="rounded-2xl border border-green-800 bg-gray-900 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <h4 className="font-semibold text-white">pH Level</h4>
          <span className="text-xs text-emerald-400">Target: 6.80</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
              <YAxis domain={[6.6, 7.0]} stroke="#6b7280" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", borderColor: "#166534" }}
              />
              <Line
                type="monotone"
                dataKey="ph"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dissolved Oxygen Chart */}
      <div className="rounded-2xl border border-green-800 bg-gray-900 p-5 shadow-sm md:col-span-2">
        <div className="flex items-center justify-between pb-4">
          <h4 className="font-semibold text-white">Dissolved Oxygen (%)</h4>
          <span className="text-xs text-teal-400">Target: &gt; 60%</span>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
              <YAxis domain={[65, 80]} stroke="#6b7280" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", borderColor: "#166534" }}
              />
              <Line
                type="monotone"
                dataKey="dissolvedOxygen"
                stroke="#2dd4bf"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}