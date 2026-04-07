import { useAuth } from "../hooks/useAuth";

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <main className="page-shell">
      <section className="glass-panel panel-content">
        <div className="panel-header">
          <div>
            <h2>Account</h2>
            <p>Your dashboard profile, mapped role, and managed server scope.</p>
          </div>
        </div>

        <div className="two-col">
          <article className="list-card">
            <div className="stack">
              <div className="row">
                {user?.avatarUrl ? (
                  <img className="avatar" src={user.avatarUrl} alt={user.displayName} />
                ) : (
                  <div className="avatar">{user?.displayName?.slice(0, 2)?.toUpperCase()}</div>
                )}
                <div>
                  <strong>{user?.displayName}</strong>
                  <div className="helper">{user?.email || user?.discordId || "Dashboard identity"}</div>
                </div>
              </div>

              <div className="badge-row">
                <span className="status-pill">{user?.role}</span>
                {(user?.authProviders || []).map((provider) => (
                  <span className="status-pill warm" key={provider}>
                    {provider}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <article className="list-card">
            <div className="stack">
              <strong>Managed Guild IDs</strong>
              {user?.managedGuildIds?.length ? user.managedGuildIds.map((guildId) => (
                <div className="helper mono" key={guildId}>
                  {guildId}
                </div>
              )) : <div className="empty-state">This account does not currently manage any guilds.</div>}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
