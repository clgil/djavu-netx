"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { AppRole, Profile } from "@/lib/types";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "CLIENT" | "GESTOR" | "ADMIN";
}

interface AuthContextType {
  user: AuthUser | null;
  session: { user: AuthUser } | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  isManager: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapRole(role: AuthUser["role"]): AppRole {
  if (role === "ADMIN" || role === "GESTOR") return "sales_manager";
  return "customer";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMe = async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const data = await res.json();
    setUser(data.user ?? null);
    setIsLoading(false);
  };

  useEffect(() => {
    loadMe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      return { error: new Error(payload.error || "No se pudo iniciar sesión") };
    }

    await loadMe();
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: fullName, email, password }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      return { error: new Error(payload.error || "No se pudo registrar") };
    }

    await loadMe();
    return { error: null };
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  const refreshProfile = async () => {
    await loadMe();
  };

  const role = user ? mapRole(user.role) : null;
  const profile = user
    ? ({
        id: user.id,
        user_id: user.id,
        full_name: user.name,
        phone: null,
        address: null,
        city: null,
        postal_code: null,
        country: "Cuba",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Profile)
    : null;

  const value = useMemo(
    () => ({
      user,
      session: user ? { user } : null,
      profile,
      role,
      isLoading,
      isManager: user?.role === "ADMIN" || user?.role === "GESTOR",
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, role, profile, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
