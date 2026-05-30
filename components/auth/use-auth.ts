import { useEffect, useState } from "react";

import { login } from "@/api/auth";
import {
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
} from "@/components/auth/auth-storage";

export function useAuth() {
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

  async function logoutUser() {
    await removeAccessToken();
    setIsLoggedIn(false);
  }

  return {
    isLoggedIn,
    isCheckingAuth,
    loginUser,
    logoutUser,
  };
}