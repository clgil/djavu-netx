"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { Profile, AppRole } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface AuthContextType {
  user: User | null;
  session: Session | null;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data: profileData } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
    if (profileData) {
      setProfile(profileData as Profile);
    }

    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", userId).single();
    if (roleData) {
      setRole(roleData.role as AppRole);
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, authSession) => {
      setSession(authSession);
      setUser(authSession?.user ?? null);

      if (authSession?.user) {
        setTimeout(() => {
          fetchProfile(authSession.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: error as Error };
    }

    if (!data?.session?.user) {
      return { error: new Error("No se pudo crear la sesión de usuario.") };
    }

    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });

    return { error: (error as Error) ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = useMemo(
    () => ({ user, session, profile, role, isLoading, isManager: role === "sales_manager", signIn, signUp, signOut, refreshProfile }),
    [user, session, profile, role, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
