export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: unknown;
  requestId?: string;
}

export interface LoginData {
  accessToken: string;
  fullName: string;
  role: string;
}

export type LoginResponse = ApiResponse<LoginData>;
