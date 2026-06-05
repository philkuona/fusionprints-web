/**
 * Typed fetch wrappers for web auth API endpoints.
 * All calls use credentials: 'include' so the session cookie is sent.
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface WebUser {
  id: string;
  email: string;
  emailVerified: boolean;
  whatsappNumber: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface ApiError {
  error: string;
  message?: string;
  issues?: Record<string, string[]>;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: 'include',
    cache: 'no-store', // never serve a stale /me (esp. right after logout)
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw data as ApiError;
  return data as T;
}

export function signup(data: {
  email: string;
  password: string;
  whatsappNumber?: string;
}) {
  return apiRequest<{ message: string }>('/web/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function verifyEmail(token: string) {
  return apiRequest<{ success: boolean; message: string }>(
    `/web/api/auth/verify?token=${encodeURIComponent(token)}`,
  );
}

export function login(data: { email: string; password: string }) {
  return apiRequest<WebUser>('/web/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function logout() {
  return apiRequest<{ success: boolean }>('/web/api/auth/logout', {
    method: 'POST',
  });
}

/**
 * Backend logout URL for a top-level browser navigation. This is the reliable
 * way to sign out: the session cookie rides the navigation, the server destroys
 * the session + clears the cookie, then 302-redirects home — no dependence on
 * fetch/SPA state/cache.
 */
export const logoutUrl = () => `${API}/web/api/auth/logout`;

export function getMe() {
  return apiRequest<WebUser>('/web/api/auth/me');
}
