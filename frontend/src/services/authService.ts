// authService.ts — handles login API call and JWT storage
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'moil_auth_token';

export interface AuthUser {
  sub: string;
  name: string;
  role: 'admin' | 'site_manager' | 'industry_viewer';
  display_name: string;
  exp: number;
}

export interface LoginResponse {
  token: string;
  role: string;
  name: string;
  display_name: string;
}

/** Decode JWT payload without verification (verification happens on backend). */
function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const base64Payload = token.split('.')[1];
    const decoded = JSON.parse(atob(base64Payload));
    return decoded as AuthUser;
  } catch {
    return null;
  }
}

export async function loginUser(username: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Invalid credentials');
  }

  const data: LoginResponse = await res.json();
  localStorage.setItem(TOKEN_KEY, data.token);

  const payload = decodeJwtPayload(data.token);
  if (!payload) throw new Error('Invalid token received from server');

  return { ...payload, display_name: data.display_name };
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const token = getStoredToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // Check expiry
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return payload;
}

export function logoutUser(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Returns the Authorization header value for API calls. */
export function getAuthHeader(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
