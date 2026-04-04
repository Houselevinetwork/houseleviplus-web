//  HTTP Client 
// Core fetcher used by all services. Configure once at app startup.

let _baseUrl = '';
let _getToken: (() => string | null) | null = null;

export function configureClient(options: {
  baseUrl: string;
  getToken?: () => string | null;
}) {
  _baseUrl  = options.baseUrl;
  _getToken = options.getToken ?? null;
}

export function getBaseUrl() { return _baseUrl; }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token   = _getToken?.();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${_baseUrl}${path}`, { ...options, headers });

  if (!res.ok) {
    let error: { message: string; code?: string; statusCode: number };
    try   { error = await res.json(); }
    catch { error = { message: res.statusText, statusCode: res.status }; }
    throw error;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const http = {
  get:    <T>(path: string)                => request<T>(path, { method: 'GET' }),
  post:   <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)                => request<T>(path, { method: 'DELETE' }),
};
