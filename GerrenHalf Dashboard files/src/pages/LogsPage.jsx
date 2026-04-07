import { useDeferredValue, useEffect, useState } from "react";
import { api } from "../lib/api";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const deferredSearch = useDeferredValue(search);

  async function loadLogs() {
    try {
      const params = new URLSearchParams();
      if (deferredSearch) {
        params.set("search", deferredSearch);
      }

      const result = await api(`/api/logs?${params.toString()}`);
      setLogs(result);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 10000);
    return () => clearInterval(interval);
  }, [deferredSearch]);

  return (
    <main className="page-shell">
      <section className="glass-panel panel-content">
        <div className="panel-header">
          <div>
            <h2>Audit Logs</h2>
            <p>Centralized bot and dashboard events, auto-refreshed every 10 seconds.</p>
          </div>
          <div className="row">
            <input
              aria-label="Search logs"
              placeholder="Search action, actor, guild..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ minWidth: 260 }}
            />
            <button className="button-ghost" onClick={loadLogs} type="button">
              Refresh Now
            </button>
          </div>
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        <div className="table-list">
          {logs.length ? logs.map((log) => (
            <article className="log-item" key={log._id}>
              <div className="log-item-header">
                <div className="stack" style={{ gap: 6 }}>
                  <strong>{log.action}</strong>
                  <div className="helper">{log.message}</div>
                </div>
                <div className="badge-row">
                  <span className={`status-pill${log.level === "error" ? " danger" : log.level === "warn" ? " warm" : ""}`}>
                    {log.level}
                  </span>
                  <span className="status-pill">{log.source}</span>
                </div>
              </div>

              <div className="row space-between">
                <span className="helper">
                  Actor: {log.actor?.displayName || log.actor?.discordId || "System"} | Server: {log.guild?.name || "N/A"}
                </span>
                <span className="helper mono">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            </article>
          )) : <div className="empty-state">No logs visible for your role.</div>}
        </div>
      </section>
    </main>
  );
}
