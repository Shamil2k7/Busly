// API client connecting directly to live Busly backend on Vercel

export const LIVE_BACKEND_URL = 'https://backend-4um6.vercel.app';
const DEFAULT_API_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || LIVE_BACKEND_URL;

class MobileApiClient {
  constructor() {
    let saved = localStorage.getItem('busly_mobile_api_url');
    // If previously saved URL pointed to localhost/127.0.0.1 or is empty, automatically update to live backend
    if (!saved || saved.includes('localhost') || saved.includes('127.0.0.1')) {
      saved = DEFAULT_API_URL;
      localStorage.setItem('busly_mobile_api_url', saved);
    }
    this.baseUrl = saved.replace(/\/+$/, '');
  }

  setBaseUrl(url) {
    this.baseUrl = (url || DEFAULT_API_URL).replace(/\/+$/, '');
    localStorage.setItem('busly_mobile_api_url', this.baseUrl);
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  getToken() {
    return localStorage.getItem('busly_mobile_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('busly_mobile_token', token);
    } else {
      localStorage.removeItem('busly_mobile_token');
    }
  }

  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for serverless / cloud API

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.warn(`[MobileApi] Request to ${cleanEndpoint} failed:`, error.message);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const mobileApi = new MobileApiClient();
export default mobileApi;
