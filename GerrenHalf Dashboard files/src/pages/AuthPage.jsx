import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { buildBackendPath } from "../lib/api";

export default function AuthPage({ mode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const oauthError = new URLSearchParams(location.search).get("error");

  const isRegister = mode === "register";
  const heading = useMemo(
    () => ({
      title: isRegister ? "Register Dashboard Access" : "Enter The Realm",
      copy: isRegister
      ? "Create a secure dashboard account, then link Discord later if you need server-aware control."
      : "Use Discord OAuth2 or your dashboard credentials to enter the control surface."
    }),
    [isRegister]
  );
  const errorMessage = error || (oauthError === "oauth_state" ? "Discord login expired or returned with an invalid state. Try again." : "");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isRegister) {
        await register(form);
      } else {
        await login({
          email: form.email,
          password: form.password
        });
      }

      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <section className="auth-brand">
          <div className="stack">
            <div className="status-pill">GerrenHalt Realm</div>
            <h1>Connected sovereignty for verified Discord servers.</h1>
            <p>
              Realm announcements, law votes, protected admin controls, and a dashboard that changes
              shape with each role.
            </p>
          </div>

          <div className="stack">
            <div className="glass-panel panel-content">
              <h3 style={{ marginTop: 0 }}>Role model</h3>
              <div className="badge-row">
                <span className="status-pill">Bot Owner</span>
                <span className="status-pill warm">Main Server Owner</span>
                <span className="status-pill">Lord</span>
                <span className="status-pill">Verified Owner</span>
                <span className="status-pill">Member</span>
                <span className="status-pill">Visitor</span>
              </div>
            </div>
            <p className="helper">
              Discord sign-in is recommended because it automatically syncs server ownership and realm access.
            </p>
          </div>
        </section>

        <section className="auth-form">
          <div>
            <div className="status-pill">Secure access</div>
            <h2 style={{ marginBottom: 6 }}>{heading.title}</h2>
            <p className="subtle">{heading.copy}</p>
          </div>

          {errorMessage ? <div className="error-box">{errorMessage}</div> : null}

          <a className="button" href={buildBackendPath("/api/auth/discord")}>
            Continue With Discord OAuth2
          </a>

          <div className="auth-divider">or use local credentials</div>

          <form className="stack" onSubmit={handleSubmit}>
            {isRegister ? (
              <div className="field">
                <label htmlFor="displayName">Display Name</label>
                <input
                  id="displayName"
                  value={form.displayName}
                  onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                  required
                />
              </div>
            ) : null}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </div>

            <button className="button" disabled={submitting} type="submit">
              {submitting ? "Working..." : isRegister ? "Create Account" : "Login"}
            </button>
          </form>

          <p className="helper">
            {isRegister ? "Already have an account?" : "Need a local dashboard account?"}{" "}
            <Link to={isRegister ? "/login" : "/register"} style={{ color: "var(--accent)" }}>
              {isRegister ? "Login" : "Register"}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
