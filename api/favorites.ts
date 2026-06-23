import { apiRequest } from "@/api/client";

export type Favorite = {
  id: string;
  user_id: string;
  place_id: string;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
};

export type SaveFavoriteRequest = {
  place_id: string;
  place_name: string;
  latitude: number;
  longitude: number;
};

export function getFavorites(accessToken: string) {
  return apiRequest<Favorite[]>("/favorites", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function saveFavorite(body: SaveFavoriteRequest, accessToken: string) {
  return apiRequest<{ message: string }>("/favorites", {
    method: "POST",
    body,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function deleteFavorite(id: string, accessToken: string) {
  return apiRequest<{ message: string }>(`/favorites/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
