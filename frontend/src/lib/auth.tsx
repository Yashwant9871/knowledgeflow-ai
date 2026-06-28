import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role, User } from "./types";
import { apiFetch } from "./api";

const STORAGE_KEY = "kf_session_v1";

export interface Session {
  user: User;
  token: string;
  loggedInAt: string;
}

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  login: (email: string, role?: Role, password?: string) => Promise<Session>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.token && parsed.user) {
          setSession(parsed as Session);
        } else {
          // Clean legacy mock formats
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login: AuthContextValue["login"] = async (email, _role, password = "demo-password") => {
    // 1. Fetch JWT token
    const tokenRes = await apiFetch<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // 2. Temporarily write token so me query is authorized
    const tempSession = { token: tokenRes.access_token };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tempSession));

    // 3. Fetch user profile
    const userRes = await apiFetch<User>("/auth/me");

    // 4. Save full session details
    const next: Session = {
      user: userRes,
      token: tokenRes.access_token,
      loggedInAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    return next;
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function hasRole(session: Session | null, ...roles: Role[]) {
  return !!session && roles.includes(session.user.role);
}

