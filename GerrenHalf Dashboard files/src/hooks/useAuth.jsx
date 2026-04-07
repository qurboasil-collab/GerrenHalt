import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);

    try {
      const session = await api("/api/auth/session");
      startTransition(() => {
        setUser(session.authenticated ? session.user : null);
      });
    } catch {
      startTransition(() => {
        setUser(null);
      });
    } finally {
      setLoading(false);
    }
  }

  async function login(payload) {
    const session = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    startTransition(() => {
      setUser(session.user);
    });

    return session;
  }

  async function register(payload) {
    const session = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    startTransition(() => {
      setUser(session.user);
    });

    return session;
  }

  async function logout() {
    await api("/api/auth/logout", {
      method: "POST"
    });

    startTransition(() => {
      setUser(null);
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({
      authenticated: Boolean(user),
      loading,
      user,
      login,
      logout,
      refresh,
      register
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
