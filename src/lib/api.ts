const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit & { skipJson?: boolean } = {}
): Promise<T> {
  const { skipJson, ...fetchOpts } = options;
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...fetchOpts, headers });
  const data = skipJson ? null : await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string })?.message || res.statusText || 'Request failed');
  return (data ?? {}) as T;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string; fullName: string; role: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, fullName: string) =>
      request<{ token: string; user: { id: string; email: string; fullName: string; role: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      }),
    me: () => request<{ id: string; email: string; fullName: string; role: string }>('/auth/me'),
  },
  assets: {
    list: (params?: { zone?: string; type?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<import('../types/database').InfrastructureAsset[]>(`/assets${q ? `?${q}` : ''}`);
    },
    get: (assetId: string) =>
      request<import('../types/database').InfrastructureAsset>(`/assets/${encodeURIComponent(assetId)}`),
    create: (body: Record<string, unknown>) =>
      request<import('../types/database').InfrastructureAsset>('/assets', { method: 'POST', body: JSON.stringify(body) }),
    update: (assetId: string, body: Record<string, unknown>) =>
      request<import('../types/database').InfrastructureAsset>(`/assets/${encodeURIComponent(assetId)}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    delete: (assetId: string) =>
      request<{ message: string }>(`/assets/${encodeURIComponent(assetId)}`, { method: 'DELETE' }),
  },
  complaints: {
    list: (params?: { status?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<import('../types/database').Complaint[]>(`/complaints${q ? `?${q}` : ''}`);
    },
    get: (id: string) => request<import('../types/database').Complaint>(`/complaints/${id}`),
    create: (formData: FormData) =>
      request<import('../types/database').Complaint>('/complaints', {
        method: 'POST',
        body: formData,
      }),
    updateStatus: (id: string, status: 'Pending' | 'In Progress' | 'Resolved') =>
      request<import('../types/database').Complaint>(`/complaints/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    submitFeedback: (id: string, rating: number, comment?: string) =>
      request<import('../types/database').Complaint>(`/complaints/${id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment: comment || '' }),
      }),
  },
  audit: {
    list: (limit?: number) =>
      request<import('../types/database').AuditLog[]>(`/audit${limit ? `?limit=${limit}` : ''}`),
  },
  analytics: {
    // New centralized dashboard stats endpoint
    dashboard: () => request<import('../types/database').DashboardAnalytics>('/dashboard/stats'),
  },
  admin: {
    createOfficial: (email: string, password: string, fullName: string) =>
      request<{ user: { id: string; email: string; fullName: string; role: string } }>('/admin/officials', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      }),
  },
};
