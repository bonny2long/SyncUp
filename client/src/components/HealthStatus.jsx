import React, { useEffect, useState } from "react";

export default function HealthStatus() {
  const [status, setStatus] = useState("checking");
  const [dbStatus, setDbStatus] = useState("");
  const [timestamp, setTimestamp] = useState("");

  async function fetchHealth() {
    try {
      const res = await fetch("http://localhost:5000/api/health");
      const data = await res.json();

      if (res.ok && data.status === "ok") {
        setStatus("connected");
        setDbStatus(data.database);
        setTimestamp(data.timestamp);
      } else {
        setStatus("error");
        setDbStatus("disconnected");
      }
    } catch (err) {
      console.error("Health check failed:", err);
      setStatus("error");
      setDbStatus("unreachable");
    }
  }

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 rounded-2xl shadow bg-surface border border-border w-fit text-center">
      <h2 className="text-lg font-semibold mb-2 text-neutral-dark">
        Backend Health
      </h2>

      {status === "connected" ? (
        <div className="text-green-600 font-medium">
          🟢 {dbStatus}
          <div className="text-xs text-gray-500 mt-1">
            Last checked: {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>
      ) : status === "error" ? (
        <div className="text-red-600 font-medium">🔴 {dbStatus}</div>
      ) : (
        <div className="text-yellow-500 font-medium">⏳ Checking...</div>
      )}
    </div>
  );
}
