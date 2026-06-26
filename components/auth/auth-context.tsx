import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { login, register } from "@/api/auth";
import {
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
} from "@/components/auth/auth-storage";

type RegisterInput = {
  email: string;
  password: string;
  name: string;
  gender?: string;
};

type AuthContextValue = {
  isLoggedIn: boolean;
  isCheckingAuth: boolean;
  loginUser: (email: string, password: string) => Promise<{ access_token: string; user_id: string }>;
  registerUser: (input: RegisterInput) => Promise<{ access_token: string; user_id: string }>;
  logoutUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    async function loadAuthState() {
      try {
        const token = await getAccessToken();
        setIsLoggedIn(!!token);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    loadAuthState();
  }, []);

  async function loginUser(email: string, password: string) {
    const result = await login({ email, password });
    await saveAccessToken(result.access_token);
    setIsLoggedIn(true);
    return result;
  }

  async function registerUser(input: RegisterInput) {
    const result = await register(input);
    await saveAccessToken(result.access_token);
    setIsLoggedIn(true);
    return result;
  }

  async function logoutUser() {
    await removeAccessToken();
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, isCheckingAuth, loginUser, registerUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
