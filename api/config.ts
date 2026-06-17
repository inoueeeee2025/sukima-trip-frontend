export const API_ORIGIN =
  process.env.EXPO_PUBLIC_API_ORIGIN ?? "http://127.0.0.1:8080";

export const API_BASE_URL = `${API_ORIGIN}/api`;
export const AUTH_BASE_URL = `${API_ORIGIN}/auth`;

export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";