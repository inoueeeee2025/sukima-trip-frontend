import { apiRequest } from "@/api/client";

export type CoinResponse = {
  balance: number;
};

export function getCoinBalance(accessToken: string) {
  return apiRequest<CoinResponse>("/coins", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
