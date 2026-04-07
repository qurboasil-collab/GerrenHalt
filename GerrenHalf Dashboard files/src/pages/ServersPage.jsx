import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";

export default function ServersPage() {
  const { user } = useAuth();
  const [guilds, setGuilds] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [channels, setChannels] = useState({});
  const [expandedGuildId, setExpandedGuildId] = useState("");
  const [error, setError] = useState("");
  const [busyGuildId, setBusyGuildId] = useState("");

  async function loadGuilds() {
    try {
      const result = await api("/api/guilds");
      setGuilds(result);
      setDrafts(
        Object.fromEntries(
          result.map((guild) => [
            guild.guildId,
            {
              announcementChannelId: guild.announcementChannelId || "",
              announcementChannelName: guild.announcementChannelName || "",
              participationEnabled: Boolean(guild.participationEnabled),
              blacklistReason: guild.blacklistReason || ""
            }
          ])
        )
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function loadChannels(guildId) {
    if (channels[guildId]) {
      return;
    }

    try {
      const result = await api(`/api/guilds/${guildId}/channels`);
      setChannels((current) => ({ ...current, [guildId]: result }));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveGuild(guildId) {
    const draft = drafts[guildId];
    const channelMatch = (channels[guildId] || []).find((channel) => channel.id === draft.announcementChannelId);

    try {
      await api(`/api/guilds/${guildId}`, {
        method: "PATCH",
        body: JSON.stringify({
          announcementChannelId: draft.announcementChannelId,
          announcementChannelName: channelMatch?.name || draft.announcementChannelName || "",
          participationEnabled: draft.participationEnabled
        })
      });
      await loadGuilds();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function runOwnerAction(guildId, action, body = {}) {
    setBusyGuildId(guildId);
    setError("");

    try {
      await api(`/api/guilds/${guildId}/${action}`, {
        method: "POST",
        body: JSON.stringify(body)
      });
      await loadGuilds();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyGuildId("");
    }
  }

  useEffect(() => {
    loadGuilds();
  }, []);

  return (
    <main className="page-shell">
      <section className="glass-panel panel-content">
        <div className="panel-header">
          <div>
            <h2>Server Configuration</h2>
            <p>Verified server owners manage their own realm configuration here. Higher roles can manage everything.</p>
          </div>
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        <div className="table-list">
          {guilds.length ? guilds.map((guild) => {
            const draft = drafts[guild.guildId] || {
              announcementChannelId: "",
              participationEnabled: false,
              blacklistReason: ""
            };
            const canManage = user?.access?.canManageAnyGuild || user?.managedGuildIds?.includes(guild.guildId);
            const isOwner = user?.role === "BOT_OWNER";

            return (
              <article className="server-card" key={guild.guildId}>
                <div className="server-card-header">
                  <div>
                    <strong>{guild.name}</strong>
                    <div className="helper mono">{guild.guildId}</div>
                  </div>
                  <div className="badge-row">
                    <span className={`status-pill${guild.verified ? " success" : ""}`}>
                      {guild.verified ? "Verified" : "Pending Verification"}
                    </span>
                    {guild.blacklisted ? (
                      <span className="status-pill danger">Blacklisted</span>
                    ) : null}
                    <span className={`status-pill${guild.participationEnabled ? "" : " danger"}`}>
                      {guild.participationEnabled ? "Participation On" : "Participation Off"}
                    </span>
                  </div>
                </div>

                <div className="helper">
                  Current channel: {guild.announcementChannelName ? `#${guild.announcementChannelName}` : "Not configured"}
                </div>
                {guild.blacklisted && guild.blacklistReason ? (
                  <div className="helper" style={{ marginTop: 8 }}>
                    Blacklist reason: {guild.blacklistReason}
                  </div>
                ) : null}

                {canManage ? (
                  <div className="stack" style={{ marginTop: 14 }}>
                    <button
                      className="button-ghost"
                      onClick={async () => {
                        const nextValue = expandedGuildId === guild.guildId ? "" : guild.guildId;
                        setExpandedGuildId(nextValue);
                        if (nextValue) {
                          await loadChannels(guild.guildId);
                        }
                      }}
                      type="button"
                    >
                      {expandedGuildId === guild.guildId ? "Hide controls" : "Manage server"}
                    </button>

                    {expandedGuildId === guild.guildId ? (
                      <div className="form-grid">
                        <div className="field">
                          <label>Announcement Channel</label>
                          <select
                            value={draft.announcementChannelId}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [guild.guildId]: {
                                  ...current[guild.guildId],
                                  announcementChannelId: event.target.value
                                }
                              }))
                            }
                          >
                            <option value="">Select a text channel</option>
                            {(channels[guild.guildId] || []).map((channel) => (
                              <option key={channel.id} value={channel.id}>
                                #{channel.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="field">
                          <label>Participation</label>
                          <select
                            value={draft.participationEnabled ? "enabled" : "disabled"}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [guild.guildId]: {
                                  ...current[guild.guildId],
                                  participationEnabled: event.target.value === "enabled"
                                }
                              }))
                            }
                          >
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        </div>
                      </div>
                    ) : null}

                    {expandedGuildId === guild.guildId ? (
                      <div className="button-row">
                        <button
                          className="button"
                          disabled={busyGuildId === guild.guildId || guild.blacklisted}
                          onClick={() => saveGuild(guild.guildId)}
                          type="button"
                        >
                          Save Changes
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="helper" style={{ marginTop: 14 }}>
                    View-only access for this role.
                  </div>
                )}

                {isOwner ? (
                  <div className="stack" style={{ marginTop: 16 }}>
                    <div className="helper">Owner-only realm controls</div>
                    <div className="field">
                      <label>Blacklist Reason</label>
                      <input
                        value={draft.blacklistReason || ""}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [guild.guildId]: {
                              ...current[guild.guildId],
                              blacklistReason: event.target.value
                            }
                          }))
                        }
                        placeholder="Reason for blacklisting"
                      />
                    </div>
                    <div className="button-row">
                      <button
                        className="button-secondary"
                        disabled={busyGuildId === guild.guildId || guild.verified}
                        onClick={() => runOwnerAction(guild.guildId, "verify")}
                        type="button"
                      >
                        Verify Server
                      </button>
                      <button
                        className="button-ghost"
                        disabled={busyGuildId === guild.guildId || !guild.verified}
                        onClick={() => runOwnerAction(guild.guildId, "unverify")}
                        type="button"
                      >
                        Unverify Server
                      </button>
                      <button
                        className="button-secondary"
                        disabled={busyGuildId === guild.guildId || guild.blacklisted}
                        onClick={() =>
                          runOwnerAction(guild.guildId, "blacklist", {
                            reason: draft.blacklistReason || "No reason provided."
                          })
                        }
                        type="button"
                      >
                        Blacklist Server
                      </button>
                      <button
                        className="button-ghost"
                        disabled={busyGuildId === guild.guildId || !guild.blacklisted}
                        onClick={() => runOwnerAction(guild.guildId, "unblacklist")}
                        type="button"
                      >
                        Remove Blacklist
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          }) : <div className="empty-state">No server data available yet.</div>}
        </div>
      </section>
    </main>
  );
}
