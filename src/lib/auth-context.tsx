import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupaUser } from "@supabase/supabase-js";

export type UserRole = "student" | "teacher" | "admin";

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  cne?: string | null;
  filiere?: string | null;
  department?: string | null;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "student" | "teacher";
  cne?: string;
  filiere?: string;
  department?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (data: RegisterData) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchAppUser(supaUser: SupaUser): Promise<AppUser | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", supaUser.id)
    .single();

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", supaUser.id)
    .single();

  if (!profile || !roleData) return null;

  return {
    id: supaUser.id,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    role: roleData.role as UserRole,
    cne: profile.cne,
    filiere: profile.filiere,
    department: profile.department,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const appUser = await fetchAppUser(session.user);
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const appUser = await fetchAppUser(session.user);
        setUser(appUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  };

  const register = async (data: RegisterData): Promise<string | null> => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
        },
      },
    });

    if (error) return error.message;

    // Update profile with role-specific fields after the trigger creates it
    if (authData.user) {
      const updates: Record<string, string | null> = {};
      if (data.role === "student") {
        updates.cne = data.cne || null;
        updates.filiere = data.filiere || null;
      } else if (data.role === "teacher") {
        updates.department = data.department || null;
      }

      if (Object.keys(updates).length > 0) {
        // Small delay to ensure trigger has completed
        await new Promise(resolve => setTimeout(resolve, 500));
        await supabase.from("profiles").update(updates).eq("user_id", authData.user.id);
      }
    }

    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
