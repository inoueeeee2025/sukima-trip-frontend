import { apiRequest } from "@/api/client";

export type ProfileResponse = {
    id: string;
    name: string;
    gender?: string;
    email?: string;
};

export function getProfile(accessToken: string){
    return apiRequest<ProfileResponse>("/profile",{
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
}