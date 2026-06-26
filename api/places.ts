import { GOOGLE_MAPS_API_KEY } from "@/api/config";

export async function getPlaceFirstPhotoUrl(placeId: string): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?key=${GOOGLE_MAPS_API_KEY}`,
      { headers: { "X-Goog-FieldMask": "photos" } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const photoName: string | undefined = data.photos?.[0]?.name;
    if (!photoName) return null;
    return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${GOOGLE_MAPS_API_KEY}`;
  } catch {
    return null;
  }
}
