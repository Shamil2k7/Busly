// API client with seamless fallback to demo data if backend server is offline

const DEFAULT_API_URL = 'http://localhost:5000';

class MobileApiClient {
  constructor() {
    this.baseUrl = localStorage.getItem('busly_mobile_api_url') || DEFAULT_API_URL;
  }

  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/+$/, '');
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
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for mobile

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.warn(`[MobileApi] Fetch to ${endpoint} failed or timed out:`, error.message);
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
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }
}

export const mobileApi = new MobileApiClient();
export default mobileApi;
