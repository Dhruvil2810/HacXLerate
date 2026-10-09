export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

const RAW_API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const BASE_HOST = RAW_API_URL.replace(/\/api\/v1$/, '');
const API_BASE = BASE_HOST ? `${BASE_HOST}/api/v1` : '/api/v1';
const HEALTH_URL = BASE_HOST ? `${BASE_HOST}/health` : '/health';

export async function fetchHealth(): Promise<{ status: string; database: string; version: string; uptimeSeconds: number }> {
  try {
    const res = await fetch(HEALTH_URL);
    if (!res.ok) {
      throw new Error(`Health check failed with status: ${res.status}`);
    }
    const json: ApiResponse = await res.json();
    return json.data;
  } catch (err: any) {
    return {
      status: 'offline',
      database: 'unreachable',
      version: '1.0.0',
      uptimeSeconds: 0,
    };
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${normalizedEndpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to connect to the backend server.',
      },
    };
  }
}
