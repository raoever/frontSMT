import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setAuthToken, setOnUnauthorized } from "../lib/apiClient";

type User = { id: string; name: string; email: string };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isReady: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const STORAGE_KEY = "app.auth.v1";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.token && parsed?.user) {
          setUser(parsed.user);
          setToken(parsed.token);
          setAuthToken(parsed.token);
        }
      }
    } catch {
      /* ignore */
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = (tk: string, usr: User) => {
    setUser(usr);
    setToken(tk);
    setAuthToken(tk);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: tk, user: usr }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
    if (window.location.pathname !== "/") {
      window.location.replace("/");
    }
  };

  useEffect(() => {
    setOnUnauthorized(() => logout);
    return () => setOnUnauthorized(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ user, token, isReady, login, logout }),
    [user, token, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};
