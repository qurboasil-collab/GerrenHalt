import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function RealmPage() {
  const [settings, setSettings] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [channels, setChannels] = useState([]);
  const [form, setForm] = useState({
    realmName: "",
    guildId: "",
    channelId: "",
    channelName: ""
  });
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [settingsData, guildData] = await Promise.all([
        api("/api/system/settings"),
        api("/api/guilds")
      ]);

      setSettings(settingsData);
      setGuilds(guildData);
      setForm((current) => ({
        ...current,
        realmName: settingsData.realmName || "",
        guildId: settingsData.logChannel?.guildId || guildData[0]?.guildId || "",
        channelId: settingsData.logChannel?.channelId || "",
        channelName: settingsData.logChannel?.channelName || ""
      }));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function loadChannels(guildId) {
    if (!guildId) {
      setChannels([]);
      return;
    }

    try {
      const result = await api(`/api/guilds/${guildId}/channels`);
      setChannels(result);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveRealmName() {
    try {
      await api("/api/system/realm", {
        method: "PATCH",
        body: JSON.stringify({ realmName: form.realmName })
      });
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveLogChannel() {
    const selectedChannel = channels.find((channel) => channel.id === form.channelId);

    try {
      await api("/api/system/log-channel", {
        method: "PATCH",
        body: JSON.stringify({
          guildId: form.guildId,
          channelId: form.channelId,
          channelName: selectedChannel?.name || form.channelName
        })
      });
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (form.guildId) {
      loadChannels(form.guildId);
    }
  }, [form.guildId]);

  return (
    <main className="page-shell">
      <section className="glass-panel panel-content">
        <div className="panel-header">
          <div>
            <h2>Realm Control</h2>
            <p>Main Server Owner and Bot Owner tools for realm identity and secret log routing.</p>
          </div>
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        <div className="card-grid">
          <article className="list-card">
            <div className="stack">
              <div>
                <strong>Realm Name</strong>
                <div className="helper">Shown across the dashboard and backend overview responses.</div>
              </div>
              <div className="field">
                <label htmlFor="realm-name">Realm Name</label>
                <input
                  id="realm-name"
                  value={form.realmName}
                  onChange={(event) => setForm((current) => ({ ...current, realmName: event.target.value }))}
                />
              </div>
              <div className="button-row">
                <button className="button" onClick={saveRealmName} type="button">
                  Save Realm Name
                </button>
              </div>
            </div>
          </article>

          <article className="list-card">
            <div className="stack">
              <div>
                <strong>Secret Log Channel</strong>
                <div className="helper">
                  Bot and dashboard logs are forwarded here with clean embeds and zero allowed mentions.
                </div>
              </div>

              <div className="field">
                <label>Server</label>
                <select
                  value={form.guildId}
                  onChange={(event) => setForm((current) => ({ ...current, guildId: event.target.value, channelId: "" }))}
                >
                  <option value="">Select server</option>
                  {guilds.map((guild) => (
                    <option key={guild.guildId} value={guild.guildId}>
                      {guild.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Channel</label>
                <select
                  value={form.channelId}
                  onChange={(event) => setForm((current) => ({ ...current, channelId: event.target.value }))}
                >
                  <option value="">Select channel</option>
                  {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      #{channel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="button-row">
                <button className="button-secondary" onClick={saveLogChannel} type="button">
                  Save Log Channel
                </button>
              </div>

              <div className="helper">
                Current log channel: {settings?.logChannel?.channelName ? `#${settings.logChannel.channelName}` : "Not configured"}
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
