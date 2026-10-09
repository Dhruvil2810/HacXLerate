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

const API_BASE = '/api/v1';

export async function fetchHealth(): Promise<{ status: string; database: string; version: string; uptimeSeconds: number }> {
  try {
    const res = await fetch('/health');
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
  const url = endpoint.startsWith('/') ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`;
  
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
