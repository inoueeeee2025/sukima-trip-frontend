import { apiRequest } from "@/api/client";

export type Spot = {
  place_id: string;
  name: string;
  lat: number;
  lng: number;
  distance_km: number;
};

export type NearestSpotResponse = {
  place_id: string;
  name: string;
  distance_km: number;
  bearing: number;
};

export type ArriveRequest = {
  place_name: string;
};

export type ArriveResponse = {
  message: string;
  coin_earned: number;
  balance: number;
  wiki_summary: string;
  photo_url: string;
};

export function getSpots(lat: number, lng: number, accessToken: string) {
  return apiRequest<Spot[]>(`/spots?lat=${lat}&lng=${lng}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function getNearestSpot(lat: number, lng: number, accessToken: string) {
  return apiRequest<NearestSpotResponse>(`/spots/nearest?lat=${lat}&lng=${lng}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function arriveAtSpot(placeId: string, body: ArriveRequest, accessToken: string) {
  return apiRequest<ArriveResponse>(`/spots/${placeId}/arrive`, {
    method: "POST",
    body,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function likeSpot(placeId: string, placeName: string, accessToken: string) {
  return apiRequest<{ message: string }>(`/spots/${placeId}/like`, {
    method: "POST",
    body: { place_name: placeName },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function unlikeSpot(placeId: string, accessToken: string) {
  return apiRequest<{ message: string }>(`/spots/${placeId}/like`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
