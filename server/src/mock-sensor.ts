import mqtt from "mqtt";

const BROKER_URL = "mqtt://test.mosquitto.org:1883";
const TOPIC = "biotech/br01/telemetry";

const client = mqtt.connect(BROKER_URL);

client.on("connect", () => {
  console.log(`[Sensor] Connected to MQTT broker: ${BROKER_URL}`);

  let temp = 37.0;
  let ph = 6.8;
  let doLevel = 72;
  let agitation = 450;

  setInterval(() => {
    // Introduce realistic fermentation fluctuation
    temp = +(37.0 + (Math.random() * 0.4 - 0.2)).toFixed(2);
    ph = +(6.8 + (Math.random() * 0.1 - 0.05)).toFixed(2);
    doLevel = +(72 + (Math.random() * 2 - 1)).toFixed(1);
    agitation = Math.floor(450 + (Math.random() * 6 - 3));

    const payload = {
      vesselId: "BR-01",
      timestamp: new Date().toISOString(),
      temperature: temp,
      ph: ph,
      dissolvedOxygen: doLevel,
      agitation: agitation,
      status: "Running",
    };

    client.publish(TOPIC, JSON.stringify(payload));
    console.log(`[Sensor] Published -> Temp: ${temp} °C | pH: ${ph} | DO: ${doLevel} % | Agitation: ${agitation} RPM`);
  }, 1000);
});

client.on("error", (err) => {
  console.error("[Sensor] MQTT Connection Error:", err);
});