import { router } from "expo-router";

import { API_BASE_URL } from "./config";
import { removeAccessToken } from "@/components/auth/auth-storage";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    await removeAccessToken();
    router.replace("/(auth)/login");
    throw new Error("セッションが切れました。再度ログインしてください。");
  }

  if (!response.ok) {
    throw new Error(data?.error ?? "通信エラーが発生しました");
  }

  return data as T;
}
