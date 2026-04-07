import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function SystemPage() {
  const [runtime, setRuntime] = useState(null);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [runtimeData, settingsData] = await Promise.all([
        api("/api/system/runtime"),
        api("/api/system/settings")
      ]);

      setRuntime(runtimeData);
      setSettings(settingsData);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="page-shell">
      <section className="glass-panel panel-content">
        <div className="panel-header">
          <div>
            <h2>System Control</h2>
            <p>Bot Owner runtime view for bot health, gateway state, and protected system settings.</p>
          </div>
          <button className="button-ghost" onClick={loadData} type="button">
            Refresh
          </button>
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        <div className="metrics-grid">
          <article className="metric-card">
            <div className="metric-label">Bot Ready</div>
            <div className="metric-value">{runtime?.botReady ? "Yes" : "No"}</div>
          </article>
          <article className="metric-card">
            <div className="metric-label">Guild Count</div>
            <div className="metric-value">{runtime?.guildCount ?? 0}</div>
          </article>
          <article className="metric-card">
            <div className="metric-label">Gateway Status</div>
            <div className="metric-value mono">{runtime?.websocketStatus ?? "unknown"}</div>
          </article>
          <article className="metric-card">
            <div className="metric-label">Realm Name</div>
            <div className="metric-value" style={{ fontSize: "1.2rem" }}>{settings?.realmName || "GerrenHalt Realm"}</div>
          </article>
        </div>
      </section>
    </main>
  );
}
