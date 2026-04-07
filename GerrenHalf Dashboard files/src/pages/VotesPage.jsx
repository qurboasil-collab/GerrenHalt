import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";

export default function VotesPage() {
  const { user } = useAuth();
  const [votes, setVotes] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    durationMinutes: 60
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadVotes() {
    try {
      const result = await api("/api/votes");
      setVotes(result);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api("/api/votes", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setForm({
        title: "",
        description: "",
        durationMinutes: 60
      });
      await loadVotes();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClose(voteId) {
    try {
      await api(`/api/votes/${voteId}/close`, {
        method: "POST"
      });
      await loadVotes();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadVotes();
  }, []);

  return (
    <main className="page-shell">
      {user?.access?.canCreateVotes ? (
        <section className="glass-panel panel-content">
          <div className="panel-header">
            <div>
              <h2>Create Realm Vote</h2>
              <p>High-trust roles can create a vote from the dashboard as well as through the slash command.</p>
            </div>
          </div>

          {error ? <div className="error-box">{error}</div> : null}

          <form className="stack" onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="vote-title">Title</label>
                <input
                  id="vote-title"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="vote-duration">Duration (minutes)</label>
                <input
                  id="vote-duration"
                  min="5"
                  type="number"
                  value={form.durationMinutes}
                  onChange={(event) => setForm((current) => ({ ...current, durationMinutes: Number(event.target.value) }))}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="vote-description">Description</label>
              <textarea
                id="vote-description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                required
              />
            </div>

            <div className="button-row">
              <button className="button" disabled={submitting} type="submit">
                {submitting ? "Creating..." : "Create Vote"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="glass-panel panel-content">
        <div className="panel-header">
          <div>
            <h2>Vote History</h2>
            <p>All realm votes, including live decisions and closed outcomes.</p>
          </div>
          <button className="button-ghost" onClick={loadVotes} type="button">
            Refresh
          </button>
        </div>

        <div className="table-list">
          {votes.length ? votes.map((vote) => {
            const approveCount = vote.ballots?.filter((item) => item.choice === "approve").length || 0;
            const rejectCount = vote.ballots?.filter((item) => item.choice === "reject").length || 0;
            return (
              <article className="vote-card" key={vote._id}>
                <div className="vote-card-header">
                  <div>
                    <strong>{vote.title}</strong>
                    <div className="helper">{vote.description}</div>
                  </div>
                  <div className="badge-row">
                    <span className={`status-pill${vote.status === "passed" ? " success" : vote.status === "rejected" ? " danger" : " warm"}`}>
                      {vote.status}
                    </span>
                    <span className="status-pill">Approve {approveCount}</span>
                    <span className="status-pill">Reject {rejectCount}</span>
                  </div>
                </div>

                <div className="row space-between">
                  <span className="helper mono">Ends {new Date(vote.endsAt).toLocaleString()}</span>
                  {user?.access?.canCreateVotes && vote.status === "active" ? (
                    <button className="button-secondary" onClick={() => handleClose(vote._id)} type="button">
                      Close Vote
                    </button>
                  ) : null}
                </div>
              </article>
            );
          }) : <div className="empty-state">No votes recorded yet.</div>}
        </div>
      </section>
    </main>
  );
}
