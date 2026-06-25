import { router } from "expo-router";

import { API_BASE_URL } from "@/api/config";
import { apiRequest } from "@/api/client";
import { removeAccessToken } from "@/components/auth/auth-storage";

export type ProfileResponse = {
    id: string;
    name: string;
    gender?: string;
    avatar_url?: string;
};

export function getProfile(accessToken: string){
    return apiRequest<ProfileResponse>("/profile",{
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
}

export async function uploadAvatar(uri: string, accessToken: string): Promise<{ avatar_url: string }> {
    const filename = uri.split("/").pop() ?? "avatar.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    const formData = new FormData();
    formData.append("avatar", { uri, name: filename, type: mimeType } as unknown as Blob);

    const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
    });

    const data = await response.json().catch(() => null);
    if (response.status === 401) {
      await removeAccessToken();
      router.replace("/(auth)/login");
      throw new Error("セッションが切れました。再度ログインしてください。");
    }
    if (!response.ok) throw new Error(data?.error ?? "画像のアップロードに失敗しました");
    return data;
}
