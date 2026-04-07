import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOverview() {
    setLoading(true);
    setError("");

    try {
      const overview = await api("/api/dashboard/overview");
      setData(overview);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
  }, []);

  return (
    <main className="page-shell">
      <section className="glass-panel panel-content">
        <div className="panel-header">
          <div>
            <h2>{data?.realmName || "Realm overview"}</h2>
            <p>Live realm summary across visible servers, votes, and protected activity streams.</p>
          </div>
          <button className="button-ghost" onClick={loadOverview} type="button">
            Refresh
          </button>
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        <div className="metrics-grid">
          <article className="metric-card">
            <div className="metric-label">Visible Servers</div>
            <div className="metric-value">{loading ? "..." : data?.metrics?.visibleGuilds ?? 0}</div>
            <div className="metric-foot">Servers visible to your current role.</div>
          </article>
          <article className="metric-card">
            <div className="metric-label">Verified Servers</div>
            <div className="metric-value">{loading ? "..." : data?.metrics?.verifiedGuilds ?? 0}</div>
            <div className="metric-foot">Servers connected to the realm relay.</div>
          </article>
          <article className="metric-card">
            <div className="metric-label">Participation Enabled</div>
            <div className="metric-value">{loading ? "..." : data?.metrics?.participatingGuilds ?? 0}</div>
            <div className="metric-foot">Servers currently receiving announcements and votes.</div>
          </article>
          <article className="metric-card">
            <div className="metric-label">Blacklisted Servers</div>
            <div className="metric-value">{loading ? "..." : data?.metrics?.blacklistedGuilds ?? 0}</div>
            <div className="metric-foot">Servers blocked from the realm by the Bot Owner.</div>
          </article>
        </div>
      </section>

      <section className="two-col">
        <div className="glass-panel panel-content">
          <div className="panel-header">
            <div>
              <h3>Realm Servers</h3>
              <p>Visibility and verification status across your accessible network.</p>
            </div>
          </div>

          <div className="table-list">
            {data?.guilds?.length ? data.guilds.map((guild) => (
              <article className="server-card" key={guild.guildId}>
                <div className="server-card-header">
                  <div>
                    <strong>{guild.name}</strong>
                    <div className="helper mono">{guild.guildId}</div>
                  </div>
                  <div className="badge-row">
                    <span className={`status-pill${guild.verified ? " success" : ""}`}>
                      {guild.verified ? "Verified" : "Not Verified"}
                    </span>
                    <span className={`status-pill${guild.participationEnabled ? "" : " danger"}`}>
                      {guild.participationEnabled ? "Participation On" : "Participation Off"}
                    </span>
                  </div>
                </div>
                <div className="helper">
                  Announcement channel: {guild.announcementChannelName ? `#${guild.announcementChannelName}` : "Not configured"}
                </div>
              </article>
            )) : <div className="empty-state">No visible servers yet.</div>}
          </div>
        </div>

        <div className="stack">
          <section className="glass-panel panel-content">
            <div className="panel-header">
              <div>
                <h3>Active Votes</h3>
                <p>Current realm decisions still collecting votes.</p>
              </div>
            </div>
            <div className="table-list">
              {data?.votes?.length ? data.votes.map((vote) => (
                <article className="vote-card" key={vote._id}>
                  <div className="vote-card-header">
                    <strong>{vote.title}</strong>
                    <span className="status-pill warm">{vote.status}</span>
                  </div>
                  <div className="helper">{vote.description}</div>
                </article>
              )) : <div className="empty-state">No active votes at the moment.</div>}
            </div>
          </section>

          <section className="glass-panel panel-content">
            <div className="panel-header">
              <div>
                <h3>Recent Logs</h3>
                <p>Recent audit trail entries visible to your role.</p>
              </div>
            </div>
            <div className="table-list">
              {data?.logs?.length ? data.logs.map((log) => (
                <article className="log-item" key={log._id}>
                  <div className="log-item-header">
                    <strong>{log.action}</strong>
                    <span className="helper mono">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="helper">{log.message}</div>
                </article>
              )) : <div className="empty-state">No logs available for this role.</div>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
