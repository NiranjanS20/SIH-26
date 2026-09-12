/**
 * API Client for Dongri Buzurg Backend
 * Thin fetch wrapper that unwraps the Envelope response format.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface Envelope<T> {
  success: boolean;
  data: T | null;
  meta: { model_version: string; computed_at: string } | null;
  error: { code: string; message: string } | null;
}

export class ApiError extends Error {
  code: string;
  status: number;
  
  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Typed fetch wrapper. Unwraps the Envelope and returns only the data payload.
 * Throws ApiError on failure.
 */
export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    signal,
  });
  
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      body?.error?.message || body?.detail || `HTTP ${response.status}`,
      body?.error?.code || 'HTTP_ERROR',
      response.status
    );
  }
  
  const envelope: Envelope<T> = await response.json();
  
  if (!envelope.success || envelope.error) {
    throw new ApiError(
      envelope.error?.message || 'Unknown API error',
      envelope.error?.code || 'API_ERROR',
      response.status
    );
  }
  
  return envelope.data as T;
}

/**
 * Typed POST wrapper for mutations (what-if simulation, etc.)
 */
export async function apiPost<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });
  
  if (!response.ok) {
    const respBody = await response.json().catch(() => ({}));
    throw new ApiError(
      respBody?.error?.message || respBody?.detail || `HTTP ${response.status}`,
      respBody?.error?.code || 'HTTP_ERROR',
      response.status
    );
  }
  
  const envelope: Envelope<T> = await response.json();
  
  if (!envelope.success || envelope.error) {
    throw new ApiError(
      envelope.error?.message || 'Unknown API error',
      envelope.error?.code || 'API_ERROR',
      response.status
    );
  }
  
  return envelope.data as T;
}

/**
 * Simple GET for endpoints that don't use the Envelope format (e.g. /health)
 */
export async function apiGetRaw<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    signal,
  });
  if (!response.ok) {
    throw new ApiError(`HTTP ${response.status}`, 'HTTP_ERROR', response.status);
  }
  return response.json();
}
