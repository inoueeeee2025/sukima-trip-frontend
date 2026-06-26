import { apiRequest } from "@/api/client";

export type CoinResponse = {
  balance: number;
};

export type TodayCoinsResponse = {
  earned_today: number;
};

export function getCoinBalance(accessToken: string) {
  return apiRequest<CoinResponse>("/coins", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function getTodayCoins(accessToken: string) {
  return apiRequest<TodayCoinsResponse>("/coins/today", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
