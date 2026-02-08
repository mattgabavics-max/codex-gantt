import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  LoginRequestBody,
  LoginResponseBody,
  RegisterRequestBody,
  RegisterResponseBody
} from "../api/types";
import { api, setAuthToken, setUnauthorizedHandler } from "../api/api";

type AuthUser = {
  id: string;
  email: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  login: (payload: LoginRequestBody) => Promise<void>;
  register: (payload: RegisterRequestBody) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload?.id || !payload?.email) return null;
    return { id: payload.id, email: payload.email };
  } catch {
    return null;
  }
}

const STORAGE_KEY = "codex_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setToken(stored);
      setAuthToken(stored);
      setUser(decodeToken(stored));
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
      setAuthToken(null);
      localStorage.removeItem(STORAGE_KEY);
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      login: async (payload) => {
        const res = await api.post<LoginResponseBody>("/api/auth/login", payload);
        const nextToken = res.data.token;
        setToken(nextToken);
        setAuthToken(nextToken);
        setUser(decodeToken(nextToken));
        localStorage.setItem(STORAGE_KEY, nextToken);
      },
      register: async (payload) => {
        const res = await api.post<RegisterResponseBody>("/api/auth/register", payload);
        const nextToken = res.data.token;
        setToken(nextToken);
        setAuthToken(nextToken);
        setUser(decodeToken(nextToken));
        localStorage.setItem(STORAGE_KEY, nextToken);
      },
      logout: () => {
        setToken(null);
        setUser(null);
        setAuthToken(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function ProtectedRoute({
  children,
  fallback = null
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return <>{fallback}</>;
  return <>{children}</>;
}
