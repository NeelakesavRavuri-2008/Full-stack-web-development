import { useState } from "react";
import { useBioreactorSocket } from "./useBioreactorSocket";
import { TelemetryCharts } from "./TelemetryCharts";

const features = [
  ["🌡️", "Temperature", "Monitor fermentation temperature."],
  ["🧪", "pH Level", "Track acidity and alkalinity."],
  ["💨", "Oxygen", "Monitor dissolved oxygen levels."],
  ["⚙️", "Agitation", "Track reactor mixing speed."],
];

function Header({ login }: { login: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-green-800 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <b className="text-xl font-bold text-green-400">BioTech-React</b>
          <p className="text-xs text-gray-400">Smart Bioreactor System</p>
        </div>
        <nav className="hidden gap-6 text-sm text-gray-300 md:flex">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
        </nav>
        <button
          onClick={login}
          className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800"
        >
          Sign in
        </button>
      </div>
    </header>
  );
}

function Home({ login }: { login: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black text-gray-200">
      <Header login={login} />
      <section id="home" className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
              Automated Bioreactor Technology
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-6xl">
              Smart fermentation
              <span className="block text-green-400">monitoring made simple.</span>
            </h1>
            <p className="mt-6 max-w-xl leading-7 text-gray-300">
              Stream live telemetry from MQTT brokers straight into interactive dashboards.
            </p>
            <button
              onClick={login}
              className="mt-7 rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
            >
              Open Live Dashboard
            </button>
          </div>
          <div className="overflow-hidden rounded-3xl border border-green-800 bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white">BR-01 Stream Architecture</h3>
            <p className="mt-2 text-sm text-gray-400">
              MQTT Sensor Broker → Node.js Bridge → Socket.io Stream → React Recharts.
            </p>
            <div className="mt-6 space-y-3 font-mono text-xs text-green-400">
              <div className="rounded bg-black/60 p-2.5">BROKER: test.mosquitto.org:1883</div>
              <div className="rounded bg-black/60 p-2.5">TOPIC: biotech/br01/telemetry</div>
              <div className="rounded bg-black/60 p-2.5">PROTOCOL: Full-Duplex WebSockets</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-gray-900/50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-400">Features</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Monitored Critical Parameters</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([icon, title, text]) => (
              <article key={title} className="rounded-2xl border border-green-800 bg-gray-900/50 p-6 text-center">
                <div className="text-4xl">{icon}</div>
                <h3 className="mt-4 font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm text-gray-400">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-black via-green-950 to-black p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onLogin();
        }}
        className="w-full max-w-md rounded-2xl border border-green-800 bg-gray-900/90 p-8 shadow-xl"
      >
        <p className="text-sm font-semibold text-green-400">Lab Authentication</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Sign in</h2>
        <label className="mt-6 block text-sm text-gray-300">Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="operator@lab.biotech"
          className="mt-2 w-full rounded-xl border border-green-800 bg-gray-800 p-3 text-white outline-none focus:border-green-500"
        />
        <label className="mt-4 block text-sm text-gray-300">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-2 w-full rounded-xl border border-green-800 bg-gray-800 p-3 text-white outline-none focus:border-green-500"
        />
        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800"
        >
          Enter Control Center
        </button>
      </form>
    </main>
  );
}

function Dashboard({ logout }: { logout: () => void }) {
  const { currentData, history, isConnected } = useBioreactorSocket();
  const [viewMode, setViewMode] = useState<"live" | "history">("live");
  const [dbHistory, setDbHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const fetchHistoricalData = async () => {
  setLoadingHistory(true);
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/fermenters/BR-01/history?limit=60`);
    const data = await res.json();
    setDbHistory(data);
    setViewMode("history");
  } catch (err) {
    console.error("Failed to load historical data", err);
  } finally {
    setLoadingHistory(false);
  }
};

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black text-gray-200">
      <header className="border-b border-green-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-400">
              Bioreactor Monitoring System
            </p>
            <h1 className="text-xl font-bold text-white">BR-01 Telemetry Hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isConnected
                  ? "bg-green-950 text-green-400 border border-green-700"
                  : "bg-red-950 text-red-400 border border-red-700"
              }`}
            >
              ● {isConnected ? "Stream Live" : "Bridge Disconnected"}
            </span>
            <button
              onClick={logout}
              className="rounded-lg border border-green-800 px-4 py-1.5 text-sm text-green-400 hover:bg-gray-800"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        {/* Dynamic Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-green-800 bg-gray-900 p-5 shadow-sm">
            <p className="text-sm text-gray-400">Temperature</p>
            <p className="mt-3 text-2xl font-bold text-green-400">
              {currentData ? `${currentData.temperature} °C` : "--"}
            </p>
            <p className="mt-3 text-xs text-green-500">● 36.8 - 37.2 Target</p>
          </article>

          <article className="rounded-2xl border border-green-800 bg-gray-900 p-5 shadow-sm">
            <p className="text-sm text-gray-400">pH Level</p>
            <p className="mt-3 text-2xl font-bold text-green-400">
              {currentData ? currentData.ph : "--"}
            </p>
            <p className="mt-3 text-xs text-green-500">● 6.75 - 6.85 Target</p>
          </article>

          <article className="rounded-2xl border border-green-800 bg-gray-900 p-5 shadow-sm">
            <p className="text-sm text-gray-400">Dissolved Oxygen</p>
            <p className="mt-3 text-2xl font-bold text-green-400">
              {currentData ? `${currentData.dissolvedOxygen} %` : "--"}
            </p>
            <p className="mt-3 text-xs text-green-500">● Nominal saturation</p>
          </article>

          <article className="rounded-2xl border border-green-800 bg-gray-900 p-5 shadow-sm">
            <p className="text-sm text-gray-400">Agitation Speed</p>
            <p className="mt-3 text-2xl font-bold text-green-400">
              {currentData ? `${currentData.agitation} RPM` : "--"}
            </p>
            <p className="mt-3 text-xs text-green-500">● Impeller Active</p>
          </article>
        </div>

        {/* View Mode Switching Controls (CO-6) */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">
              {viewMode === "live" ? "Live Stream Waveforms" : "Persisted Historical View"}
            </h3>
            <p className="text-xs text-gray-400">
              {viewMode === "live"
                ? `Rolling 60s stream window (${history.length} samples)`
                : `Retrieved from PostgreSQL database (${dbHistory.length} saved records)`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("live")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                viewMode === "live"
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Live Stream
            </button>
            <button
              onClick={fetchHistoricalData}
              disabled={loadingHistory}
              className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                viewMode === "history"
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {loadingHistory ? "Loading..." : "Load DB History"}
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-4">
          <TelemetryCharts data={viewMode === "live" ? history : dbHistory} />
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState<"home" | "login" | "dashboard">("home");

  if (page === "login") return <Login onLogin={() => setPage("dashboard")} />;
  if (page === "dashboard") return <Dashboard logout={() => setPage("home")} />;
  return <Home login={() => setPage("login")} />;
}