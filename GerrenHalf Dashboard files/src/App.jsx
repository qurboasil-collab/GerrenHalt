import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import DashboardLayout from "./pages/DashboardLayout";
import LogsPage from "./pages/LogsPage";
import OverviewPage from "./pages/OverviewPage";
import RealmPage from "./pages/RealmPage";
import ServersPage from "./pages/ServersPage";
import SystemPage from "./pages/SystemPage";
import VotesPage from "./pages/VotesPage";

function SplashScreen({ message }) {
  return (
    <div className="screen-center">
      <div className="splash-orb" />
      <p>{message}</p>
    </div>
  );
}

function ProtectedRoute() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <SplashScreen message="Opening realm dashboard..." />;
  }

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <SplashScreen message="Checking session..." />;
  }

  return authenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function AccessRoute({ allow }) {
  const { user } = useAuth();

  return allow(user) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<OverviewPage />} />
          <Route path="/servers" element={<ServersPage />} />
          <Route path="/votes" element={<VotesPage />} />
          <Route path="/account" element={<AccountPage />} />

          <Route element={<AccessRoute allow={(user) => user?.access?.canAccessLogs} />}>
            <Route path="/logs" element={<LogsPage />} />
          </Route>

          <Route element={<AccessRoute allow={(user) => user?.access?.canAccessRealmControl || user?.access?.canManageRealm} />}>
            <Route path="/realm-control" element={<RealmPage />} />
          </Route>

          <Route element={<AccessRoute allow={(user) => user?.access?.canAccessSystemControl} />}>
            <Route path="/system-control" element={<SystemPage />} />
          </Route>

          <Route element={<AccessRoute allow={(user) => user?.access?.canAccessAdmin} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
