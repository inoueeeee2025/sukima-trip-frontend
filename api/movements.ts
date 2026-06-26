import { apiRequest } from "@/api/client";

//今日の移動データのレスポンス型
export type TodayMovementResponse = {
  date: string;
  real_distance_km: number;
  virtual_distance_km: number;
  used_virtual_distance_km: number;
  remaining_distance_km: number;
};

//累計の移動データのレスポンス型
export type TotalMovementResponse = {
  total_real_distance_km: number;
};

type UpdateTodayMovementInput = {
  real_distance_km: number;
  used_virtual_distance_km: number;
};

type UpdateTodayMovementResponse = {
  message: string;
};

//今日の移動データを取得する関数
export function getTodayMovements(accessToken: string){
  return apiRequest<TodayMovementResponse>("/movements/today",{
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    }
  });
}

export function updateTodayMovement(
  input: UpdateTodayMovementInput,
  accessToken: string,
) {
  return apiRequest<UpdateTodayMovementResponse>("/movements/today", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: input,
  });
}

//累計の移動データを取得する関数
export function getTotalMovements(accessToken: string){
  return apiRequest <TotalMovementResponse>("/movements/total",{
    method: "GET",
    headers: {
        Authorization: `Bearer ${accessToken}`
    }
  })
}
