import type { WebUser } from './auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data as T;
}

export function getProfile(): Promise<WebUser> {
  return apiRequest('/web/api/profile');
}

export function updateProfile(data: { whatsappNumber?: string | null }) {
  return apiRequest<WebUser>('/web/api/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function changePassword(data: { currentPassword: string; newPassword: string }) {
  return apiRequest<{ success: boolean; message: string }>('/web/api/profile/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
