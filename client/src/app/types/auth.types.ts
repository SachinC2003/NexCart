export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
  createdAt: string;
  location: string | null;
  isActive: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  deviceName?: string;
}

export interface AuthResponse {
  accessToken: string;
  message?: string;
}

export interface AuthSession {
  sessionId: string;
  deviceName?: string | null;
  browser?: string | null;
  os?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  isCurrent?: boolean;
}

export interface AuthSessionsResponse {
  message?: string;
  sessions: AuthSession[];
}
