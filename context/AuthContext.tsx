"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, getMe } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("ledger_token");
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    getMe(stored)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("ledger_token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function signIn(newToken: string, newUser: User) {
    localStorage.setItem("ledger_token", newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function signOut() {
    localStorage.removeItem("ledger_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signOut, updateUser: setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
