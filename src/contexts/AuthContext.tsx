import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../lib/types";
import { getUser } from "../lib/data/user";

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function comparePasswords(
  dbPassword: number | string,
  inputPassword: string
): boolean {
  if (typeof dbPassword === "number") {
    return dbPassword === parseInt(inputPassword);
  } else if (typeof dbPassword === "string") {
    return dbPassword === inputPassword;
  }
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Validate input
      if (!username || !password) {
        return { success: false, error: "이름과 생년월일을 입력해주세요." };
      }

      if (password.length !== 6) {
        return { success: false, error: "생년월일은 6자리로 입력해주세요." };
      }

      if (!/^\d+$/.test(password)) {
        return { success: false, error: "생년월일은 숫자만 입력해주세요." };
      }

      // Fetch user from database
      const fetchedUser = await getUser(username);

      if (!fetchedUser) {
        return { success: false, error: "존재하지 않는 사용자입니다." };
      }

      // Verify password
      const passwordsMatch = comparePasswords(fetchedUser.password, password);
      if (!passwordsMatch) {
        return { success: false, error: "생년월일이 올바르지 않습니다." };
      }

      // Store user in state and localStorage
      setUser(fetchedUser);
      localStorage.setItem("user", JSON.stringify(fetchedUser));

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "로그인 중 오류가 발생했습니다." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
