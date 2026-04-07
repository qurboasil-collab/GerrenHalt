import { useEffect, useState } from "react";
import { api } from "../lib/api";

const ROLE_OPTIONS = [
  "BOT_OWNER",
  "MAIN_SERVER_OWNER",
  "LORD",
  "VERIFIED_SERVER_OWNER",
  "MEMBER",
  "VISITOR"
];

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      const result = await api("/api/system/users");
      setUsers(result);
      setDrafts(
        Object.fromEntries(
          result.map((user) => [
            user._id,
            {
              role: user.role,
              managedGuildIds: (user.managedGuildIds || []).join(", ")
            }
          ])
        )
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveUser(userId) {
    const draft = drafts[userId];
    try {
      await api(`/api/system/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          role: draft.role,
          managedGuildIds: draft.managedGuildIds
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean)
        })
      });
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <main className="page-shell">
      <section className="glass-panel panel-content">
        <div className="panel-header">
          <div>
            <h2>Admin Role Control</h2>
            <p>Bot Owner only. Promote, restrict, and assign dashboard authority without touching the database directly.</p>
          </div>
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        <div className="table-list">
          {users.length ? users.map((user) => (
            <article className="server-card" key={user._id}>
              <div className="server-card-header">
                <div>
                  <strong>{user.displayName || user.email || user.discordId}</strong>
                  <div className="helper mono">{user.discordId || user.email || user._id}</div>
                </div>
                <span className="status-pill">{user.role}</span>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Role</label>
                  <select
                    value={drafts[user._id]?.role || user.role}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [user._id]: {
                          ...current[user._id],
                          role: event.target.value
                        }
                      }))
                    }
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Managed Guild IDs</label>
                  <input
                    value={drafts[user._id]?.managedGuildIds || ""}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [user._id]: {
                          ...current[user._id],
                          managedGuildIds: event.target.value
                        }
                      }))
                    }
                    placeholder="guild-id-1, guild-id-2"
                  />
                </div>
              </div>

              <div className="button-row" style={{ marginTop: 14 }}>
                <button className="button" onClick={() => saveUser(user._id)} type="button">
                  Save Role
                </button>
              </div>
            </article>
          )) : <div className="empty-state">No dashboard users registered yet.</div>}
        </div>
      </section>
    </main>
  );
}
