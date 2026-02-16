const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

async function apiCall<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// Auth
export const authApi = {
  register: (phoneNumber: string, password: string, email?: string) =>
    apiCall('/auth/register', { method: 'POST', body: { phoneNumber, password, email } }),
  login: (phoneNumber: string, password: string) =>
    apiCall('/auth/login', { method: 'POST', body: { phoneNumber, password } }),
  me: (token: string) =>
    apiCall('/auth/me', { token }),
};

// Listings
export const listingsApi = {
  getAll: () => apiCall<{ listings: any[]; total: number }>('/listings'),
  getById: (id: string) => apiCall(`/listings/${id}`),
  create: (data: any, token: string) =>
    apiCall('/listings', { method: 'POST', body: data, token }),
};

// Escrow
export const escrowApi = {
  initiate: (listingId: string, token: string) =>
    apiCall('/escrow/initiate', { method: 'POST', body: { listingId }, token }),
  confirmPayment: (id: string, token: string) =>
    apiCall(`/escrow/${id}/confirm-payment`, { method: 'POST', token }),
  get: (id: string) =>
    apiCall(`/escrow/${id}`),
  resolve: (id: string, action: 'ACCEPT' | 'REJECT', token: string) =>
    apiCall(`/escrow/${id}/resolve`, { method: 'POST', body: { action }, token }),
};

// NID
export const nidApi = {
  verify: (nidNumber: string, dateOfBirth: string, fullName: string, token: string) =>
    apiCall('/nid/verify', { method: 'POST', body: { nidNumber, dateOfBirth, fullName }, token }),
};
