const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface Address {
  id: string;
  webUserId: string;
  label: string;
  recipientName: string;
  addressLine1: string;
  suburb: string | null;
  city: string;
  deliveryInstructions: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressInput {
  label?: string;
  recipientName: string;
  addressLine1: string;
  suburb?: string;
  city: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

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

export const getAddresses = () => apiRequest<Address[]>('/web/api/addresses');
export const createAddress = (data: AddressInput) => apiRequest<Address>('/web/api/addresses', { method: 'POST', body: JSON.stringify(data) });
export const updateAddress = (id: string, data: AddressInput) => apiRequest<Address>(`/web/api/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAddress = (id: string) => apiRequest<{ success: boolean }>(`/web/api/addresses/${id}`, { method: 'DELETE' });
export const setDefaultAddress = (id: string) => apiRequest<{ success: boolean }>(`/web/api/addresses/${id}/default`, { method: 'PATCH' });
