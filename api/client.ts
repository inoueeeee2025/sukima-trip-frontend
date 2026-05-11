//目的：fetchを毎回画面に直書きしないようにするため

import { API_BASE_URL } from "./config";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

// body は「送信したいデータ本体」です。
// たとえばログインならこういう部分です。
// {
//   email: 'test@example.com',
//   password: 'password123'
// }
// これを body として渡して、JSON.stringify(body) で API に送れる形にしています。

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? "API request failed");
  }//共通エラーハンドリング

  return data as T;
}

//ここで理解してほしいのは3つだけです。
// API_BASE_URL と path をつなげている
// body があるときだけ JSON.stringify(body) している
// 失敗したら throw new Error(...) している
