import { apiRequest } from "@/api/client";

export type VisitedPlace = {
  id: string;
  user_id: string;
  place_id: string;
  place_name: string;
  visited_at: string;
};

export type SaveVisitedPlaceRequest = {
  place_id: string;
  place_name: string;
};

export function getVisitedPlaces(accessToken: string) {
  return apiRequest<VisitedPlace[]>("/visited-places", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function saveVisitedPlace(body: SaveVisitedPlaceRequest, accessToken: string) {
  return apiRequest<{ message: string }>("/visited-places", {
    method: "POST",
    body,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
