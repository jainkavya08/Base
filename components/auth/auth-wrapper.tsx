"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { AuthScreen } from "./auth-screen";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshSession: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    // Development-only bypass for local UI testing
    if (
      typeof window !== "undefined" &&
      window.location.hostname === "localhost" &&
      !window.location.search.includes("login=true")
    ) {
      setUser({ id: "dev-bypass-user-id", name: "Development User", email: "dev@localhost" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/session.php", { credentials: 'same-origin' });
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to check session", e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout.php", { credentials: 'same-origin' });
      setUser(null);
    } catch (e) {
      console.error("Failed to logout", e);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-accent-yellow border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthContext.Provider value={{ user, loading, refreshSession, logout }}>
        <div className="fixed inset-0 z-[100] bg-canvas overflow-y-auto">
          <AuthScreen onAuthenticated={refreshSession} />
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
