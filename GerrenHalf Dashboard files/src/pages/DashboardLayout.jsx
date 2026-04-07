import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ALL_NAV_ITEMS = [
  { path: "/dashboard", label: "Overview", icon: "◈", allow: () => true },
  { path: "/servers", label: "Servers", icon: "▣", allow: () => true },
  { path: "/votes", label: "Votes", icon: "◌", allow: () => true },
  { path: "/logs", label: "Logs", icon: "⌁", allow: (user) => user?.access?.canAccessLogs },
  { path: "/realm-control", label: "Realm Control", icon: "◇", allow: (user) => user?.access?.canAccessRealmControl || user?.access?.canManageRealm },
  { path: "/system-control", label: "System Control", icon: "◎", allow: (user) => user?.access?.canAccessSystemControl },
  { path: "/admin", label: "Admin", icon: "◍", allow: (user) => user?.access?.canAccessAdmin },
  { path: "/account", label: "Account", icon: "◐", allow: () => true }
];

function getInitials(user) {
  const source = user?.displayName || user?.email || "GH";
  return source
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function DashboardLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = ALL_NAV_ITEMS.filter((item) => item.allow(user));

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-orb" />
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-title">GerrenHalt</div>
            <div className="sidebar-brand-subtitle">Realm dashboard</div>
          </div>
        </div>

        <nav className="sidebar-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
              to={item.path}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status-dot" />
          <span>Realm online</span>
        </div>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{location.pathname.replace("/", "").replace("-", " ") || "dashboard"}</h1>
            <p>Role-aware controls for announcements, voting, verification, and audit trails.</p>
          </div>

          <div className="topbar-user">
            {user?.avatarUrl ? (
              <img className="avatar" src={user.avatarUrl} alt={user.displayName} />
            ) : (
              <div className="avatar">{getInitials(user)}</div>
            )}

            <div>
              <div>{user?.displayName}</div>
              <div className="badge-row">
                <span className="status-pill">{user?.role}</span>
                {user?.managedGuildIds?.length ? (
                  <span className="status-pill warm">{user.managedGuildIds.length} managed servers</span>
                ) : null}
              </div>
            </div>

            <button className="button-ghost" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
