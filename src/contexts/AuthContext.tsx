import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { AuthUser } from "../lib/types";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: SupabaseUser | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    username: string,
    metadata?: Record<string, string>
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        // Fetch user profile from database or create if it doesn't exist (OAuth)
        fetchOrCreateUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchOrCreateUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setUser(data as AuthUser);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrCreateUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Try to fetch existing profile
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (data) {
        setUser(data as AuthUser);
      } else if (error) {
        // If profile doesn't exist, create one for OAuth users
        const username =
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name ||
          supabaseUser.email?.split("@")[0] ||
          "User";

        const { data: newProfile, error: insertError } = await supabase
          .from("user")
          .insert({
            id: supabaseUser.id,
            username,
            profile_pic: supabaseUser.user_metadata?.avatar_url || "",
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating user profile:", insertError);
        } else if (newProfile) {
          setUser(newProfile as AuthUser);
        }
      }
    } catch (error) {
      console.error("Error in fetchOrCreateUserProfile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return { success: false, error: "이메일과 비밀번호를 입력해주세요." };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return {
            success: false,
            error: "이메일 또는 비밀번호가 올바르지 않습니다.",
          };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        await fetchUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: "로그인에 실패했습니다." };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "로그인 중 오류가 발생했습니다." };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // OAuth will redirect, so we return success
      return { success: true };
    } catch (error) {
      console.error("Google login error:", error);
      return { success: false, error: "Google 로그인 중 오류가 발생했습니다." };
    }
  };

  const signup = async (
    email: string,
    password: string,
    username: string,
    metadata?: Record<string, string>
  ) => {
    try {
      if (!email || !password || !username) {
        return { success: false, error: "모든 필드를 입력해주세요." };
      }

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            ...metadata,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create user profile in database
        const { error: profileError } = await supabase.from("user").insert({
          id: data.user.id,
          username,
          from: metadata?.from || "0",
          profile_pic: metadata?.profile_pic || "",
          friend_group: metadata?.friend_group || "0",
        });

        if (profileError) {
          console.error("Error creating user profile:", profileError);
          return { success: false, error: "프로필 생성에 실패했습니다." };
        }

        return { success: true };
      }

      return { success: false, error: "회원가입에 실패했습니다." };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "회원가입 중 오류가 발생했습니다." };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSupabaseUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        login,
        loginWithGoogle,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
