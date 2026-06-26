import { apiRequest } from "@/api/client";

export type Favorite = {
  id: string;
  user_id: string;
  place_id: string;
  name: string;
  created_at: string;
  coin_amount: number;
  description: string;
  photo_url: string;
};

export function getFavorites(accessToken: string) {
  return apiRequest<Favorite[]>("/favorites", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}


export function deleteFavorite(id: string, accessToken: string) {
  return apiRequest<{ message: string }>(`/favorites/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
