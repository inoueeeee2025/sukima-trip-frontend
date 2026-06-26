

import { AUTH_BASE_URL } from './config';

type AuthResponse = {
  access_token: string;
  user_id: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  gender?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

async function authRequest<T>(path: string,body: unknown): Promise<T>{ 
  const response = await fetch(`${AUTH_BASE_URL}${path}`,{
    method: "POST",
    headers: {
      "Content-Type" : "application/json",
    },
    body: JSON.stringify(body),
  });


const data = await response.json().catch(() => null);

if(!response.ok){
  throw new Error(data?.error ?? "Auth request failed");
}

return data as T;
}




export function register(input: RegisterInput) {
  return authRequest<AuthResponse>('/register', input);
}

export function login(input: LoginInput) {
  return authRequest<AuthResponse>('/login', input);
}



