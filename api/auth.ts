//共通通信処理 apiRequest を使って、認証APIを画面から呼びやすい形にまとめるファイル。認証専用の窓口

import { apiRequest } from './client';

type AuthResponse = {
  access_token: string;
  user_id: string;
};

type RegisterInput = {
  email: string;
  password: string;
  name: string;
  gender?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export function register(input: RegisterInput) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: input,
  });
}

export function login(input: LoginInput) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: input,
  });
}



